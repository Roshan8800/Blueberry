
import React from 'react';

interface UltraAnalyticsProps {
  onBack: () => void;
}

const UltraAnalytics: React.FC<UltraAnalyticsProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in">
      <button onClick={onBack} className="text-gray-400 hover:text-white mb-4"><i className="fa-solid fa-arrow-left"></i> Back</button>
      <h1 className="text-3xl font-bold mb-8">Ultra Analytics</h1>
      <div className="bg-dark-card p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Advanced Analytics for Your Content</h2>
        <p className="text-gray-400">Dive deep into your content's performance. Track views, engagement, and audience demographics to optimize your strategy.</p>
      </div>
    </div>
  );
};

export default UltraAnalytics;
