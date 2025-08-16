
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePermissions } from './use-role-permissions';
import { useDirectorCaleb } from './use-director-caleb';
import { supabase } from '@/integrations/supabase/client';

interface SecurityValidationContext {
  canUploadExcel: boolean;
  canViewFinancials: boolean;
  canModifyExpenses: boolean;
  canViewLoanApplications: boolean;
  canModifyLoanApplications: boolean;
  canModifyRoles: boolean;
  canViewAuditLogs: boolean;
  canCreateDeliveries: boolean;
}

export const useEnhancedSecurityValidation = () => {
  const { user } = useAuth();
  const { userRole, hasPermission, logSecurityEvent } = useRolePermissions();
  const { isDirectorCaleb } = useDirectorCaleb();
  const [securityContext, setSecurityContext] = useState<SecurityValidationContext>({
    canUploadExcel: false,
    canViewFinancials: false,
    canModifyExpenses: false,
    canViewLoanApplications: false,
    canModifyLoanApplications: false,
    canModifyRoles: false,
    canViewAuditLogs: false,
    canCreateDeliveries: false,
  });

  // Enhanced audit logging function using direct database insert
  const logSecurityEventLocal = async (
    eventType: string,
    details: Record<string, any> = {}
  ) => {
    try {
      await supabase
        .from('transaction_audit_log')
        .insert({
          action: eventType,
          user_id: user?.id,
          details: details,
          timestamp: new Date().toISOString()
        });
    } catch (err) {
      console.error('Security logging error:', err);
    }
  };

  useEffect(() => {
    if (!user || !userRole) {
      setSecurityContext({
        canUploadExcel: false,
        canViewFinancials: false,
        canModifyExpenses: false,
        canViewLoanApplications: false,
        canModifyLoanApplications: false,
        canModifyRoles: false,
        canViewAuditLogs: false,
        canCreateDeliveries: false,
      });
      return;
    }

    const isManagement = ['manager', 'director', 'ceo', 'chairperson'].includes(userRole);
    const isExecutive = ['director', 'ceo', 'chairperson'].includes(userRole);
    const isStaff = ['field_officer', 'manager', 'director', 'ceo', 'chairperson'].includes(userRole);
    const isCEOOrChairperson = ['ceo', 'chairperson'].includes(userRole);

    const newSecurityContext = {
      canUploadExcel: isDirectorCaleb,
      canViewFinancials: isExecutive,
      canModifyExpenses: isManagement,
      canViewLoanApplications: isStaff,
      canModifyLoanApplications: isStaff,
      canModifyRoles: isCEOOrChairperson,
      canViewAuditLogs: isExecutive,
      canCreateDeliveries: isDirectorCaleb,
    };

    setSecurityContext(newSecurityContext);

    // Log security context changes
    logSecurityEventLocal('security_context_updated', {
      user_id: user.id,
      role: userRole,
      permissions: newSecurityContext
    });
  }, [user, userRole, isDirectorCaleb]);

  const validateAction = (action: keyof SecurityValidationContext): boolean => {
    const hasPermission = securityContext[action];
    
    // Log permission checks for sensitive actions
    if (['canModifyRoles', 'canViewFinancials', 'canUploadExcel', 'canCreateDeliveries'].includes(action)) {
      logSecurityEventLocal('permission_check', {
        action,
        user_id: user?.id,
        role: userRole,
        granted: hasPermission
      });
    }
    
    return hasPermission;
  };

  const getSecurityMessage = (action: keyof SecurityValidationContext): string => {
    const messages = {
      canUploadExcel: 'Excel uploads are restricted to Director Caleb only for security reasons.',
      canViewFinancials: 'Financial data access requires executive privileges.',
      canModifyExpenses: 'Expense management requires management role or higher.',
      canViewLoanApplications: 'Loan application access requires staff privileges.',
      canModifyLoanApplications: 'Loan modification requires staff privileges.',
      canModifyRoles: 'Role management is restricted to CEO and Chairperson only.',
      canViewAuditLogs: 'Audit log access requires executive privileges.',
      canCreateDeliveries: 'Delivery creation is restricted to Director Caleb only for data integrity.',
    };
    return messages[action];
  };

  return {
    securityContext,
    validateAction,
    getSecurityMessage,
    logSecurityEvent: logSecurityEventLocal,
    isAuthenticated: !!user,
    userRole,
  };
};
