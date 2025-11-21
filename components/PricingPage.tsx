
import React, { useState } from 'react';
import { UserPlan } from '../types';
import { paymentService } from '../services/payment';

interface PricingPageProps {
  currentPlan?: UserPlan;
  userId?: string;
  onSelectPlan: (plan: string) => void;
  onBack: () => void;
  onPaymentSuccess?: (plan: UserPlan) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentPlan, userId, onSelectPlan, onBack, onPaymentSuccess }) => {
  const [processingPlan, setProcessingPlan] = useState<UserPlan | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePlanSelection = async (plan: UserPlan) => {
    if (!userId || plan === 'free') {
      onSelectPlan(plan);
      return;
    }

    setProcessingPlan(plan);
    setPaymentError(null);

    try {
      const { clientSecret } = await paymentService.createSubscription(userId, plan);

      // In a real implementation, you'd redirect to Stripe Checkout or use Elements
      // For now, we'll simulate the payment process
      alert(`Payment processing for ${paymentService.getPlanName(plan)} - $${paymentService.getPlanPrice(plan)}/month`);

      // Simulate successful payment
      onSelectPlan(plan);
      onPaymentSuccess?.(plan);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 relative">
        {/* Header with Back Button */}
        <div className="text-center mb-12 pt-6 relative">
             <button 
               onClick={onBack}
               className="absolute left-4 top-6 md:left-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
             >
                <i className="fa-solid fa-arrow-left text-white"></i>
             </button>
             <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
             <p className="text-gray-400 max-w-2xl mx-auto">Unlock the full potential of PlayNite with our flexible pricing options. Cancel anytime.</p>
             {paymentError && (
               <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-center">
                 {paymentError}
               </div>
             )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 lg:px-20">
           
           {/* Free Tier */}
           <div className={`bg-dark-card border ${currentPlan === 'free' ? 'border-gray-500' : 'border-gray-800'} rounded-3xl p-8 relative overflow-hidden hover:border-gray-600 transition-colors`}>
              <div className="mb-6">
                 <h3 className="text-xl font-bold text-white mb-1">Guest / Free</h3>
                 <p className="text-3xl font-bold text-white">$0</p>
                 <p className="text-xs text-gray-500 mt-1">Basic Access</p>
              </div>
              <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <i className="fa-solid fa-check text-gray-500"></i> Limited Videos
                 </li>
                 <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <i className="fa-solid fa-check text-gray-500"></i> SD Quality (720p)
                 </li>
                 <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <i className="fa-solid fa-check text-gray-500"></i> Ad-Supported
                 </li>
                 <li className="flex items-center gap-3 text-gray-500 text-sm opacity-50">
                    <i className="fa-solid fa-xmark"></i> No Downloads
                 </li>
              </ul>
              <button
                onClick={() => handlePlanSelection('free')}
                disabled={currentPlan === 'free' || processingPlan === 'free'}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${currentPlan === 'free' ? 'bg-gray-700 text-gray-400 cursor-default' : 'border border-gray-600 text-white hover:bg-gray-800'}`}
              >
                {processingPlan === 'free' ? 'Processing...' : currentPlan === 'free' ? 'Current Plan' : 'Select Free'}
              </button>
           </div>

           {/* Premium Tier */}
           <div className={`bg-dark-card border ${currentPlan === 'premium' ? 'border-brand-500' : 'border-brand-900'} rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-brand-900/20`}>
              <div className="mb-6">
                 <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                 <p className="text-3xl font-bold text-white">$9.99 <span className="text-sm font-normal text-gray-500">/ mo</span></p>
                 <p className="text-xs text-gray-500 mt-1">Most Popular</p>
              </div>
              <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3 text-white text-sm font-medium">
                    <i className="fa-solid fa-check text-brand-500"></i> Unlimited Streaming
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm font-medium">
                    <i className="fa-solid fa-check text-brand-500"></i> HD Quality (1080p)
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm font-medium">
                    <i className="fa-solid fa-check text-brand-500"></i> Create Playlists
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm font-medium">
                    <i className="fa-solid fa-check text-brand-500"></i> VR Experience
                 </li>
              </ul>
              <button
                onClick={() => handlePlanSelection('premium')}
                disabled={currentPlan === 'premium' || processingPlan === 'premium'}
                className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg ${currentPlan === 'premium' ? 'bg-brand-900/50 text-brand-200 cursor-default' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-900/40'}`}
              >
                {processingPlan === 'premium' ? 'Processing...' : currentPlan === 'premium' ? 'Current Plan' : 'Get Premium'}
              </button>
           </div>

           {/* Blueberry Ultra Tier */}
           <div className={`bg-[#050b1d] border-2 ${currentPlan === 'blueberry' ? 'border-cyan-500' : 'border-indigo-500'} rounded-3xl p-8 relative overflow-hidden hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all transform md:-translate-y-4 group`}>
              {/* Ribbon */}
              <div className="absolute top-6 -right-12 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-bold px-12 py-1 rotate-45 shadow-lg z-20">
                 BEST VALUE
              </div>
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
              <div className="absolute top-4 left-4 text-indigo-400 text-2xl">
                 <i className="fa-solid fa-atom animate-spin-slow"></i>
              </div>

              <div className="mb-6 relative z-10 mt-4">
                 <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-1">Blueberry</h3>
                 <p className="text-3xl font-bold text-white">$19.99 <span className="text-sm font-normal text-gray-500">/ mo</span></p>
                 <p className="text-xs text-indigo-300 mt-1">Professional Grade</p>
              </div>
              <ul className="space-y-4 mb-8 relative z-10">
                 <li className="flex items-center gap-3 text-white text-sm">
                    <i className="fa-solid fa-check text-cyan-400"></i> 8K / 4K Upscaling
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm">
                    <i className="fa-solid fa-check text-cyan-400"></i> Spatial Audio
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm">
                    <i className="fa-solid fa-check text-cyan-400"></i> Creator Analytics
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm">
                    <i className="fa-solid fa-check text-cyan-400"></i> Priority Support
                 </li>
                 <li className="flex items-center gap-3 text-white text-sm">
                    <i className="fa-solid fa-check text-cyan-400"></i> Studio Pro Access
                 </li>
              </ul>
              
              {/* Decorative Glow */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] pointer-events-none"></div>

              <button
                onClick={() => handlePlanSelection('blueberry')}
                disabled={currentPlan === 'blueberry' || processingPlan === 'blueberry'}
                className={`w-full py-3 rounded-xl font-bold transition-transform relative z-10 shadow-lg flex items-center justify-center gap-2 ${currentPlan === 'blueberry' ? 'bg-indigo-900/50 text-indigo-200 cursor-default' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:scale-105 shadow-indigo-900/50'}`}
              >
                <i className="fa-solid fa-bolt"></i> {processingPlan === 'blueberry' ? 'Processing...' : currentPlan === 'blueberry' ? 'Current Plan' : 'Get Blueberry'}
              </button>
           </div>

        </div>
    </div>
  );
};

export default PricingPage;
