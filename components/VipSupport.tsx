
import React from 'react';

interface VipSupportProps {
  onBack: () => void;
}

const VipSupport: React.FC<VipSupportProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-4"><i className="fa-solid fa-arrow-left"></i> Back</button>
      <h1 className="text-3xl font-bold mb-8">VIP Support</h1>
      <div className="bg-dark-card p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Exclusive Support for our VIPs</h2>
        <p className="text-gray-400">As a VIP member, you have access to our dedicated support team. We're here to help you with any issues or questions you may have.</p>
      </div>
    </div>
  );
};

export default VipSupport;
