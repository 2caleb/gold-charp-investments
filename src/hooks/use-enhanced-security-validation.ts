
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
}

export const useEnhancedSecurityValidation = () => {
  const { user } = useAuth();
  const { userRole, hasPermission } = useRolePermissions();
  const { isDirectorCaleb } = useDirectorCaleb();
  const [securityContext, setSecurityContext] = useState<SecurityValidationContext>({
    canUploadExcel: false,
    canViewFinancials: false,
    canModifyExpenses: false,
    canViewLoanApplications: false,
    canModifyLoanApplications: false,
    canModifyRoles: false,
    canViewAuditLogs: false,
  });

  // Enhanced audit logging function
  const logSecurityEvent = async (
    eventType: string,
    details: Record<string, any> = {}
  ) => {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        event_type: eventType,
        table_name: 'security_events',
        record_id: crypto.randomUUID(),
        details: details
      });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
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
      });
      return;
    }

    const isManagement = ['manager', 'director', 'ceo', 'chairperson'].includes(userRole);
    const isExecutive = ['director', 'ceo', 'chairperson'].includes(userRole);
    const isStaff = ['field_officer', 'manager', 'director', 'ceo', 'chairperson'].includes(userRole);
    const isCEOOrChairperson = ['ceo', 'chairperson'].includes(userRole);

    setSecurityContext({
      canUploadExcel: isDirectorCaleb,
      canViewFinancials: isExecutive,
      canModifyExpenses: isManagement,
      canViewLoanApplications: isStaff,
      canModifyLoanApplications: isStaff,
      canModifyRoles: isCEOOrChairperson,
      canViewAuditLogs: isExecutive,
    });

    // Log security context changes
    logSecurityEvent('security_context_updated', {
      user_id: user.id,
      role: userRole,
      permissions: securityContext
    });
  }, [user, userRole, isDirectorCaleb]);

  const validateAction = (action: keyof SecurityValidationContext): boolean => {
    const hasPermission = securityContext[action];
    
    // Log permission checks for sensitive actions
    if (['canModifyRoles', 'canViewFinancials', 'canUploadExcel'].includes(action)) {
      logSecurityEvent('permission_check', {
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
    };
    return messages[action];
  };

  return {
    securityContext,
    validateAction,
    getSecurityMessage,
    logSecurityEvent,
    isAuthenticated: !!user,
    userRole,
  };
};
