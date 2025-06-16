
import React from 'react';
import { SecurityGuard } from '@/components/security/SecurityGuard';
import EnhancedPaymentCenter from '@/components/payments/EnhancedPaymentCenter';

const Payments = () => {
  return (
    <SecurityGuard>
      <div className="container mx-auto px-4 py-8">
        <EnhancedPaymentCenter />
      </div>
    </SecurityGuard>
  );
};

export default Payments;
