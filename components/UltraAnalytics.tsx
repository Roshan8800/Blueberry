
import React from 'react';

interface UltraAnalyticsProps {
  onBack: () => void;
}

const UltraAnalytics: React.FC<UltraAnalyticsProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-800 transition-colors"
                >
                   <i className="fa-solid fa-arrow-left text-white"></i>
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded uppercase">Blueberry Exclusive</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Creator Analytics</h1>
                    <p className="text-gray-400 text-sm">Advanced insights for your content consumption and creation.</p>
                </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <i className="fa-solid fa-download"></i> Export Report
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
                { label: 'Total Watch Time', val: '128h', sub: '+12% vs last month', icon: 'fa-clock', color: 'text-cyan-400' },
                { label: 'Engagement Score', val: '94.2', sub: 'Top 5% of users', icon: 'fa-chart-line', color: 'text-indigo-400' },
                { label: 'Content Value', val: '$4,200', sub: 'Est. consumption value', icon: 'fa-gem', color: 'text-purple-400' },
                { label: 'Network Speed', val: '420 Mbps', sub: 'Avg. streaming bitrate', icon: 'fa-wifi', color: 'text-emerald-400' }
            ].map((stat, idx) => (
                <div key={idx} className="bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className={`fa-solid ${stat.icon} text-6xl text-white`}></i>
                    </div>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{stat.val}</h3>
                    <p className={`text-xs font-medium ${stat.color}`}>{stat.sub}</p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart Area (Mock) */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-6">Activity Heatmap</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[...Array(24)].map((_, i) => {
                        const height = Math.floor(Math.random() * 80) + 20;
                        return (
                            <div key={i} className="w-full bg-indigo-900/30 rounded-t-md relative group">
                                <div 
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-cyan-500 rounded-t-md transition-all duration-500 group-hover:opacity-100"
                                    style={{ height: `${height}%` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-4">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                </div>
            </div>

            {/* Side Lists */}
            <div className="bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-6">Top Categories</h3>
                <div className="space-y-4">
                    {[
                        { name: 'VR Experience', pct: 45, color: 'bg-cyan-500' },
                        { name: 'Cinematic 4K', pct: 30, color: 'bg-indigo-500' },
                        { name: 'Live Events', pct: 15, color: 'bg-purple-500' },
                        { name: 'Shorts', pct: 10, color: 'bg-gray-500' }
                    ].map((cat, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm text-gray-300 mb-1">
                                <span>{cat.name}</span>
                                <span>{cat.pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <h4 className="text-white text-sm font-bold mb-3">AI Insights</h4>
                    <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                        <p className="text-xs text-indigo-200 italic">"Based on your viewing, you prefer high-framerate content in the evening. We've pre-cached 3 exclusive videos for tonight."</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UltraAnalytics;
