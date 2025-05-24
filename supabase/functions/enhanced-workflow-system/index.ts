
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WORKFLOW_STAGES = ['field_officer', 'manager', 'director', 'chairperson', 'ceo'];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      action,
      loan_id: loanId, 
      approver_id: approverId,
      notes,
      decision // 'approve' or 'reject'
    } = await req.json();

    if (action === 'process_workflow') {
      return await processWorkflowAction(supabaseClient, loanId, approverId, decision, notes);
    } else if (action === 'generate_weekly_report') {
      return await generateWeeklyReport(supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in enhanced workflow system:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processWorkflowAction(supabaseClient: any, loanId: string, approverId: string, decision: string, notes: string) {
  // Get current loan and workflow data
  const { data: loanData, error: loanError } = await supabaseClient
    .from('loan_applications')
    .select(`
      *,
      loan_application_workflow(*)
    `)
    .eq('id', loanId)
    .single();

  if (loanError || !loanData) {
    throw new Error("Loan application not found");
  }

  const workflow = loanData.loan_application_workflow;
  const currentStage = workflow?.current_stage || 'field_officer';
  const currentStageIndex = WORKFLOW_STAGES.indexOf(currentStage);

  // Get approver details
  const { data: approverData } = await supabaseClient
    .from('profiles')
    .select('full_name, role')
    .eq('id', approverId)
    .single();

  const approverName = approverData?.full_name || 'Unknown';
  const approverRole = approverData?.role || currentStage;

  let nextStage = null;
  let applicationStatus = loanData.status;
  let workflowUpdate: any = {};

  if (decision === 'approve') {
    // Mark current stage as approved
    workflowUpdate[`${currentStage}_approved`] = true;
    workflowUpdate[`${currentStage}_notes`] = notes;
    workflowUpdate[`${currentStage}_name`] = approverName;

    // Move to next stage or final approval
    if (currentStageIndex < WORKFLOW_STAGES.length - 1) {
      nextStage = WORKFLOW_STAGES[currentStageIndex + 1];
      workflowUpdate.current_stage = nextStage;
      applicationStatus = `pending_${nextStage}`;
    } else {
      // CEO final approval
      applicationStatus = 'approved';
    }
  } else {
    // Rejection stops the workflow
    workflowUpdate[`${currentStage}_approved`] = false;
    workflowUpdate[`${currentStage}_notes`] = notes;
    workflowUpdate[`${currentStage}_name`] = approverName;
    
    applicationStatus = currentStage === 'ceo' ? 'rejected_final' : 'rejected';
  }

  // Update workflow
  const { error: workflowError } = await supabaseClient
    .from('loan_application_workflow')
    .update(workflowUpdate)
    .eq('loan_application_id', loanId);

  if (workflowError) throw workflowError;

  // Update application status
  const { error: appError } = await supabaseClient
    .from('loan_applications')
    .update({ 
      status: applicationStatus,
      ...(decision === 'reject' ? { rejection_reason: notes } : {}),
      last_updated: new Date().toISOString()
    })
    .eq('id', loanId);

  if (appError) throw appError;

  // Create notification
  if (loanData.created_by) {
    let message = '';
    if (decision === 'approve') {
      if (nextStage) {
        message = `Your loan application has been approved by ${approverName} (${currentStage.replace('_', ' ')}) and moved to ${nextStage.replace('_', ' ')} stage.`;
      } else {
        message = `🎉 CONGRATULATIONS! Your loan application has been FULLY APPROVED by CEO ${approverName}!`;
      }
    } else {
      message = currentStage === 'ceo' 
        ? `❌ FINAL REJECTION: Your loan application has been rejected by CEO ${approverName}.`
        : `Your loan application was rejected by ${approverName} (${currentStage.replace('_', ' ')}).`;
    }

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: loanData.created_by,
        message,
        related_to: 'loan_application',
        entity_id: loanId
      });
  }

  // Log the action
  await supabaseClient
    .from('loan_workflow_log')
    .insert({
      loan_application_id: loanId,
      action: `${decision === 'approve' ? 'Approved' : 'Rejected'} by ${currentStage}`,
      performed_by: approverId
    });

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Application ${decision}d successfully`,
      status: applicationStatus,
      next_stage: nextStage,
      is_final: currentStage === 'ceo'
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function generateWeeklyReport(supabaseClient: any) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);

  const roles = ['manager', 'director', 'chairperson', 'ceo'];
  const reports = [];

  for (const role of roles) {
    let query = supabaseClient
      .from('loan_applications')
      .select(`
        *,
        loan_application_workflow(*)
      `)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    // Filter based on role
    if (role !== 'ceo') {
      // For other roles, filter applications that reached their stage
      query = query.or(`loan_application_workflow.current_stage.eq.${role},loan_application_workflow.current_stage.in.(${WORKFLOW_STAGES.slice(WORKFLOW_STAGES.indexOf(role) + 1).join(',')}),status.eq.approved`);
    }

    const { data: applications } = await query;

    if (applications) {
      let totalApps = applications.length;
      let approvedApps = 0;
      let rejectedApps = 0;
      let pendingApps = 0;
      let totalAmount = 0;
      let approvedAmount = 0;

      applications.forEach(app => {
        const amount = parseFloat(app.loan_amount?.replace(/,/g, '') || '0');
        totalAmount += amount;

        if (role === 'ceo') {
          if (app.status === 'approved') {
            approvedApps++;
            approvedAmount += amount;
          } else if (app.status.includes('rejected')) {
            rejectedApps++;
          } else {
            pendingApps++;
          }
        } else {
          const workflow = app.loan_application_workflow;
          const stageApproved = workflow?.[`${role}_approved`];
          
          if (stageApproved === true) {
            approvedApps++;
            approvedAmount += amount;
          } else if (stageApproved === false) {
            rejectedApps++;
          } else {
            pendingApps++;
          }
        }
      });

      const reportData = {
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        role,
        total_applications: totalApps,
        approved_applications: approvedApps,
        rejected_applications: rejectedApps,
        pending_applications: pendingApps,
        total_loan_amount: totalAmount,
        approved_loan_amount: approvedAmount,
        approval_rate: totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0
      };

      // Insert report
      await supabaseClient
        .from('weekly_reports')
        .upsert({
          report_week: weekStart.toISOString().split('T')[0],
          role_type: role,
          ...reportData,
          report_data: reportData
        });

      reports.push(reportData);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: "Weekly reports generated successfully",
      reports
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
