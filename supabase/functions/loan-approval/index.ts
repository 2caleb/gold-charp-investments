
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define workflow stages in CORRECT order - Chairperson before CEO
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

    console.log("=== Loan Approval Function Called ===");
    
    // Parse request body
    const requestBody = await req.json();
    console.log("Request body received:", requestBody);

    const { 
      loan_id: loanId, 
      action,
      notes, 
      approver_id: approverId,
      downsized_amount
    } = requestBody;

    if (!loanId || !action) {
      console.error("Missing required parameters:", { loanId, action });
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

    console.log("Processing loan action:", { loanId, action, approverId });

    // Get the loan application
    const { data: loanApplication, error: loanError } = await supabaseClient
      .from('loan_applications')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError || !loanApplication) {
      console.error("Loan application fetch error:", loanError);
      return new Response(
        JSON.stringify({ error: loanError?.message || "Loan application not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Loan application found:", loanApplication.id);

    // Get or create workflow
    let { data: workflow, error: workflowError } = await supabaseClient
      .from('loan_applications_workflow')
      .select('*')
      .eq('loan_application_id', loanId)
      .maybeSingle();

    if (workflowError) {
      console.error("Workflow fetch error:", workflowError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch workflow: ${workflowError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create workflow if it doesn't exist
    if (!workflow) {
      console.log("No workflow found, creating new workflow for application:", loanId);
      
      const { data: newWorkflow, error: createError } = await supabaseClient
        .from('loan_applications_workflow')
        .insert({
          loan_application_id: loanId,
          current_stage: 'manager',
          field_officer_approved: true,
          manager_approved: null,
          director_approved: null,
          chairperson_approved: null,
          ceo_approved: null,
          field_officer_notes: 'Application submitted by field officer',
          manager_notes: null,
          director_notes: null,
          chairperson_notes: null,
          ceo_notes: null
        })
        .select('*')
        .single();

      if (createError) {
        console.error("Failed to create workflow:", createError);
        return new Response(
          JSON.stringify({ error: `Failed to create workflow: ${createError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      workflow = newWorkflow;
      console.log("Created new workflow:", workflow.id);
    }

    console.log("Using workflow:", { id: workflow.id, current_stage: workflow.current_stage });
    
    const currentStage = workflow.current_stage || 'manager';
    
    // Execute the action (approve or reject)
    if (action === 'approve' || action === 'reject') {
      const approved = action === 'approve';
      console.log(`Processing ${approved ? 'approval' : 'rejection'} at stage: ${currentStage}`);
      
      // Get current workflow stage index
      const currentStageIndex = WORKFLOW_STAGES.indexOf(currentStage);
      if (currentStageIndex === -1) {
        console.error("Invalid stage:", currentStage);
        return new Response(
          JSON.stringify({ error: `Invalid stage: ${currentStage}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Determine next stage and application status
      let nextStage = null;
      let applicationStatus = null;
      
      if (approved) {
        // If approved, move to next stage
        if (currentStageIndex < WORKFLOW_STAGES.length - 1) {
          nextStage = WORKFLOW_STAGES[currentStageIndex + 1];
          applicationStatus = `pending_${nextStage}`;
          console.log(`Moving to next stage: ${nextStage}`);
        } else {
          // Final approval by CEO
          applicationStatus = 'approved';
          console.log("Final approval by CEO");
        }
      } else {
        // If rejected at any stage
        applicationStatus = 'rejected';
        console.log(`Application rejected at ${currentStage} stage`);
      }
      
      // Fetch the approver's name for better notifications
      const { data: approverData } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', approverId)
        .single();
        
      const approverName = approverData?.full_name || currentStage;
      console.log("Approver name:", approverName);

      // Update the workflow record with approval/rejection
      const updateObject: Record<string, any> = {
        [`${currentStage}_approved`]: approved,
        [`${currentStage}_notes`]: notes || (approved ? 'Approved' : 'Rejected'),
        updated_at: new Date().toISOString()
      };
      
      // Only update next stage if moving forward
      if (nextStage) {
        updateObject.current_stage = nextStage;
      } else if (!approved) {
        // If rejected, mark as completed
        updateObject.current_stage = 'rejected';
      }
      
      console.log("Updating workflow with:", updateObject);
      
      // Update workflow
      const { data: updatedWorkflow, error: workflowUpdateError } = await supabaseClient
        .from('loan_applications_workflow')
        .update(updateObject)
        .eq('id', workflow.id)
        .select('*')
        .single();

      if (workflowUpdateError) {
        console.error("Workflow update error:", workflowUpdateError);
        throw workflowUpdateError;
      }

      console.log("Workflow updated successfully:", updatedWorkflow.id);

      // Update application status
      const appUpdateData: Record<string, any> = { 
        status: applicationStatus,
        last_updated: new Date().toISOString()
      };

      if (approved) {
        appUpdateData.approval_notes = notes || 'Approved';
      } else {
        appUpdateData.rejection_reason = notes || 'Rejected';
      }

      console.log("Updating application with:", appUpdateData);

      const { data: updatedApplication, error: applicationUpdateError } = await supabaseClient
        .from('loan_applications')
        .update(appUpdateData)
        .eq('id', loanId)
        .select('*')
        .single();

      if (applicationUpdateError) {
        console.error("Application update error:", applicationUpdateError);
        throw applicationUpdateError;
      }

      console.log("Application updated successfully");

      // Create notification for application status change
      let notificationMessage = '';
      
      if (approved) {
        if (nextStage) {
          notificationMessage = `Loan application was approved by ${approverName} and moved to ${nextStage.replace('_', ' ')} stage.`;
        } else {
          notificationMessage = `🎉 FINAL APPROVAL: Loan application has been approved by CEO ${approverName}!`;
        }
      } else {
        if (currentStage === 'ceo') {
          notificationMessage = `❌ FINAL REJECTION: Loan application was rejected by CEO ${approverName}.`;
        } else {
          notificationMessage = `❌ Loan application was rejected by ${approverName} at ${currentStage.replace('_', ' ')} stage.`;
        }
      }
      
      // Only create notification if we have a user ID to send it to
      if (loanApplication.created_by) {
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: loanApplication.created_by,
            message: notificationMessage,
            related_to: 'loan_application',
            entity_id: loanId
          });

        if (notificationError) {
          console.error("Notification creation failed:", notificationError);
        } else {
          console.log("Notification created successfully");
        }
      }

      // Log workflow action with enhanced details
      const { error: logError } = await supabaseClient
        .from('loan_workflow_log')
        .insert({
          loan_application_id: loanId,
          action: approved ? `✅ Approved by ${currentStage}` : `❌ Rejected by ${currentStage}`,
          performed_by: approverId,
          status: applicationStatus
        });

      if (logError) {
        console.error("Workflow log creation failed:", logError);
      } else {
        console.log("Workflow log created successfully");
      }

      console.log("=== Loan Approval Function Completed Successfully ===");

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          workflow: updatedWorkflow,
          application: updatedApplication,
          message: `Workflow ${approved ? 'approved' : 'rejected'} successfully`,
          isFinalDecision: currentStage === 'ceo',
          finalResult: currentStage === 'ceo' ? (approved ? 'SUCCESSFUL' : 'FAILED') : null
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
    console.error("=== CRITICAL ERROR in loan-approval function ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred",
        details: "Check function logs for more information"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
