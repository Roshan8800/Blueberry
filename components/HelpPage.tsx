
import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in">
      <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
      <div className="space-y-6">
        <div className="bg-dark-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Browse our FAQs to find answers to common questions about your account, billing, and our service.</p>
        </div>
        <div className="bg-dark-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-400">Can't find what you're looking for? Contact our support team directly for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
