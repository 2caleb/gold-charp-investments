
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle, Eye } from 'lucide-react';
import { useEnhancedSecurityValidation } from '@/hooks/use-enhanced-security-validation';

interface EnhancedSecurityGuardProps {
  action: 'canUploadExcel' | 'canViewFinancials' | 'canModifyExpenses' | 'canViewLoanApplications' | 'canModifyLoanApplications' | 'canModifyRoles' | 'canViewAuditLogs';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  logAttempt?: boolean;
}

const EnhancedSecurityGuard: React.FC<EnhancedSecurityGuardProps> = ({
  action,
  children,
  fallback,
  showMessage = true,
  logAttempt = true,
}) => {
  const { validateAction, getSecurityMessage, isAuthenticated, logSecurityEvent } = useEnhancedSecurityValidation();

  React.useEffect(() => {
    if (logAttempt && !validateAction(action)) {
      logSecurityEvent('unauthorized_access_attempt', {
        action,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });
    }
  }, [action, logAttempt, validateAction, logSecurityEvent]);

  if (!isAuthenticated) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Authentication required to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (!validateAction(action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {getSecurityMessage(action)}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default EnhancedSecurityGuard;
