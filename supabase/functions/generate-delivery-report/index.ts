import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryReportRequest {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  supplier?: string;
  paymentStatus?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { format, startDate, endDate, supplier, paymentStatus }: DeliveryReportRequest = await req.json();

    // Build query with filters
    let query = supabase
      .from('egg_deliveries')
      .select('*')
      .order('delivery_date', { ascending: false });

    if (startDate) {
      query = query.gte('delivery_date', startDate);
    }
    if (endDate) {
      query = query.lte('delivery_date', endDate);
    }
    if (supplier) {
      query = query.ilike('supplier_name', `%${supplier}%`);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data: deliveries, error } = await query;

    if (error) {
      throw error;
    }

    if (format === 'excel') {
      // Generate Excel data
      const excelData = generateExcelReport(deliveries);
      return new Response(JSON.stringify(excelData), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Generate PDF data
      const pdfData = generatePDFReport(deliveries);
      return new Response(JSON.stringify(pdfData), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error generating delivery report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function generateExcelReport(deliveries: any[]) {
  // Calculate summary statistics
  const totalDeliveries = deliveries.length;
  const totalTrays = deliveries.reduce((sum, d) => sum + d.trays, 0);
  const totalRevenue = deliveries.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + d.total_amount, 0);
  const paidCount = deliveries.filter(d => d.payment_status === 'paid').length;
  const pendingCount = deliveries.filter(d => d.payment_status === 'pending').length;
  const overdueCount = deliveries.filter(d => d.payment_status === 'overdue').length;
  const uniqueSuppliers = new Set(deliveries.map(d => d.supplier_name)).size;

  // Prepare data for Excel
  const worksheetData = [
    // Header
    ['Egg Delivery Report', '', '', '', '', '', ''],
    ['Generated on:', new Date().toLocaleDateString(), '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    
    // Summary
    ['SUMMARY', '', '', '', '', '', ''],
    ['Total Deliveries:', totalDeliveries, '', '', '', '', ''],
    ['Total Trays:', totalTrays, '', '', '', '', ''],
    ['Total Revenue (UGX):', totalRevenue, '', '', '', '', ''],
    ['Paid Deliveries:', paidCount, '', '', '', '', ''],
    ['Pending Deliveries:', pendingCount, '', '', '', '', ''],
    ['Overdue Deliveries:', overdueCount, '', '', '', '', ''],
    ['Unique Suppliers:', uniqueSuppliers, '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    
    // Detail headers
    ['DELIVERY DETAILS', '', '', '', '', '', ''],
    ['Supplier Name', 'Phone', 'Delivery Date', 'Trays', 'Price/Tray', 'Total Amount', 'Payment Status'],
    
    // Detail data
    ...deliveries.map(d => [
      d.supplier_name,
      d.phone_number || '',
      new Date(d.delivery_date).toLocaleDateString(),
      d.trays,
      d.price_per_tray,
      d.total_amount,
      d.payment_status.toUpperCase()
    ])
  ];

  return {
    filename: `egg-deliveries-${new Date().toISOString().split('T')[0]}.xlsx`,
    data: worksheetData,
    summary: {
      totalDeliveries,
      totalTrays,
      totalRevenue,
      paidCount,
      pendingCount,
      overdueCount,
      uniqueSuppliers
    }
  };
}

function generatePDFReport(deliveries: any[]) {
  // Calculate summary statistics
  const totalDeliveries = deliveries.length;
  const totalTrays = deliveries.reduce((sum, d) => sum + d.trays, 0);
  const totalRevenue = deliveries.filter(d => d.payment_status === 'paid').reduce((sum, d) => sum + d.total_amount, 0);
  const paidCount = deliveries.filter(d => d.payment_status === 'paid').length;
  const pendingCount = deliveries.filter(d => d.payment_status === 'pending').length;
  const overdueCount = deliveries.filter(d => d.payment_status === 'overdue').length;
  const uniqueSuppliers = new Set(deliveries.map(d => d.supplier_name)).size;

  return {
    filename: `egg-deliveries-${new Date().toISOString().split('T')[0]}.pdf`,
    summary: {
      totalDeliveries,
      totalTrays,
      totalRevenue,
      paidCount,
      pendingCount,
      overdueCount,
      uniqueSuppliers
    },
    deliveries: deliveries.map(d => ({
      supplier_name: d.supplier_name,
      phone_number: d.phone_number || '',
      delivery_date: new Date(d.delivery_date).toLocaleDateString(),
      trays: d.trays,
      price_per_tray: d.price_per_tray,
      total_amount: d.total_amount,
      payment_status: d.payment_status.toUpperCase(),
      delivery_location: d.delivery_location || '',
      notes: d.notes || ''
    })),
    generatedAt: new Date().toLocaleDateString()
  };
}

serve(handler);