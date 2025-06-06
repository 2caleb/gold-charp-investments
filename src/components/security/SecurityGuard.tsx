
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/use-security-validation';

interface SecurityGuardProps {
  action: 'canUploadExcel' | 'canViewFinancials' | 'canModifyExpenses' | 'canViewLoanApplications' | 'canModifyLoanApplications';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({
  action,
  children,
  fallback,
  showMessage = true,
}) => {
  const { validateAction, getSecurityMessage, isAuthenticated } = useSecurityValidation();

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
          <AlertDescription>
            {getSecurityMessage(action)}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default SecurityGuard;
