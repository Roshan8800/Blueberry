import React, { useState, useEffect } from 'react';
import { Payment, UserPlan } from '../types';
import { paymentService } from '../services/payment';

interface BillingPageProps {
  userId: string;
  currentPlan?: UserPlan;
  onBack: () => void;
  onManageSubscription?: () => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ userId, currentPlan, onBack, onManageSubscription }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentHistory();
  }, [userId]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const paymentHistory = await paymentService.getPaymentHistory(userId);
      setPayments(paymentHistory);
    } catch (err) {
      console.error('Error loading payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'refunded': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return 'fa-credit-card';
      case 'tip': return 'fa-heart';
      case 'one_time': return 'fa-shopping-cart';
      default: return 'fa-dollar-sign';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-white"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Billing & Payments</h1>
            <p className="text-gray-400 mt-1">Manage your subscription and view payment history</p>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Current Plan</h3>
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {currentPlan === 'premium' ? 'Premium' : currentPlan === 'blueberry' ? 'Ultra' : 'Free'}
              </span>
              {currentPlan !== 'free' && (
                <span className="text-gray-400 text-sm">
                  ${paymentService.getPlanPrice(currentPlan!)}/month
                </span>
              )}
            </div>
          </div>
          {currentPlan !== 'free' && onManageSubscription && (
            <button
              onClick={onManageSubscription}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-500 transition-colors"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Payment History</h3>
          <p className="text-gray-400 text-sm mt-1">View all your transactions and invoices</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading payment history...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <i className="fa-solid fa-exclamation-triangle text-red-400 text-3xl mb-4"></i>
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadPaymentHistory}
              className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fa-solid fa-receipt text-gray-600 text-3xl mb-4"></i>
            <p className="text-gray-400">No payment history found</p>
            <p className="text-gray-500 text-sm mt-1">Your transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                      <i className={`fa-solid ${getTypeIcon(payment.type)} text-gray-400`}></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{payment.description}</h4>
                      <p className="text-gray-400 text-sm">
                        {formatDate(payment.createdAt)} • {payment.currency.toUpperCase()} ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    {payment.stripePaymentIntentId && (
                      <p className="text-gray-500 text-xs mt-1">
                        ID: {payment.stripePaymentIntentId.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-dark-card p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <i className="fa-solid fa-envelope text-brand-500"></i>
            <div>
              <p className="text-white font-medium">Contact Support</p>
              <p className="text-gray-400 text-sm">Get help with billing issues</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <i className="fa-solid fa-file-invoice text-brand-500"></i>
            <div>
              <p className="text-white font-medium">Download Invoices</p>
              <p className="text-gray-400 text-sm">Access your payment receipts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;