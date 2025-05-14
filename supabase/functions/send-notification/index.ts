
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  user_id: string;
  message: string;
  related_to: string;
  entity_id: string;
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
    const { user_id, message, related_to, entity_id } = await req.json() as NotificationRequest

    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        message: message,
        related_to: related_to,
        entity_id: entity_id,
        is_read: false
      })
      .select()
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: data[0]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
    
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
