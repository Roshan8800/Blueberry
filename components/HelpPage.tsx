
import React from 'react';

const HelpPage: React.FC = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Help Center</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Account Issues', 'Billing & Subscription', 'Video Playback', 'Privacy & Security', 'Creator Tools', 'Report Content'].map(topic => (
                    <div key={topic} className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-brand-500 transition-colors cursor-pointer group">
                            <h3 className="font-bold text-white text-lg mb-2 group-hover:text-brand-500">{topic}</h3>
                            <p className="text-gray-400 text-sm">Get help with {topic.toLowerCase()} related questions.</p>
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
                <p className="text-gray-400 mb-4">Still need help?</p>
                <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Contact Support</button>
            </div>
        </div>
    );
};

export default HelpPage;
