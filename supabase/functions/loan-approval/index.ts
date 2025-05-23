
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define workflow stages in order - Chairperson is before CEO in the approval flow
const WORKFLOW_STAGES = ['field_officer', 'manager', 'director', 'chairperson', 'ceo'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { 
      loan_id: loanId, 
      action,
      notes, 
      approver_id: approverId,
      downsized_amount
    } = await req.json();

    if (!loanId || !action) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters. Required: loan_id, action" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the loan application and workflow data
    const { data: loanApplication, error: loanError } = await supabaseClient
      .from('loan_applications')
      .select(`
        *,
        loan_application_workflow (*)
      `)
      .eq('id', loanId)
      .single();

    if (loanError || !loanApplication) {
      return new Response(
        JSON.stringify({ error: loanError?.message || "Loan application not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the current workflow and stage
    const workflow = loanApplication.loan_application_workflow;
    const workflowId = workflow?.id;
    
    if (!workflowId) {
      return new Response(
        JSON.stringify({ error: "Workflow data not found for this application" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const currentStage = workflow.current_stage || 'field_officer';
    
    // Execute the action (approve or reject)
    if (action === 'approve' || action === 'reject') {
      const approved = action === 'approve';
      
      // Get current workflow stage index
      const currentStageIndex = WORKFLOW_STAGES.indexOf(currentStage);
      if (currentStageIndex === -1) {
        return new Response(
          JSON.stringify({ error: `Invalid stage: ${currentStage}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Determine next stage
      let nextStage = null;
      let applicationStatus = null;
      
      if (approved) {
        // If approved, move to next stage
        if (currentStageIndex < WORKFLOW_STAGES.length - 1) {
          nextStage = WORKFLOW_STAGES[currentStageIndex + 1];
          applicationStatus = `pending_${nextStage}`;
        } else {
          // Final approval
          applicationStatus = 'approved';
        }
      } else {
        // If rejected, set status to rejected
        applicationStatus = 'rejected';
        
        // If CEO rejects, mark as final rejection
        if (currentStage === 'ceo') {
          applicationStatus = 'rejected_final';
        }
      }
      
      // Fetch the approver's name for better notifications
      const { data: approverData } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', approverId)
        .single();
        
      const approverName = approverData?.full_name || currentStage;

      // Update the workflow record with approval/rejection
      const updateObject: Record<string, any> = {
        [`${currentStage}_approved`]: approved,
        [`${currentStage}_notes`]: notes
      };
      
      // Add approver name if available
      if (approverName) {
        updateObject[`${currentStage}_name`] = approverName;
      }
      
      // Only update next stage if moving forward
      if (nextStage) {
        updateObject.current_stage = nextStage;
      }
      
      // Update workflow
      const { data: updatedWorkflow, error: workflowError } = await supabaseClient
        .from('loan_application_workflow')
        .update(updateObject)
        .eq('id', workflowId)
        .select('*')
        .single();

      if (workflowError) {
        throw workflowError;
      }

      // Update application status
      const { data: updatedApplication, error: applicationError } = await supabaseClient
        .from('loan_applications')
        .update({ 
          status: applicationStatus,
          ...(approved ? {} : { rejection_reason: notes }),
          last_updated: new Date().toISOString()
        })
        .eq('id', loanId)
        .select('*')
        .single();

      if (applicationError) {
        throw applicationError;
      }

      // Create notification for application status change
      let notificationMessage = '';
      
      if (approved) {
        if (nextStage) {
          notificationMessage = `Loan application was approved by ${approverName} and moved to ${nextStage.replace('_', ' ')} stage.`;
        } else {
          notificationMessage = `Loan application has been fully approved by ${approverName}!`;
        }
      } else {
        notificationMessage = `Loan application was rejected by ${approverName}.`;
        
        if (currentStage === 'ceo') {
          notificationMessage = `FINAL REJECTION: Loan application was rejected by ${approverName}.`;
        }
      }
      
      // Only create notification if we have a user ID to send it to
      if (loanApplication.created_by) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: loanApplication.created_by,
            message: notificationMessage,
            related_to: 'loan_application',
            entity_id: loanId
          });
      }

      // Log workflow action
      await supabaseClient
        .from('loan_workflow_log')
        .insert({
          loan_application_id: loanId,
          action: approved ? `Approved by ${currentStage}` : `Rejected by ${currentStage}`,
          performed_by: approverId
        });

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          workflow: updatedWorkflow,
          application: updatedApplication,
          message: `Workflow ${approved ? 'approved' : 'rejected'} successfully`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else if (action === 'downsize') {
      // Handle downsizing logic (adjust loan amount)
      if (!downsized_amount) {
        return new Response(
          JSON.stringify({ error: "Downsized amount is required for downsizing action" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      // Update loan amount
      const { data: updatedApplication, error: applicationError } = await supabaseClient
        .from('loan_applications')
        .update({ 
          loan_amount: downsized_amount,
          downsizing_reason: notes,
          last_updated: new Date().toISOString()
        })
        .eq('id', loanId)
        .select('*')
        .single();

      if (applicationError) {
        throw applicationError;
      }

      // Create notification only if we have a user ID
      if (loanApplication.created_by) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: loanApplication.created_by,
            message: `Your loan amount has been adjusted to ${downsized_amount}.`,
            related_to: 'loan_application',
            entity_id: loanId
          });
      }

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          application: updatedApplication,
          message: "Loan amount adjusted successfully"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Supported actions: approve, reject, downsize" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error processing approval action:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
