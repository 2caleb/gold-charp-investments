
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransferRequest {
  recipient_id: string;
  send_amount: number;
  send_currency: string;
  receive_currency: string;
  transfer_method: string;
  purpose?: string;
  pickup_location?: string;
}

interface FlutterwavePayload {
  account_bank: string;
  account_number: string;
  amount: number;
  narration: string;
  currency: string;
  beneficiary_name: string;
  reference: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const transferData: TransferRequest = await req.json();
    console.log('Transfer request:', transferData);

    // Calculate service fee (20% as per Python code)
    const serviceFeePct = 20.0;
    const serviceFee = Math.round((transferData.send_amount * serviceFeePct / 100) * 100) / 100;
    const netAmount = Math.round((transferData.send_amount - serviceFee) * 100) / 100;

    // Get exchange rate
    const { data: exchangeRate } = await supabaseClient
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', transferData.send_currency)
      .eq('to_currency', transferData.receive_currency)
      .single();

    const rate = exchangeRate?.rate || 1;
    const receiveAmount = Math.round((netAmount * rate) * 100) / 100;
    const totalAmount = transferData.send_amount;

    // Get recipient details
    const { data: recipient } = await supabaseClient
      .from('transfer_recipients')
      .select('*')
      .eq('id', transferData.recipient_id)
      .single();

    if (!recipient) {
      return new Response('Recipient not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Generate reference number (similar to Python code)
    const reference = `GOLDCHARP_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;

    // Create transfer record
    const { data: transfer, error: transferError } = await supabaseClient
      .from('money_transfers')
      .insert({
        sender_id: user.id,
        recipient_id: transferData.recipient_id,
        send_amount: transferData.send_amount,
        send_currency: transferData.send_currency,
        receive_amount: receiveAmount,
        receive_currency: transferData.receive_currency,
        transfer_fee: serviceFee,
        service_fee: serviceFee,
        net_amount: netAmount,
        original_amount: transferData.send_amount,
        fee_percentage: serviceFeePct,
        exchange_rate: rate,
        total_amount: totalAmount,
        transfer_method: transferData.transfer_method,
        purpose: transferData.purpose || 'Money transfer',
        pickup_location: transferData.pickup_location,
        reference_number: reference,
        status: 'processing',
        audit_trail: [{
          action: 'transfer_initiated',
          timestamp: new Date().toISOString(),
          details: { service_fee: serviceFee, net_amount: netAmount }
        }]
      })
      .select()
      .single();

    if (transferError) {
      console.error('Transfer creation error:', transferError);
      return new Response('Failed to create transfer', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Process with Flutterwave (if not in mock mode)
    const mockMode = Deno.env.get('FLUTTERWAVE_MOCK_MODE') === 'true';
    let flutterwaveResponse = null;

    if (!mockMode && Deno.env.get('FLUTTERWAVE_SECRET_KEY')) {
      const flutterwavePayload: FlutterwavePayload = {
        account_bank: recipient.bank_name || 'MPS',
        account_number: recipient.account_number || recipient.phone_number || '',
        amount: netAmount,
        narration: `Money transfer - ${transferData.purpose || 'Gold Charp Transfer'}`,
        currency: transferData.receive_currency,
        beneficiary_name: recipient.full_name,
        reference: reference
      };

      try {
        const flutterwaveHeaders = {
          'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
          'Content-Type': 'application/json'
        };

        const response = await fetch('https://api.flutterwave.com/v3/transfers', {
          method: 'POST',
          headers: flutterwaveHeaders,
          body: JSON.stringify(flutterwavePayload),
        });

        flutterwaveResponse = await response.json();
        console.log('Flutterwave response:', flutterwaveResponse);

        // Update transfer with Flutterwave response
        await supabaseClient
          .from('money_transfers')
          .update({
            status: flutterwaveResponse.status === 'success' ? 'completed' : 'failed',
            flutterwave_reference: flutterwaveResponse.data?.reference,
            flutterwave_transaction_id: flutterwaveResponse.data?.id?.toString(),
            processor_response: flutterwaveResponse,
            failure_reason: flutterwaveResponse.status !== 'success' ? flutterwaveResponse.message : null,
            completed_at: flutterwaveResponse.status === 'success' ? new Date().toISOString() : null,
            audit_trail: [
              ...transfer.audit_trail,
              {
                action: 'flutterwave_processed',
                timestamp: new Date().toISOString(),
                details: { status: flutterwaveResponse.status, reference: flutterwaveResponse.data?.reference }
              }
            ]
          })
          .eq('id', transfer.id);

      } catch (error) {
        console.error('Flutterwave API error:', error);
        await supabaseClient
          .from('money_transfers')
          .update({
            status: 'failed',
            failure_reason: 'Flutterwave API error: ' + error.message,
            audit_trail: [
              ...transfer.audit_trail,
              {
                action: 'flutterwave_error',
                timestamp: new Date().toISOString(),
                details: { error: error.message }
              }
            ]
          })
          .eq('id', transfer.id);
      }
    } else {
      // Mock mode - simulate successful transfer
      await supabaseClient
        .from('money_transfers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          audit_trail: [
            ...transfer.audit_trail,
            {
              action: 'mock_transfer_completed',
              timestamp: new Date().toISOString(),
              details: { mock_mode: true }
            }
          ]
        })
        .eq('id', transfer.id);
    }

    // Send notification email (similar to Python code)
    try {
      const notificationData = {
        transfer_id: transfer.id,
        recipient_email: Deno.env.get('ADMIN_EMAIL') || 'admin@goldcharp.com',
        notification_type: 'email',
        status: 'pending'
      };

      await supabaseClient
        .from('transaction_notifications')
        .insert(notificationData);

      // In a real implementation, you would send the actual email here
      console.log('Notification logged for transfer:', transfer.id);

    } catch (error) {
      console.error('Notification error:', error);
    }

    return new Response(JSON.stringify({
      success: true,
      transfer_id: transfer.id,
      reference: reference,
      service_fee: serviceFee,
      net_amount: netAmount,
      receive_amount: receiveAmount,
      status: mockMode ? 'completed' : (flutterwaveResponse?.status || 'processing'),
      message: mockMode ? 'Transfer completed (mock mode)' : 'Transfer processed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Transfer processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
