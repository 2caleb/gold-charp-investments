
import { supabase } from '@/integrations/supabase/client';

// Loan Performance Data
export async function fetchLoanPerformanceData() {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('created_at, loan_amount, loan_type, status')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Process the data to get monthly aggregates
    const monthlyData = processLoanDataByMonth(data || []);
    return { data: monthlyData, error: null };
  } catch (error) {
    console.error('Error fetching loan performance data:', error);
    return { data: null, error };
  }
}

// Property Sales Data
export async function fetchPropertyInsightsData() {
  try {
    // For property types distribution
    const { data: typeData, error: typeError } = await supabase
      .from('property_sales')
      .select('type, price')
      .order('created_at', { ascending: false });
      
    if (typeError) throw typeError;
    
    // For price trends over time
    const { data: priceData, error: priceError } = await supabase
      .from('property_sales')
      .select('created_at, price, type')
      .order('created_at', { ascending: true });
      
    if (priceError) throw priceError;
    
    // For top properties
    const { data: topProperties, error: topError } = await supabase
      .from('property_sales')
      .select('id, location, price, type, created_at')
      .order('price', { ascending: false })
      .limit(5);
      
    if (topError) throw topError;
    
    // Process the data
    const processedTypeData = processPropertyTypeData(typeData || []);
    const processedPriceData = processPropertyPriceData(priceData || []);
    
    return { 
      typeData: processedTypeData, 
      priceData: processedPriceData, 
      topProperties: topProperties || [],
      error: null 
    };
  } catch (error) {
    console.error('Error fetching property insights data:', error);
    return { typeData: [], priceData: [], topProperties: [], error };
  }
}

// Field Officer Activity Data
export async function fetchFieldOfficerActivityData() {
  try {
    // For activity trends
    const { data: activityData, error: activityError } = await supabase
      .from('field_officer_activities')
      .select('created_at, activity_type, officer_id')
      .order('created_at', { ascending: false });
      
    if (activityError) throw activityError;
    
    // For officer performance
    const { data: officerData, error: officerError } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name,
        region,
        (select count(*) from field_officer_activities where officer_id = profiles.id and activity_type = 'visit') as visits,
        (select count(*) from field_officer_activities where officer_id = profiles.id and activity_type = 'application') as applications,
        (select count(*) from field_officer_activities where officer_id = profiles.id and activity_type = 'approval') as approvals
      `)
      .eq('role', 'field_officer')
      .order('full_name', { ascending: true });
      
    if (officerError) throw officerError;
    
    // For recent activities
    const { data: recentActivities, error: recentError } = await supabase
      .from('field_officer_activities')
      .select(`
        id,
        profiles(full_name),
        activity_type,
        client_name,
        created_at,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(6);
      
    if (recentError) throw recentError;
    
    // Process the data
    const processedActivityData = processActivityTrends(activityData || []);
    const processedOfficerData = processOfficerPerformance(officerData || []);
    const processedRecentActivities = processRecentActivities(recentActivities || []);
    
    return { 
      activityData: processedActivityData, 
      officerData: processedOfficerData, 
      recentActivities: processedRecentActivities,
      error: null 
    };
  } catch (error) {
    console.error('Error fetching field officer activity data:', error);
    return { activityData: [], officerData: [], recentActivities: [], error };
  }
}

// Risk Profile Data
export async function fetchRiskProfileData() {
  try {
    const { data, error } = await supabase
      .from('risk_profiles')
      .select('region, district, risk_score, total_loans, default_rate, average_loan_size')
      .order('risk_score', { ascending: false });
      
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching risk profile data:', error);
    return { data: [], error };
  }
}

// Helper functions for data processing
function processLoanDataByMonth(loanData: any[]) {
  // Group by month and calculate aggregates
  const monthMap = new Map();
  
  loanData.forEach(loan => {
    const date = new Date(loan.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1)
      .toLocaleDateString('en-US', { month: 'short' });
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { 
        month: monthLabel, 
        disbursed: 0, 
        repaid: 0, 
        defaulted: 0 
      });
    }
    
    const entry = monthMap.get(monthKey);
    const amount = parseFloat(loan.loan_amount);
    
    // Update values based on loan status
    if (!isNaN(amount)) {
      if (loan.status === 'approved') {
        entry.disbursed += amount;
      } else if (loan.status === 'repaid') {
        entry.repaid += amount;
      } else if (loan.status === 'defaulted') {
        entry.defaulted += amount;
      }
    }
  });
  
  // Convert map to array sorted by date
  return Array.from(monthMap.values())
    .sort((a, b) => {
      const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                         'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      return monthOrder[a.month as keyof typeof monthOrder] - monthOrder[b.month as keyof typeof monthOrder];
    });
}

