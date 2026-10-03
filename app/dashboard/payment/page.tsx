import React from 'react';
import PaymentContainer from '@/components/modules/DadhboardModules/dashboard/PaymentContainer';

export default function PaymentPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Payment <span className="tf-gradient-text">History</span></h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View payment history, status, and manage payments
        </p>
      </div>
      <PaymentContainer />
    </div>
  );
}
