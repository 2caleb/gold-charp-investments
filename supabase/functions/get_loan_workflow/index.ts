
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

// CORS headers for browser requests
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

    const { application_id } = await req.json();

    if (!application_id) {
      return new Response(
        JSON.stringify({ error: "Application ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get workflow data 
    const { data, error } = await supabaseClient
      .from('loan_application_workflow')
      .select('*')
      .eq('loan_application_id', application_id);

    if (error) {
      throw error;
    }

    // Check if workflow was found
    if (!data || data.length === 0) {
      // Create a default workflow record if none exists
      const { data: newWorkflow, error: createError } = await supabaseClient
        .from('loan_application_workflow')
        .insert({
          loan_application_id: application_id,
          current_stage: 'field_officer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating workflow:", createError);
        return new Response(
          JSON.stringify({ 
            error: "No workflow found and couldn't create one", 
            details: createError.message
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Return the newly created workflow
      return new Response(
        JSON.stringify(newWorkflow),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Return the first workflow data if multiple (should only be one)
    return new Response(
      JSON.stringify(data[0]),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in get_loan_workflow function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
