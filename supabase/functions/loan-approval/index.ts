
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoanApprovalRequest {
  loan_id: string;
  action: 'approve' | 'reject';
  notes: string;
  approver_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get authorization token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      'https://bjsxekgraxbfqzhbqjff.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    )

    // Get the request body
    const { loan_id, action, notes, approver_id } = await req.json() as LoanApprovalRequest

    console.log(`Processing loan ${action} for application ${loan_id}`)
    
    // Get the loan application details
    const { data: loanApp, error: fetchError } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', loan_id)
      .single()
    
    if (fetchError) throw fetchError
    if (!loanApp) throw new Error('Loan application not found')
    
    // Update the loan application status
    const updateData: Record<string, any> = {
      last_updated: new Date().toISOString()
    }
    
    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approval_notes = notes
      updateData.approved_by = approver_id
    } else {
      updateData.status = 'rejected'
      updateData.rejection_reason = notes
    }
    
    const { error: updateError } = await supabase
      .from('loan_applications')
      .update(updateData)
      .eq('id', loan_id)
    
    if (updateError) throw updateError
    
    // Create a notification for the loan applicant
    const notificationMessage = action === 'approve' 
      ? `Your loan application of ${loanApp.loan_amount} UGX has been approved!` 
      : `Your loan application has been declined. Reason: ${notes}`
    
    await createNotification(
      supabase,
      loanApp.created_by, // Notify the creator
      notificationMessage,
      'loan_application',
      loan_id
    )
    
    // If approved, also create a notification for the finance department
    if (action === 'approve') {
      // This would be a real user ID in production
      const financeManagerId = loanApp.current_approver
      
      await createNotification(
        supabase,
        financeManagerId,
        `Loan application for ${loanApp.client_name} has been approved and is ready for disbursement`,
        'loan_application',
        loan_id
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Loan application ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
    
  } catch (error) {
    console.error('Error processing loan approval:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})

// Helper function to create notifications
async function createNotification(
  supabase: any,
  userId: string, 
  message: string, 
  relatedTo: string, 
  entityId: string
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: message,
        related_to: relatedTo,
        entity_id: entityId,
        is_read: false
      })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}
