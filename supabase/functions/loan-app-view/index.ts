
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing application ID" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: application, error } = await supabase
      .from("loan_applications")
      .select(`
        *,
        created_by:created_by(full_name, email, role),
        current_approver:current_approver(full_name, email, role)
      `)
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching loan application:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Format numbers with thousands separators but no currency symbol
    const formatNumber = (amount) => {
      return parseFloat(amount).toLocaleString('en-UG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };
    
    // Simple HTML response showing application details
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Application: ${application.client_name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #5521b5; }
          .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: bold; }
          .status.submitted { background: #e2e8f0; color: #475569; }
          .status.pending { background: #fef3c7; color: #92400e; }
          .status.approved { background: #dcfce7; color: #166534; }
          .status.rejected { background: #fee2e2; color: #b91c1c; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <h1>Loan Application Details</h1>
        
        <div class="card">
          <h2>${application.client_name}</h2>
          <p>
            Status: 
            <span class="status ${application.status.includes('pending') ? 'pending' : application.status}">
              ${application.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </p>
          <p>Created: ${new Date(application.created_at).toLocaleString()}</p>
          <p>Last Updated: ${new Date(application.last_updated || application.created_at).toLocaleString()}</p>
        </div>
        
        <div class="grid">
          <div class="card">
            <h3>Personal Information</h3>
            <p>Phone Number: ${application.phone_number}</p>
            <p>ID Number: ${application.id_number}</p>
            <p>Address: ${application.address}</p>
          </div>
          
          <div class="card">
            <h3>Loan Details</h3>
            <p>Loan Type: ${application.loan_type}</p>
            <p>Loan Amount: ${formatNumber(application.loan_amount)}</p>
            <p>Employment: ${application.employment_status}</p>
            <p>Monthly Income: ${formatNumber(application.monthly_income)}</p>
          </div>
        </div>
        
        <div class="card">
          <h3>Purpose of Loan</h3>
          <p>${application.purpose_of_loan}</p>
        </div>
        
        ${application.notes ? `
        <div class="card">
          <h3>Additional Notes</h3>
          <p>${application.notes}</p>
        </div>
        ` : ''}
        
        <div class="card">
          <h3>Approval Chain</h3>
          <p>Submitted by: ${application.created_by?.full_name || 'Unknown'} (${application.created_by?.role || 'Unknown'})</p>
          <p>Current Approver: ${application.current_approver?.full_name || 'Unknown'} (${application.current_approver?.role || 'Unknown'})</p>
          
          ${application.status === 'approved' ? `
          <p>Approval Notes: ${application.approval_notes || 'No notes provided'}</p>
          ` : ''}
          
          ${application.status === 'rejected' ? `
          <p>Rejection Reason: ${application.rejection_reason || 'No reason provided'}</p>
          ` : ''}
        </div>
        
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
