
import React, { useEffect, useState } from 'react';
import { fetchVideos } from '../services/firebase';
import { Video } from '../types';

interface StudioProProps {
  onBack: () => void;
}

const StudioPro: React.FC<StudioProProps> = ({ onBack }) => {
  const [stats, setStats] = useState({ revenue: 0, views: 0, subs: 0 });
  const [recentUploads, setRecentUploads] = useState<Video[]>([]);

  useEffect(() => {
      const loadStats = async () => {
          const vids = await fetchVideos();
          const totalViews = vids.reduce((acc, v) => {
              // Parse views: "1.2M" -> 1200000, "15k" -> 15000, "123" -> 123
              let count = 0;
              const s = v.views.toLowerCase();
              if (s.includes('m')) count = parseFloat(s) * 1000000;
              else if (s.includes('k')) count = parseFloat(s) * 1000;
              else count = parseInt(s) || 0;
              return acc + count;
          }, 0);

          setStats({
              revenue: totalViews * 0.005, // Mock CPM
              views: totalViews,
              subs: Math.floor(totalViews * 0.01)
          });
          setRecentUploads(vids.slice(0, 5));
      };
      loadStats();
  }, []);

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
                       <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                          Studio Pro
                       </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
                    <p className="text-gray-400 text-sm">Manage your content, streams, and earnings with professional tools.</p>
                </div>
            </div>
            <div className="flex gap-3">
               <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
                  <i className="fa-solid fa-gear"></i> Settings
               </button>
               <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/50">
                  <i className="fa-solid fa-cloud-arrow-up"></i> Upload New
               </button>
            </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
                { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, change: '+8.2%', icon: 'fa-sack-dollar', color: 'text-green-400' },
                { title: 'Total Views', value: stats.views.toLocaleString(), change: '+15%', icon: 'fa-eye', color: 'text-blue-400' },
                { title: 'Subscribers', value: stats.subs.toLocaleString(), change: '+240 this week', icon: 'fa-heart', color: 'text-pink-400' },
                { title: 'Stream Health', value: 'Excellent', change: '1080p @ 60fps', icon: 'fa-signal', color: 'text-cyan-400' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                           <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                           <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                           <p className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.change}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                           <i className={`fa-solid ${stat.icon} text-lg`}></i>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold">Performance Overview</h3>
                    <div className="flex bg-black/30 rounded-lg p-1">
                       <button className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md shadow">Revenue</button>
                       <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white">Views</button>
                       <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white">Subs</button>
                    </div>
                </div>
                
                {/* Mock Chart Visual */}
                <div className="flex-1 flex items-end justify-between gap-2 px-2 relative">
                   {/* Grid lines */}
                   <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="w-full h-px bg-indigo-500"></div>
                      <div className="w-full h-px bg-indigo-500"></div>
                      <div className="w-full h-px bg-indigo-500"></div>
                      <div className="w-full h-px bg-indigo-500"></div>
                      <div className="w-full h-px bg-indigo-500"></div>
                   </div>

                   {[...Array(30)].map((_, i) => {
                      const height = Math.random() * 70 + 10;
                      return (
                         <div key={i} className="flex-1 bg-indigo-500/20 rounded-t hover:bg-cyan-500/50 transition-colors relative group" style={{height: `${height}%`}}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                               ${(height * 100).toFixed(0)}
                            </div>
                         </div>
                      );
                   })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
                   <span>Nov 1</span>
                   <span>Nov 15</span>
                   <span>Nov 30</span>
                </div>
            </div>

            {/* Upload Queue / Recent */}
            <div className="bg-[#0f172a] border border-indigo-900/30 rounded-2xl p-6">
               <h3 className="text-white font-bold mb-6">Recent Uploads</h3>
               <div className="space-y-4">
                  {recentUploads.map((video) => (
                     <div key={video.id} className="flex gap-3 items-center p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                        <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden relative">
                           <img src={video.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-medium text-white truncate">{video.title}</h4>
                           <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="text-green-400">Monetized</span>
                              <span>•</span>
                              <span>{video.views} views</span>
                           </div>
                        </div>
                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100">
                           <i className="fa-solid fa-pen"></i>
                        </button>
                     </div>
                  ))}
               </div>

               <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-white font-bold mb-4">Processing Queue</h3>
                  <div className="bg-black/20 p-3 rounded-lg border border-gray-800">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Uploading: 4K_Footage_Raw.mp4</span>
                        <span className="text-cyan-400">78%</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-pulse" style={{width: '78%'}}></div>
                     </div>
                  </div>
               </div>
            </div>
        </div>
    </div>
  );
};

export default StudioPro;
