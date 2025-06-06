
// Client statistics calculation utilities

// Define application status categories
export const getApplicationStatusCategory = (status: string): 'active' | 'approved' | 'rejected' | 'completed' => {
  const normalizedStatus = status.toLowerCase().replace('_', ' ').trim();
  
  switch (normalizedStatus) {
    case 'submitted':
    case 'pending manager':
    case 'pending director':
    case 'pending ceo':
    case 'pending chairperson':
    case 'under review':
    case 'in review':
    case 'processing':
      return 'active';
    
    case 'approved':
    case 'disbursed':
    case 'completed':
      return 'approved';
    
    case 'rejected':
    case 'declined':
    case 'cancelled':
      return 'rejected';
    
    default:
      // If status is unclear, consider it active if it's not explicitly negative
      return normalizedStatus.includes('reject') || normalizedStatus.includes('decline') || normalizedStatus.includes('cancel') 
        ? 'rejected' 
        : 'active';
  }
};

// Calculate enhanced client statistics
export const calculateClientStatistics = (applications: any[]) => {
  const activeApplications = applications.filter(app => 
    getApplicationStatusCategory(app.status) === 'active'
  ).length;
  
  const approvedLoans = applications.filter(app => 
    getApplicationStatusCategory(app.status) === 'approved'
  ).length;
  
  const totalLoanAmount = applications.reduce((sum, app) => {
    // Handle different loan amount formats
    let amount = 0;
    if (typeof app.loan_amount === 'string') {
      amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
    } else if (typeof app.loan_amount === 'number') {
      amount = app.loan_amount;
    }
    return sum + amount;
  }, 0);
  
  return {
    totalApplications: applications.length,
    activeApplications,
    approvedLoans,
    totalLoanAmount
  };
};
