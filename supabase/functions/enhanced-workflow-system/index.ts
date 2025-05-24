
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, loan_id, approver_id, decision, notes } = await req.json()

    switch (action) {
      case 'process_workflow':
        return await processWorkflow(supabaseClient, loan_id, approver_id, decision, notes)
      
      case 'generate_weekly_report':
        return await generateWeeklyReports(supabaseClient)
      
      case 'get_weekly_reports':
        return await getWeeklyReports(supabaseClient, req)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function processWorkflow(supabaseClient: any, loanId: string, approverId: string, decision: string, notes: string) {
  console.log('Processing workflow decision:', { loanId, approverId, decision, notes })

  // Get approver profile
  const { data: approver, error: approverError } = await supabaseClient
    .from('profiles')
    .select('full_name, role')
    .eq('id', approverId)
    .single()

  if (approverError || !approver) {
    throw new Error('Approver not found')
  }

  // Get current workflow state
  const { data: workflow, error: workflowError } = await supabaseClient
    .from('loan_application_workflow')
    .select('*')
    .eq('loan_application_id', loanId)
    .single()

  if (workflowError || !workflow) {
    throw new Error('Workflow not found')
  }

  const currentStage = workflow.current_stage
  const approverRole = approver.role

  // Validate that the approver can act on this stage
  if (currentStage !== approverRole) {
    throw new Error(`Cannot approve at ${currentStage} stage with ${approverRole} role`)
  }

  // Update workflow based on decision
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  // Set approval fields based on role
  updateData[`${approverRole}_approved`] = decision === 'approve'
  updateData[`${approverRole}_name`] = approver.full_name
  updateData[`${approverRole}_notes`] = notes

  let nextStage = null
  let finalStatus = null
  let isComplete = false

  if (decision === 'approve') {
    // Determine next stage
    const stageOrder = ['field_officer', 'manager', 'director', 'chairperson', 'ceo']
    const currentIndex = stageOrder.indexOf(currentStage)
    
    if (currentIndex < stageOrder.length - 1) {
      nextStage = stageOrder[currentIndex + 1]
      updateData.current_stage = nextStage
    } else {
      // CEO approved - final approval
      finalStatus = 'approved'
      isComplete = true
    }
  } else {
    // Rejected at any stage
    finalStatus = currentStage === 'ceo' ? 'rejected_final' : 'rejected'
    isComplete = true
  }

  // Update workflow
  const { error: updateError } = await supabaseClient
    .from('loan_application_workflow')
    .update(updateData)
    .eq('loan_application_id', loanId)

  if (updateError) {
    throw new Error('Failed to update workflow')
  }

  // Update loan application status if complete
  if (isComplete && finalStatus) {
    const { error: statusError } = await supabaseClient
      .from('loan_applications')
      .update({ 
        status: finalStatus,
        last_updated: new Date().toISOString()
      })
      .eq('id', loanId)

    if (statusError) {
      throw new Error('Failed to update loan status')
    }
  }

  // Create notification
  const { data: loanApp } = await supabaseClient
    .from('loan_applications')
    .select('client_name, created_by')
    .eq('id', loanId)
    .single()

  if (loanApp) {
    let message = ''
    if (decision === 'approve' && !isComplete) {
      message = `Your loan application has been approved by ${approver.full_name} (${approverRole}) and moved to ${nextStage} stage.`
    } else if (decision === 'approve' && isComplete) {
      message = `Your loan application has been APPROVED by ${approver.full_name} (${approverRole}). Congratulations!`
    } else {
      message = `Your loan application has been rejected by ${approver.full_name} (${approverRole}).`
    }

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: loanApp.created_by,
        message,
        related_to: 'loan_application',
        entity_id: loanId
      })
  }

  // Log the action
  await supabaseClient
    .from('loan_workflow_log')
    .insert({
      loan_application_id: loanId,
      action: `${decision} by ${approverRole}`,
      performed_by: approverId,
      status: finalStatus || `moved to ${nextStage}`
    })

  return new Response(
    JSON.stringify({ 
      success: true, 
      next_stage: nextStage,
      final_status: finalStatus,
      is_final: isComplete,
      message: decision === 'approve' ? 'Application approved successfully' : 'Application rejected'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateWeeklyReports(supabaseClient: any) {
  const roles = ['manager', 'director', 'chairperson', 'ceo']
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
  weekStart.setHours(0, 0, 0, 0)

  const reports = []

  for (const role of roles) {
    try {
      const { data, error } = await supabaseClient.rpc('generate_weekly_report', {
        target_role: role,
        week_start: weekStart.toISOString().split('T')[0]
      })

      if (!error) {
        reports.push({ role, data })
      }
    } catch (err) {
      console.error(`Error generating report for ${role}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ success: true, reports }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getWeeklyReports(supabaseClient: any, req: Request) {
  const url = new URL(req.url)
  const targetRole = url.searchParams.get('target_role')

  if (!targetRole) {
    return new Response(
      JSON.stringify({ error: 'target_role parameter required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  const { data, error } = await supabaseClient
    .from('weekly_reports')
    .select('*')
    .eq('role_type', targetRole)
    .order('report_week', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error('Failed to fetch weekly reports')
  }

  return new Response(
    JSON.stringify(data || []),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
