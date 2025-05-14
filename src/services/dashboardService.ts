
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

// Property Sales Data - Using mock data only
export async function fetchPropertyInsightsData() {
  try {
    // Since property_sales table doesn't exist, we'll use mock data
    const mockTypeData = [
      { name: 'Residential', value: 65, color: '#8884d8' },
      { name: 'Commercial', value: 20, color: '#82ca9d' },
      { name: 'Agricultural', value: 15, color: '#ffc658' },
    ];
    
    const mockPriceData = [
      { month: 'Jan', residential: 1200, commercial: 1900, agricultural: 800 },
      { month: 'Feb', residential: 1250, commercial: 1800, agricultural: 820 },
      { month: 'Mar', residential: 1400, commercial: 2100, agricultural: 850 },
      { month: 'Apr', residential: 1350, commercial: 2000, agricultural: 900 },
      { month: 'May', residential: 1500, commercial: 2300, agricultural: 950 },
      { month: 'Jun', residential: 1650, commercial: 2500, agricultural: 1000 },
    ];
    
    const mockTopProperties = [
      { id: '1', location: 'Kampala Central', price: 450000000, type: 'Residential', salesDate: '2025-04-15' },
      { id: '2', location: 'Entebbe Road', price: 380000000, type: 'Commercial', salesDate: '2025-04-02' },
      { id: '3', location: 'Muyenga Hill', price: 520000000, type: 'Residential', salesDate: '2025-03-28' },
      { id: '4', location: 'Kololo', price: 780000000, type: 'Residential', salesDate: '2025-03-20' },
      { id: '5', location: 'Nakasero', price: 640000000, type: 'Commercial', salesDate: '2025-03-15' },
    ];
    
    return { 
      typeData: mockTypeData, 
      priceData: mockPriceData, 
      topProperties: mockTopProperties,
      error: null 
    };
  } catch (error) {
    console.error('Error fetching property insights data:', error);
    return { typeData: [], priceData: [], topProperties: [], error };
  }
}

// Field Officer Activity Data - Using mock data only
export async function fetchFieldOfficerActivityData() {
  try {
    // Since field_officer_activities table doesn't exist, we'll use mock data
    const mockActivityData = [
      { date: '05/01', visits: 12, applications: 8, approvals: 4 },
      { date: '05/02', visits: 15, applications: 10, approvals: 7 },
      { date: '05/03', visits: 18, applications: 12, approvals: 9 },
      { date: '05/04', visits: 14, applications: 9, approvals: 6 },
      { date: '05/05', visits: 21, applications: 15, approvals: 11 },
      { date: '05/06', visits: 16, applications: 11, approvals: 8 },
      { date: '05/07', visits: 24, applications: 18, approvals: 13 },
    ];
    
    const mockOfficerData = [
      { id: '1', name: 'John Mukasa', visits: 87, applications: 62, approvals: 48, region: 'Central' },
      { id: '2', name: 'Mary Achieng', visits: 95, applications: 71, approvals: 56, region: 'Eastern' },
      { id: '3', name: 'David Opio', visits: 78, applications: 54, approvals: 41, region: 'Northern' },
      { id: '4', name: 'Sarah Nambi', visits: 92, applications: 68, approvals: 52, region: 'Western' },
      { id: '5', name: 'Michael Okello', visits: 83, applications: 59, approvals: 45, region: 'Central' },
    ];
    
    const mockRecentActivities = [
      { id: '1', officer: 'John Mukasa', activity: 'Client Visit', client: 'Kampala Traders Ltd', timestamp: '2025-05-14T10:30:00', status: 'completed' },
      { id: '2', officer: 'Mary Achieng', activity: 'Loan Application', client: 'Eastern Farmers Co-op', timestamp: '2025-05-14T09:15:00', status: 'completed' },
      { id: '3', officer: 'David Opio', activity: 'Document Collection', client: 'Northern Textiles', timestamp: '2025-05-14T11:45:00', status: 'pending' },
      { id: '4', officer: 'Sarah Nambi', activity: 'Property Appraisal', client: 'Mbarara Holdings', timestamp: '2025-05-14T08:20:00', status: 'completed' },
      { id: '5', officer: 'Michael Okello', activity: 'Loan Approval', client: 'Entebbe Tours', timestamp: '2025-05-14T12:10:00', status: 'cancelled' },
      { id: '6', officer: 'John Mukasa', activity: 'Follow-up Meeting', client: 'Central Electronics', timestamp: '2025-05-14T13:30:00', status: 'pending' },
    ];
    
    return { 
      activityData: mockActivityData, 
      officerData: mockOfficerData, 
      recentActivities: mockRecentActivities,
      error: null 
    };
  } catch (error) {
    console.error('Error fetching field officer activity data:', error);
    return { activityData: [], officerData: [], recentActivities: [], error };
  }
}

// Risk Profile Data - Using mock data only
export async function fetchRiskProfileData() {
  try {
    // Since risk_profiles table doesn't exist, we'll use mock data
    const mockRiskData = [
      { region: 'Central', district: 'Kampala', risk_score: 78, total_loans: 2450, default_rate: 4.2, average_loan_size: 12500000 },
      { region: 'Eastern', district: 'Jinja', risk_score: 65, total_loans: 1876, default_rate: 3.8, average_loan_size: 8750000 },
      { region: 'Northern', district: 'Gulu', risk_score: 82, total_loans: 1234, default_rate: 5.1, average_loan_size: 7500000 },
      { region: 'Western', district: 'Mbarara', risk_score: 58, total_loans: 1567, default_rate: 2.9, average_loan_size: 9250000 },
      { region: 'Central', district: 'Entebbe', risk_score: 71, total_loans: 987, default_rate: 3.5, average_loan_size: 11000000 },
    ];
    
    return { data: mockRiskData, error: null };
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
  
  // If no data from database, use mock data
  if (monthMap.size === 0) {
    return getMockLoanPerformanceData();
  }
  
  // Convert map to array sorted by date
  return Array.from(monthMap.values())
    .sort((a, b) => {
      const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                         'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      return monthOrder[a.month as keyof typeof monthOrder] - monthOrder[b.month as keyof typeof monthOrder];
    });
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

// The rest of the formatting helper functions are not necessary since we're using mock data directly
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
