
import { LoanApplicationWithWorkflow, DashboardMetrics } from '@/types/dashboard';

export const calculateDashboardMetrics = (applications: LoanApplicationWithWorkflow[]): DashboardMetrics => {
  console.log('Processing dashboard metrics for', applications.length, 'applications');

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    app.status.startsWith('pending_') || app.status === 'submitted'
  ).length;
  const approvedApplications = applications.filter(app => 
    app.status === 'approved'
  ).length;
  const rejectedApplications = applications.filter(app => 
    app.status === 'rejected'
  ).length;

  // Calculate loan amounts
  const totalLoanAmount = applications.reduce((sum, app) => {
    const amount = parseFloat(app.loan_amount.replace(/[^0-9.]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const averageLoanAmount = totalApplications > 0 ? totalLoanAmount / totalApplications : 0;

  // Get recent applications (last 10)
  const recentApplications = applications.slice(0, 10).map(app => ({
    ...app,
    current_stage: app.loan_applications_workflow?.[0]?.current_stage || 'submitted',
    workflow_status: getWorkflowStatus(app)
  }));

  // Calculate workflow stage statistics
  const workflowStats = {
    manager: applications.filter(app => 
      app.loan_applications_workflow?.[0]?.current_stage === 'manager'
    ).length,
    director: applications.filter(app => 
      app.loan_applications_workflow?.[0]?.current_stage === 'director'
    ).length,
    chairperson: applications.filter(app => 
      app.loan_applications_workflow?.[0]?.current_stage === 'chairperson'
    ).length,
    ceo: applications.filter(app => 
      app.loan_applications_workflow?.[0]?.current_stage === 'ceo'
    ).length,
  };

  console.log('Dashboard metrics calculated:', {
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    workflowStats
  });

  return {
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalLoanAmount,
    averageLoanAmount,
    recentApplications,
    workflowStats
  };
};

export const getWorkflowStatus = (app: LoanApplicationWithWorkflow): string => {
  const workflow = app.loan_applications_workflow?.[0];
  if (!workflow) return 'No Workflow';

  const { current_stage, field_officer_approved, manager_approved, director_approved, chairperson_approved, ceo_approved } = workflow;

  if (ceo_approved === true) return 'Completed - Approved';
  if (ceo_approved === false) return 'Completed - Rejected';
  
  switch (current_stage) {
    case 'manager':
      return field_officer_approved ? 'Pending Manager Review' : 'Pending Field Officer';
    case 'director':
      return 'Pending Director Review';
    case 'chairperson':
      return 'Pending Chairperson Review';
    case 'ceo':
      return 'Pending CEO Final Decision';
    default:
      return 'In Progress';
  }
};
