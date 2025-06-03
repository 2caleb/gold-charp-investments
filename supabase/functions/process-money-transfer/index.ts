
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
  };
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

    const { transferData } = await req.json()
    console.log('Processing transfer:', transferData)

    // Get Flutterwave API key
    const flutterwaveSecretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
    if (!flutterwaveSecretKey) {
      throw new Error('Flutterwave API key not configured')
    }

    // Create transfer payload for Flutterwave
    const transferPayload = {
      account_bank: transferData.bankCode || "044", // Default to Access Bank if not provided
      account_number: transferData.accountNumber,
      amount: transferData.receiveAmount,
      narration: `Money transfer from Gold Charp - ${transferData.purpose || 'Personal'}`,
      currency: transferData.receiveCurrency,
      reference: transferData.referenceNumber,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/flutterwave-webhook`,
      debit_currency: transferData.sendCurrency,
      beneficiary_name: transferData.recipientName
    }

    console.log('Flutterwave payload:', transferPayload)

    // Make request to Flutterwave API
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferPayload)
    })

    const flutterwaveData: FlutterwaveResponse = await flutterwaveResponse.json()
    console.log('Flutterwave response:', flutterwaveData)

    // Update transfer record with Flutterwave response
    const { data: transfer, error: updateError } = await supabase
      .from('money_transfers')
      .update({
        flutterwave_transaction_id: flutterwaveData.data?.id?.toString(),
        flutterwave_reference: flutterwaveData.data?.flw_ref,
        processor_response: flutterwaveData,
        status: flutterwaveData.status === 'success' ? 'processing' : 'failed',
        failure_reason: flutterwaveData.status !== 'success' ? flutterwaveData.message : null,
        audit_trail: [
          {
            action: 'flutterwave_initiated',
            timestamp: new Date().toISOString(),
            details: flutterwaveData
          }
        ]
      })
      .eq('id', transferData.transferId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating transfer:', updateError)
      throw updateError
    }

    // Log audit trail
    await supabase
      .from('transaction_audit_log')
      .insert({
        transaction_id: transferData.transferId,
        action: 'flutterwave_initiated',
        new_status: flutterwaveData.status === 'success' ? 'processing' : 'failed',
        details: flutterwaveData,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })

    return new Response(
      JSON.stringify({ 
        success: flutterwaveData.status === 'success',
        transfer,
        flutterwaveResponse: flutterwaveData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: flutterwaveData.status === 'success' ? 200 : 400
      }
    )

  } catch (error) {
    console.error('Error processing transfer:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
