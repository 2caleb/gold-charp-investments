
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define workflow stages in correct order: Field Officer → Manager → Director → Chairman → CEO
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
    const requestBody = await req.json();
    console.log('Processing request:', requestBody);

    const { action, loan_id, approver_id, decision, notes, target_role } = requestBody;

    if (action === 'process_workflow') {
      return await processWorkflow(supabaseClient, loan_id, approver_id, decision, notes || '');
    } else if (action === 'get_weekly_reports') {
      return await getWeeklyReports(supabaseClient, target_role);
    } else if (action === 'generate_weekly_report') {
      return await generateWeeklyReport(supabaseClient);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error: any) {
    console.error("Error in enhanced-workflow-system:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function getWeeklyReports(supabaseClient: any, targetRole: string) {
  try {
    console.log('Fetching weekly reports for role:', targetRole);
    
    const { data, error } = await supabaseClient
      .from('weekly_reports')
      .select('*')
      .eq('role_type', targetRole)
      .order('report_week', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching weekly reports:', error);
      throw new Error(`Failed to fetch weekly reports: ${error.message}`);
    }

    console.log('Successfully fetched', data?.length || 0, 'reports');
    
    return new Response(
      JSON.stringify(data || []),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error('Error in getWeeklyReports:', error);
    throw error;
  }
}

async function generateWeeklyReport(supabaseClient: any) {
  try {
    console.log('Generating weekly reports for all roles');
    
    // Get the start of the current week (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Get the end of the current week (Sunday)
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    console.log('Report period:', currentWeekStart.toISOString(), 'to', currentWeekEnd.toISOString());

    const generatedReports = [];

    // Generate reports for each role
    for (const role of WORKFLOW_STAGES) {
      console.log('Generating report for role:', role);
      
      // Check if report already exists for this week and role
      const { data: existingReport } = await supabaseClient
        .from('weekly_reports')
        .select('id')
        .eq('role_type', role)
        .eq('report_week', currentWeekStart.toISOString().split('T')[0])
        .maybeSingle();

      if (existingReport) {
        console.log('Report already exists for', role, 'this week');
        continue;
      }

      // Calculate statistics for this role
      const stats = await calculateRoleStatistics(supabaseClient, role, currentWeekStart, currentWeekEnd);
      
      // Insert the report
      const { data: newReport, error } = await supabaseClient
        .from('weekly_reports')
        .insert({
          role_type: role,
          report_week: currentWeekStart.toISOString().split('T')[0],
          applications_reviewed: stats.reviewed,
          applications_approved: stats.approved,
          applications_rejected: stats.rejected,
          pending_applications: stats.pending
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting report for', role, ':', error);
      } else {
        console.log('Successfully generated report for', role);
        generatedReports.push(newReport);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Generated ${generatedReports.length} weekly reports`,
        reports: generatedReports
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error('Error in generateWeeklyReport:', error);
    throw error;
  }
}

async function calculateRoleStatistics(supabaseClient: any, role: string, weekStart: Date, weekEnd: Date) {
  try {
    // Get all applications that were in this role's stage during the week
    const { data: applications, error } = await supabaseClient
      .from('loan_applications')
      .select(`
        id,
        status,
        created_at,
        last_updated,
        loan_applications_workflow (
          current_stage,
          ${role}_approved,
          updated_at
        )
      `)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    if (error) {
      console.error('Error fetching applications for stats:', error);
      return { reviewed: 0, approved: 0, rejected: 0, pending: 0 };
    }

    let reviewed = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    // Count applications based on their status and workflow stage
    applications?.forEach((app: any) => {
      const workflow = app.loan_applications_workflow?.[0];
      
      // Count as reviewed if the application reached this role's stage
      if (workflow && (workflow.current_stage === role || app.status.includes(role))) {
        reviewed++;
        
        // Check if approved by this role
        if (workflow[`${role}_approved`] === true) {
          approved++;
        } else if (workflow[`${role}_approved`] === false || app.status === 'rejected') {
          rejected++;
        } else if (workflow.current_stage === role) {
          pending++;
        }
      }
    });

    console.log(`Stats for ${role}:`, { reviewed, approved, rejected, pending });
    return { reviewed, approved, rejected, pending };
  } catch (error: any) {
    console.error('Error calculating role statistics:', error);
    return { reviewed: 0, approved: 0, rejected: 0, pending: 0 };
  }
}

async function processWorkflow(
  supabaseClient: any,
  loanId: string,
  approverId: string,
  decision: 'approve' | 'reject',
  notes: string
) {
  try {
    // Get the loan application
    const { data: loanApplication, error: loanError } = await supabaseClient
      .from('loan_applications')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError || !loanApplication) {
      throw new Error(`Loan application not found: ${loanError?.message}`);
    }

    // Get current workflow data - FIXED TABLE NAME
    const { data: workflowData, error: workflowError } = await supabaseClient
      .from('loan_applications_workflow')
      .select('*')
      .eq('loan_application_id', loanId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (workflowError) {
      console.error('Error fetching workflow:', workflowError);
    }

    // Determine current stage from application status
    let currentStage = 'field_officer';
    if (loanApplication.status.includes('pending_')) {
      currentStage = loanApplication.status.replace('pending_', '');
    }

    console.log('Current stage:', currentStage);
    console.log('Decision:', decision);

    // Process the decision
    if (decision === 'approve') {
      // Get current stage index
      const currentStageIndex = WORKFLOW_STAGES.indexOf(currentStage);
      let nextStage = null;
      let newStatus = 'approved';
      let isFinal = true;

      if (currentStageIndex < WORKFLOW_STAGES.length - 1) {
        // Move to next stage
        nextStage = WORKFLOW_STAGES[currentStageIndex + 1];
        newStatus = `pending_${nextStage}`;
        isFinal = false;
      }

      // Update loan application status
      const { error: updateError } = await supabaseClient
        .from('loan_applications')
        .update({ 
          status: newStatus,
          last_updated: new Date().toISOString()
        })
        .eq('id', loanId);

      if (updateError) {
        throw new Error(`Failed to update loan status: ${updateError.message}`);
      }

      // Log the workflow action - FIXED TABLE NAME
      const { error: workflowLogError } = await supabaseClient
        .from('loan_applications_workflow')
        .insert({
          loan_application_id: loanId,
          current_stage: isFinal ? 'completed' : nextStage,
          [`${currentStage}_approved`]: true,
          [`${currentStage}_notes`]: notes,
          updated_at: new Date().toISOString()
        });

      if (workflowLogError) {
        console.error('Workflow log error:', workflowLogError);
      }

      // Create notification
      if (loanApplication.created_by) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: loanApplication.created_by,
            message: isFinal 
              ? `Your loan application has been fully approved!`
              : `Your loan application was approved by ${currentStage} and moved to ${nextStage}`,
            related_to: 'loan_application',
            entity_id: loanId
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: isFinal ? 'Loan fully approved' : `Approved and moved to ${nextStage}`,
          is_final: isFinal,
          next_stage: nextStage
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } else if (decision === 'reject') {
      // Update loan application to rejected
      const { error: updateError } = await supabaseClient
        .from('loan_applications')
        .update({ 
          status: 'rejected',
          rejection_reason: notes,
          last_updated: new Date().toISOString()
        })
        .eq('id', loanId);

      if (updateError) {
        throw new Error(`Failed to update loan status: ${updateError.message}`);
      }

      // Log the workflow action - FIXED TABLE NAME
      const { error: workflowLogError } = await supabaseClient
        .from('loan_applications_workflow')
        .insert({
          loan_application_id: loanId,
          current_stage: 'rejected',
          [`${currentStage}_approved`]: false,
          [`${currentStage}_notes`]: notes,
          updated_at: new Date().toISOString()
        });

      if (workflowLogError) {
        console.error('Workflow log error:', workflowLogError);
      }

      // Create notification
      if (loanApplication.created_by) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: loanApplication.created_by,
            message: `Your loan application was rejected by ${currentStage}`,
            related_to: 'loan_application',
            entity_id: loanId
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Loan application rejected',
          is_final: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      throw new Error('Invalid decision. Must be "approve" or "reject"');
    }

  } catch (error: any) {
    console.error('Error processing workflow:', error);
    throw error;
  }
}
