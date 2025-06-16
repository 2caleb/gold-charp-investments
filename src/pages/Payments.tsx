
import React from 'react';
import SecurityGuard from '@/components/security/SecurityGuard';
import SimplePaymentCenter from '@/components/payments/SimplePaymentCenter';

const Payments = () => {
  return (
    <SecurityGuard action="canViewFinancials">
      <div className="container mx-auto px-4 py-8">
        <SimplePaymentCenter />
      </div>
    </SecurityGuard>
  );
};

export default Payments;
