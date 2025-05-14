
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variable
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { user_id, message, related_to, entity_id, send_email = false } = await req.json();

    // Validate required fields
    if (!user_id || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notification record in the database
    const { data: notificationData, error: notificationError } = await supabaseClient
      .from("notifications")
      .insert({
        user_id,
        message,
        related_to: related_to || "general",
        entity_id: entity_id || ""
      })
      .select()
      .single();

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      throw notificationError;
    }

    // If send_email is true, get the user's email and send them an email notification
    if (send_email) {
      const { data: userData, error: userError } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", user_id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }

      if (userData && userData.email) {
        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: "Gold Charp Investments <onboarding@resend.dev>",
          to: [userData.email],
          subject: `Notification: ${related_to || "Update"} from Gold Charp Investments`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #6d28d9;">Gold Charp Investments Notification</h2>
              <p>Hello ${userData.full_name || "there"},</p>
              <p>${message}</p>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">This is an automated message, please do not reply directly to this email.</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
                <p>Gold Charp Investments Ltd.</p>
                <p>If you need assistance, please contact our support team.</p>
              </div>
            </div>
          `,
        });

        console.log("Email sent:", emailResponse);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