function processPropertyTypeData(propertyData: any[]) {
  const typeMap = new Map();
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  
  propertyData.forEach(property => {
    if (!typeMap.has(property.type)) {
      typeMap.set(property.type, { 
        name: property.type, 
        value: 0, 
        color: colors[typeMap.size % colors.length]
      });
    }
    
    const entry = typeMap.get(property.type);
    entry.value += 1;
  });
  
  // Calculate percentages
  const total = Array.from(typeMap.values()).reduce((sum, entry) => sum + entry.value, 0);
  typeMap.forEach(entry => {
    entry.value = Math.round((entry.value / total) * 100);
  });
  
  return Array.from(typeMap.values());
}

function processPropertyPriceData(priceData: any[]) {
  // Group by month and calculate average prices by property type
  const monthMap = new Map();
  
  priceData.forEach(property => {
    const date = new Date(property.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1)
      .toLocaleDateString('en-US', { month: 'short' });
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { 
        month: monthLabel, 
        residential: 0, 
        commercial: 0, 
        agricultural: 0,
        residential_count: 0,
        commercial_count: 0,
        agricultural_count: 0
      });
    }
    
    const entry = monthMap.get(monthKey);
    const price = parseFloat(property.price);
    
    if (!isNaN(price)) {
      if (property.type.toLowerCase() === 'residential') {
        entry.residential += price;
        entry.residential_count += 1;
      } else if (property.type.toLowerCase() === 'commercial') {
        entry.commercial += price;
        entry.commercial_count += 1;
      } else if (property.type.toLowerCase() === 'agricultural') {
        entry.agricultural += price;
        entry.agricultural_count += 1;
      }
    }
  });
  
  // Calculate averages
  monthMap.forEach(entry => {
    if (entry.residential_count > 0) entry.residential = Math.round(entry.residential / entry.residential_count);
    if (entry.commercial_count > 0) entry.commercial = Math.round(entry.commercial / entry.commercial_count);
    if (entry.agricultural_count > 0) entry.agricultural = Math.round(entry.agricultural / entry.agricultural_count);
    
    // Remove count fields
    delete entry.residential_count;
    delete entry.commercial_count;
    delete entry.agricultural_count;
  });
  
  // Convert map to array sorted by month
  return Array.from(monthMap.values())
    .sort((a, b) => {
      const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                         'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      return monthOrder[a.month as keyof typeof monthOrder] - monthOrder[b.month as keyof typeof monthOrder];
    });
}

function processActivityTrends(activityData: any[]) {
  // Group by day and calculate counts by activity type
  const dayMap = new Map();
  
  activityData.forEach(activity => {
    const date = new Date(activity.created_at);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayLabel = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { 
        date: dayLabel, 
        visits: 0, 
        applications: 0, 
        approvals: 0 
      });
    }
    
    const entry = dayMap.get(dayKey);
    
    if (activity.activity_type === 'visit') {
      entry.visits += 1;
    } else if (activity.activity_type === 'application') {
      entry.applications += 1;
    } else if (activity.activity_type === 'approval') {
      entry.approvals += 1;
    }
  });
  
  // Convert map to array sorted by date and limit to last 7 days
  return Array.from(dayMap.values())
    .sort((a, b) => {
      const dateA = new Date(`2025/${a.date}`);
      const dateB = new Date(`2025/${b.date}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-7);
}

function processOfficerPerformance(officerData: any[]) {
  return officerData.map(officer => ({
    id: officer.id,
    name: officer.full_name,
    visits: officer.visits,
    applications: officer.applications,
    approvals: officer.approvals,
    region: officer.region
  }))
  .sort((a, b) => b.approvals - a.approvals)
  .slice(0, 5);
}

function processRecentActivities(activitiesData: any[]) {
  return activitiesData.map(activity => ({
    id: activity.id,
    officer: activity.profiles?.full_name || 'Unknown',
    activity: formatActivityType(activity.activity_type),
    client: activity.client_name,
    timestamp: activity.created_at,
    status: activity.status
  }));
}

function formatActivityType(type: string): string {
  switch (type) {
    case 'visit': return 'Client Visit';
    case 'application': return 'Loan Application';
    case 'approval': return 'Loan Approval';
    case 'documents': return 'Document Collection';
    case 'appraisal': return 'Property Appraisal';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Function to use when no data is available yet
export function getMockLoanPerformanceData() {
  return [
    { month: 'Jan', disbursed: 4000, repaid: 2400, defaulted: 240 },
    { month: 'Feb', disbursed: 3000, repaid: 1398, defaulted: 210 },
    { month: 'Mar', disbursed: 5000, repaid: 3800, defaulted: 290 },
    { month: 'Apr', disbursed: 2780, repaid: 3908, defaulted: 200 },
    { month: 'May', disbursed: 1890, repaid: 4800, defaulted: 181 },
    { month: 'Jun', disbursed: 2390, repaid: 3800, defaulted: 250 },
    { month: 'Jul', disbursed: 3490, repaid: 4300, defaulted: 210 },
  ];
}
