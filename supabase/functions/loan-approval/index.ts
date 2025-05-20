
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define workflow stages in order - CEO is the final approver
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
      workflowId, 
      applicationId, 
      stage, 
      approved, 
      notes,
      approverUserId // New field to track who approved/rejected
    } = await req.json();

    if (!workflowId || !applicationId || !stage) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters. Required: workflowId, applicationId, stage" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get current workflow stage
    const currentStageIndex = WORKFLOW_STAGES.indexOf(stage);
    if (currentStageIndex === -1) {
      return new Response(
        JSON.stringify({ error: `Invalid stage: ${stage}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get approver info
    let approverName = "Unknown";
    if (approverUserId) {
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', approverUserId)
        .single();
      
      if (profileData) {
        approverName = profileData.full_name;
      }
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
      if (stage === 'ceo') {
        applicationStatus = 'rejected_final';
      }
    }

    // Update the workflow record with approval/rejection
    const updateObject: Record<string, any> = {
      [`${stage}_approved`]: approved,
      [`${stage}_notes`]: notes,
      [`${stage}_approver`]: approverName // Store approver name
    };
    
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
      .eq('id', applicationId)
      .select('*')
      .single();

    if (applicationError) {
      throw applicationError;
    }

    // Create notification for application status change with approver name
    let notificationMessage = '';
    
    if (approved) {
      if (nextStage) {
        notificationMessage = `Loan application was approved by ${approverName} at ${stage} stage and moved to ${nextStage} stage.`;
      } else {
        notificationMessage = `Loan application has been fully approved by ${approverName}!`;
      }
    } else {
      notificationMessage = `Loan application was rejected by ${approverName} at ${stage} stage.`;
      
      if (stage === 'ceo') {
        notificationMessage = `FINAL REJECTION: Loan application was rejected by ${approverName} (CEO).`;
      }
    }
    
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: updatedApplication.created_by,
        message: notificationMessage,
        related_to: 'loan_application',
        entity_id: applicationId
      });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        workflow: updatedWorkflow,
        application: updatedApplication,
        message: `Workflow ${approved ? 'approved' : 'rejected'} successfully by ${approverName}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
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
