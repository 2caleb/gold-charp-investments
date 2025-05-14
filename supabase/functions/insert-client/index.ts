
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.1'

interface ClientData {
  p_full_name: string;
  p_phone_number: string;
  p_email: string | null;
  p_id_number: string;
  p_address: string;
  p_employment_status: string;
  p_monthly_income: number;
  p_user_id: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    const clientData: ClientData = await req.json()
    
    // Insert client data into the clients table
    const { data, error } = await supabaseClient
      .from('clients')
      .insert({
        full_name: clientData.p_full_name,
        phone_number: clientData.p_phone_number,
        email: clientData.p_email,
        id_number: clientData.p_id_number,
        address: clientData.p_address,
        employment_status: clientData.p_employment_status,
        monthly_income: clientData.p_monthly_income,
        user_id: clientData.p_user_id
      })
      .select('id')
      .single()
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
