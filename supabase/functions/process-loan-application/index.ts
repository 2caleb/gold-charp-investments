
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoanApplicationRequest {
  loan_id: string;
  client_name: string;
  loan_amount: string;
  loan_type: string;
  employment_status: string;
  monthly_income: string;
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
    const { loan_id, client_name, loan_amount, loan_type, employment_status, monthly_income } = await req.json() as LoanApplicationRequest

    console.log(`Processing loan application for ${client_name}, amount: ${loan_amount}, type: ${loan_type}`)
    
    // Basic loan processing logic
    // 1. Check employment status
    const employmentRisk = employment_status === 'employed' ? 'low' : 
                            employment_status === 'self-employed' ? 'medium' : 'high'
    
    // 2. Calculate debt-to-income ratio (simplified version)
    const loanAmountNum = parseFloat(loan_amount.replace(/,/g, ''))
    const monthlyIncomeNum = parseFloat(monthly_income.replace(/,/g, ''))
    const estimatedMonthlyPayment = loanAmountNum / 24 // Simplified calculation
    const debtToIncomeRatio = estimatedMonthlyPayment / monthlyIncomeNum
    
    // 3. Determine risk level
    let riskLevel = 'medium'
    if (debtToIncomeRatio < 0.3 && employmentRisk === 'low') {
      riskLevel = 'low'
    } else if (debtToIncomeRatio > 0.5 || employmentRisk === 'high') {
      riskLevel = 'high'
    }
    
    // 4. Store the processing results
    const { data, error } = await supabase
      .from('loan_applications')
      .update({
        risk_assessment: riskLevel,
        last_updated: new Date().toISOString()
      })
      .eq('id', loan_id)
      .select()
    
    if (error) throw error
    
    // 5. Create a notification for the loan officer
    await createNotification(
      supabase,
      data[0].current_approver,
      `New loan application from ${client_name} is ready for review`,
      'loan_application',
      loan_id
    )
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Loan application processed successfully',
        risk_level: riskLevel,
        loan_id: loan_id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
    
  } catch (error) {
    console.error('Error processing loan application:', error)
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
