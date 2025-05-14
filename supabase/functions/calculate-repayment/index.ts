
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RepaymentRequest {
  principal: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
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
    const { principal, interest_rate, term_months, start_date } = await req.json() as RepaymentRequest

    console.log(`Calculating repayment schedule for loan of ${principal} UGX at ${interest_rate}% for ${term_months} months`)
    
    // Call the Postgres function we created
    const { data, error } = await supabase.rpc('calculate_repayment_schedule', {
      p_principal: principal,
      p_interest_rate: interest_rate,
      p_term_months: term_months,
      p_start_date: start_date
    })
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        schedule: data 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
    
  } catch (error) {
    console.error('Error calculating repayment schedule:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
