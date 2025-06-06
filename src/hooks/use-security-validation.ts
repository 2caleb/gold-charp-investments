
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from './use-role-permissions';
import { useDirectorCaleb } from './use-director-caleb';

export const useSecurityValidation = () => {
  const { user } = useAuth();
  const { userRole, hasPermission } = useRolePermissions();
  const { isDirectorCaleb } = useDirectorCaleb();
  const [securityContext, setSecurityContext] = useState({
    canUploadExcel: false,
    canViewFinancials: false,
    canModifyExpenses: false,
    canViewLoanApplications: false,
    canModifyLoanApplications: false,
  });

  useEffect(() => {
    if (!user || !userRole) {
      setSecurityContext({
        canUploadExcel: false,
        canViewFinancials: false,
        canModifyExpenses: false,
        canViewLoanApplications: false,
        canModifyLoanApplications: false,
      });
      return;
    }

    const isManagement = ['manager', 'director', 'ceo', 'chairperson'].includes(userRole);
    const isExecutive = ['director', 'ceo', 'chairperson'].includes(userRole);
    const isStaff = ['field_officer', 'manager', 'director', 'ceo', 'chairperson'].includes(userRole);

    setSecurityContext({
      canUploadExcel: isDirectorCaleb,
      canViewFinancials: isExecutive,
      canModifyExpenses: isManagement,
      canViewLoanApplications: isStaff,
      canModifyLoanApplications: isStaff,
    });
  }, [user, userRole, isDirectorCaleb]);

  const validateAction = (action: keyof typeof securityContext): boolean => {
    return securityContext[action];
  };

  const getSecurityMessage = (action: keyof typeof securityContext): string => {
    const messages = {
      canUploadExcel: 'Excel uploads are restricted to Director Caleb only.',
      canViewFinancials: 'Financial data access requires executive privileges.',
      canModifyExpenses: 'Expense management requires management role.',
      canViewLoanApplications: 'Loan application access requires staff privileges.',
      canModifyLoanApplications: 'Loan modification requires staff privileges.',
    };
    return messages[action];
  };

  return {
    securityContext,
    validateAction,
    getSecurityMessage,
    isAuthenticated: !!user,
    userRole,
  };
};
