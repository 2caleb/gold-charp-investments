
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.1";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variable
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Workflow roles in order of approval hierarchy
const WORKFLOW_CHAIN = ["field_officer", "manager", "director", "ceo"];

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

    const { 
      applicationId, 
      action, // "submit", "approve", "reject", or "finalize"
      comment = ""
    } = await req.json();

    // Fetch the loan application data
    const { data: application, error: appError } = await supabaseClient
      .from("loan_applications")
      .select("*, created_by(id, email, full_name, role), current_approver(id, email, full_name, role)")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      console.error("Error fetching application:", appError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch application data" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different email actions
    let emailTo = [];
    let emailSubject = "";
    let emailHtml = "";
    let nextApprover = null;

    if (action === "submit" || action === "approve") {
      // For initial submission or approval, we need to find the next person in the chain
      const currentRoleIndex = WORKFLOW_CHAIN.indexOf(
        action === "submit" ? "field_officer" : application.current_approver.role
      );
      
      const nextRole = WORKFLOW_CHAIN[currentRoleIndex + 1];
      
      // Get the next approver with the required role
      const { data: nextApprovers, error: nextError } = await supabaseClient
        .from("profiles")
        .select("id, email, full_name")
        .eq("role", nextRole)
        .limit(1);
        
      if (nextError || !nextApprovers || nextApprovers.length === 0) {
        return new Response(
          JSON.stringify({ error: `No ${nextRole} found in the system` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      nextApprover = nextApprovers[0];
      emailTo = [nextApprover.email];
      
      // Update the application with the next approver
      await supabaseClient
        .from("loan_applications")
        .update({ 
          current_approver: nextApprover.id,
          status: action === "submit" ? "pending_manager" : `pending_${nextRole === "ceo" ? "final_approval" : nextRole}`,
          last_updated: new Date().toISOString()
        })
        .eq("id", applicationId);
        
      emailSubject = `Loan Application ${action === "submit" ? "Submission" : "Approved"}: ${application.clientName}`;
      emailHtml = `
        <h1>Loan Application ${action === "submit" ? "Submission" : "Approved"}</h1>
        <p>Client: <strong>${application.clientName}</strong></p>
        <p>Loan Amount: <strong>${application.loanAmount}</strong></p>
        <p>Loan Type: <strong>${application.loanType}</strong></p>
        <p>${action === "submit" ? "Submitted" : "Approved"} by: <strong>${
          action === "submit" ? application.created_by.full_name : application.current_approver.full_name
        }</strong></p>
        ${comment ? `<p>Comment: ${comment}</p>` : ''}
        <p>Please review this application and make your decision.</p>
        <p><a href="https://bjsxekgraxbfqzhbqjff.supabase.co/functions/v1/loan-app-view?id=${applicationId}">View Application Details</a></p>
      `;
    } else if (action === "reject") {
      // For rejection, notify the original submitter and update status
      emailTo = [application.created_by.email];
      
      await supabaseClient
        .from("loan_applications")
        .update({ 
          status: "rejected",
          last_updated: new Date().toISOString(),
          rejection_reason: comment
        })
        .eq("id", applicationId);
        
      emailSubject = `Loan Application Rejected: ${application.clientName}`;
      emailHtml = `
        <h1>Loan Application Rejected</h1>
        <p>Client: <strong>${application.clientName}</strong></p>
        <p>Loan Amount: <strong>${application.loanAmount}</strong></p>
        <p>Rejected by: <strong>${application.current_approver.full_name}</strong></p>
        ${comment ? `<p>Reason: ${comment}</p>` : '<p>No reason provided</p>'}
      `;
    } else if (action === "finalize") {
      // This is the CEO's final decision - notify everyone involved
      const { data: allStaff, error: staffError } = await supabaseClient
        .from("profiles")
        .select("email")
        .in("role", WORKFLOW_CHAIN);
        
      if (staffError || !allStaff) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch staff emails" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      emailTo = allStaff.map(staff => staff.email);
      
      await supabaseClient
        .from("loan_applications")
        .update({ 
          status: "approved",
          last_updated: new Date().toISOString(),
          approval_notes: comment
        })
        .eq("id", applicationId);
        
      emailSubject = `FINAL APPROVAL: Loan Application for ${application.clientName}`;
      emailHtml = `
        <h1>Loan Application Approved</h1>
        <p>Client: <strong>${application.clientName}</strong></p>
        <p>Loan Amount: <strong>${application.loanAmount}</strong></p>
        <p>Loan Type: <strong>${application.loanType}</strong></p>
        <p>Final Approval by CEO: <strong>${application.current_approver.full_name}</strong></p>
        ${comment ? `<p>Notes: ${comment}</p>` : ''}
      `;
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Gold Charp Investments <onboarding@resend.dev>",
      to: emailTo,
      subject: emailSubject,
      html: emailHtml,
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Email sent to ${emailTo.join(", ")}`,
        nextApprover: nextApprover,
        emailResponse 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-approval-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
