
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const webhookData = await req.json()
    console.log('Flutterwave webhook received:', webhookData)

    // Verify webhook signature (in production)
    const signature = req.headers.get('verif-hash')
    const secretHash = Deno.env.get('FLUTTERWAVE_SECRET_HASH')
    
    if (secretHash && signature !== secretHash) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401 })
    }

    const { data } = webhookData
    if (!data || !data.tx_ref) {
      console.error('Invalid webhook data')
      return new Response('Invalid data', { status: 400 })
    }

    // Find transfer by reference number
    const { data: transfer, error: findError } = await supabase
      .from('money_transfers')
      .select('*')
      .eq('reference_number', data.tx_ref)
      .single()

    if (findError || !transfer) {
      console.error('Transfer not found:', data.tx_ref)
      return new Response('Transfer not found', { status: 404 })
    }

    // Update transfer status based on webhook
    let newStatus = 'failed'
    if (data.status === 'successful') {
      newStatus = 'completed'
    } else if (data.status === 'pending') {
      newStatus = 'processing'
    }

    const { error: updateError } = await supabase
      .from('money_transfers')
      .update({
        status: newStatus,
        completed_at: data.status === 'successful' ? new Date().toISOString() : null,
        processor_response: webhookData,
        audit_trail: [
          ...(transfer.audit_trail || []),
          {
            action: 'webhook_received',
            timestamp: new Date().toISOString(),
            details: webhookData
          }
        ]
      })
      .eq('id', transfer.id)

    if (updateError) {
      console.error('Error updating transfer:', updateError)
      throw updateError
    }

    // Log audit trail
    await supabase
      .from('transaction_audit_log')
      .insert({
        transaction_id: transfer.id,
        action: 'webhook_received',
        old_status: transfer.status,
        new_status: newStatus,
        details: webhookData,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })

    console.log(`Transfer ${transfer.id} updated to status: ${newStatus}`)

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { 
      headers: corsHeaders,
      status: 500 
    })
  }
})
