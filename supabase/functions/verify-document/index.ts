
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { documentId, documentType } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get document metadata from the database
    const { data: metaData, error: metaError } = await supabaseClient
      .from('document_metadata')
      .select('*')
      .eq('id', documentId)
      .single();

    if (metaError) {
      throw new Error(`Error fetching document: ${metaError.message}`);
    }

    // Get the document content from storage
    const bucketId = documentType === 'id_document' ? 'id_documents' : 
                    documentType === 'collateral_photo' ? 'collateral_photos' : 
                    documentType === 'property_document' ? 'property_documents' : 
                    'loan_documents';

    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from(bucketId)
      .download(metaData.storage_path);

    if (fileError) {
      throw new Error(`Error downloading file: ${fileError.message}`);
    }

    // Simulate document verification
    // In a real implementation, this would connect to an external API
    // that verifies the authenticity of documents and ID numbers
    const isIdDocument = documentType === 'id_document';
    
    // Simulate verification based on document type
    const verificationResult = {
      isAuthentic: Math.random() > 0.2, // 80% chance of being authentic for demo purposes
      verificationDetails: {
        documentType: documentType,
        verifiedAt: new Date().toISOString(),
        verificationMethod: isIdDocument ? 'ID Validation Service' : 'Document Analysis',
        warnings: isIdDocument ? [] : ['Quality could be improved'],
      }
    };

    // Store verification result in the database
    const { data: verificationData, error: verificationError } = await supabaseClient
      .from('document_verification')
      .insert({
        document_id: documentId,
        verification_status: verificationResult.isAuthentic ? 'verified' : 'failed',
        is_authentic: verificationResult.isAuthentic,
        verification_details: verificationResult.verificationDetails
      })
      .select()
      .single();

    if (verificationError) {
      throw new Error(`Error storing verification result: ${verificationError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        isAuthentic: verificationResult.isAuthentic,
        verificationId: verificationData.id,
        details: verificationResult.verificationDetails
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying document:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
