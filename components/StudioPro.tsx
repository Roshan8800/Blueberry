
import React from 'react';

interface StudioProProps {
  onBack: () => void;
}

const StudioPro: React.FC<StudioProProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-4"><i className="fa-solid fa-arrow-left"></i> Back</button>
       <h1 className="text-3xl font-bold mb-8">Studio Pro</h1>
       <div className="bg-dark-card p-6 rounded-lg border border-gray-800">
         <h2 className="text-xl font-bold mb-4">Welcome to Studio Pro</h2>
         <p className="text-gray-400">This is your creative hub. Manage your content, view analytics, and interact with your audience.</p>
       </div>
    </div>
  );
};

export default StudioPro;
