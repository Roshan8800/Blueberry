import React, { useState, useEffect } from 'react';
import { Video, User } from '../types';
import type { AdminAnalytics } from '../types';
import { generateVideoDescription } from '../services/geminiService';
import { fetchVideos, fetchUsers, deleteDoc, doc, db, addDoc, collection, fetchAdminAnalytics } from '../services/firebase';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VIDEOS' | 'USERS' | 'ANALYTICS'>('VIDEOS');
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Simplified user type
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  

  useEffect(() => {
    const load = async () => {
        const vidsResult = await fetchVideos();
        setVideos(vidsResult.success ? vidsResult.data || [] : []);
        const usrsResult = await fetchUsers();
        setUsers(usrsResult.success ? usrsResult.data || [] : []);
        const analyticsResult = await fetchAdminAnalytics();
        setAnalytics(analyticsResult.success ? analyticsResult.data || null : null);
    };
    load();
  }, []);

  // Bulk Action Handlers
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
     (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
     (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (activeTab === 'VIDEOS') setSelectedIds(new Set(filteredVideos.map(v => v.id)));
      // Users selection logic if needed
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} videos?`)) {
      // Delete from Firestore
      for (const id of selectedIds) {
          await deleteDoc(doc(db, "videos", id));
      }
      // Update Local State
      setVideos(videos.filter(v => !selectedIds.has(v.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this video?")) {
      await deleteDoc(doc(db, "videos", id));
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handleGenerateAiDesc = async (id: string) => {
    setIsAiLoading(true);
    const video = videos.find(v => v.id === id);
    if (video) {
      // Show visual feedback
      const btn = document.getElementById(`ai-btn-${id}`);
      if(btn) btn.innerText = "Thinking...";
      
      const newDesc = await generateVideoDescription(video.title, video.tags);
      
      setVideos(videos.map(v => v.id === id ? {...v, description: newDesc} : v));
    }
    setIsAiLoading(false);
  };


  return (
    <div className="max-w-full mx-auto p-4 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of content, users, and performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button
             onClick={() => setActiveTab(activeTab === 'VIDEOS' ? 'USERS' : activeTab === 'USERS' ? 'ANALYTICS' : 'VIDEOS')}
             className={`flex-1 md:flex-none border px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'ANALYTICS' ? 'bg-white text-black border-white' : 'bg-dark-card border-gray-700 text-white hover:border-gray-500'}`}
           >
             <i className={`fa-solid ${activeTab === 'ANALYTICS' ? 'fa-chart-line' : activeTab === 'USERS' ? 'fa-video' : 'fa-users'} mr-2 ${activeTab === 'ANALYTICS' ? 'text-black' : 'text-gray-400'}`}></i>
             {activeTab === 'VIDEOS' ? 'Manage Users' : activeTab === 'USERS' ? 'View Analytics' : 'Manage Videos'}
           </button>
         </div>
      </div>

      {/* Stats Cards */}
      {activeTab !== 'ANALYTICS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Library', val: videos.length, icon: 'fa-film', color: 'text-brand-500', bg: 'bg-brand-900/20' },
            { label: 'Total Views', val: '45.2M', icon: 'fa-eye', color: 'text-blue-400', bg: 'bg-blue-900/20' },
            { label: 'Premium Users', val: '12.5K', icon: 'fa-crown', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
            { label: 'Mo. Revenue', val: '$48,240', icon: 'fa-wallet', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-dark-card p-5 rounded-2xl border border-gray-800/60 relative overflow-hidden group hover:border-gray-700 transition-colors">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                       <i className={`fa-solid ${stat.icon} ${stat.color} text-lg`}></i>
                    </div>
                    <span className="text-xs font-semibold text-green-500 flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded">
                       +2.4% <i className="fa-solid fa-arrow-trend-up"></i>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{stat.val}</p>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
                {/* Decorative glow */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-2xl ${stat.bg}`}></div>
             </div>
          ))}
        </div>
      )}

      {/* Analytics Dashboard */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-8">
          {/* Platform Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', val: analytics.totalUsers.toLocaleString(), icon: 'fa-users', color: 'text-blue-400', bg: 'bg-blue-900/20' },
              { label: 'Active Users', val: analytics.activeUsers.toLocaleString(), icon: 'fa-user-check', color: 'text-green-400', bg: 'bg-green-900/20' },
              { label: 'Total Videos', val: analytics.totalVideos.toLocaleString(), icon: 'fa-film', color: 'text-purple-400', bg: 'bg-purple-900/20' },
              { label: 'Total Views', val: analytics.totalViews.toLocaleString(), icon: 'fa-eye', color: 'text-orange-400', bg: 'bg-orange-900/20' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-card p-5 rounded-2xl border border-gray-800/60 relative overflow-hidden group hover:border-gray-700 transition-colors">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                         <i className={`fa-solid ${stat.icon} ${stat.color} text-lg`}></i>
                      </div>
                      <span className="text-xs font-semibold text-green-500 flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded">
                         +5.2% <i className="fa-solid fa-arrow-trend-up"></i>
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{stat.val}</p>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                  <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-2xl ${stat.bg}`}></div>
               </div>
            ))}
          </div>

          {/* Revenue and Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Revenue Overview</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400 mb-2">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-gray-400">Total Platform Revenue</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-medium">${Math.floor(analytics.totalRevenue * 0.1).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Month</span>
                  <span className="text-white font-medium">${Math.floor(analytics.totalRevenue * 0.09).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400 font-medium">{analytics.platformHealth.uptime}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-red-400 font-medium">{analytics.platformHealth.errorRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Load Time</span>
                  <span className="text-blue-400 font-medium">{analytics.platformHealth.avgLoadTime}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Top Categories by Views</h3>
            <div className="space-y-3">
              {analytics.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                    <span className="text-white">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${(category.views / analytics.topCategories[0].views) * 100}%` }}></div>
                    </div>
                    <span className="text-gray-400 text-sm w-16 text-right">{category.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Table Section */}
      {activeTab !== 'ANALYTICS' && (
        <div className="bg-dark-card rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-dark-surface/50">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-white text-lg">{activeTab === 'VIDEOS' ? 'Video Library' : 'User Directory'}</h2>
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
               {activeTab === 'VIDEOS' ? videos.length : users.length} records
            </span>
          </div>
          
          {/* Search within table */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filenames..." 
              className="w-full bg-black/20 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
            <i className="fa-solid fa-search absolute left-3 top-2.5 text-gray-500 text-xs"></i>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-brand-900/30 border-b border-brand-500/30 p-3 px-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-sm text-brand-100">
              <i className="fa-solid fa-check-circle"></i>
              <span className="font-semibold">{selectedIds.size} Selected</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-300 hover:text-white font-medium underline"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-lg"
              >
                <i className="fa-solid fa-trash"></i> Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {activeTab === 'VIDEOS' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.size === filteredVideos.length && filteredVideos.length > 0}
                        className="rounded border-gray-700 bg-gray-800 text-brand-600 focus:ring-0 focus:ring-offset-0"
                      />
                    </th>
                    <th className="p-4 font-medium">Video Content</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Performance</th>
                    <th className="p-4 font-medium">AI Optimization</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-800/50">
                  {filteredVideos.map(video => (
                    <tr key={video.id} className={`group transition-colors ${selectedIds.has(video.id) ? 'bg-brand-900/10' : 'hover:bg-white/5'}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(video.id)}
                          onChange={() => handleSelectOne(video.id)}
                          className="rounded border-gray-700 bg-gray-800 text-brand-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 group-hover:border-gray-500 transition-colors">
                            <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/20"></div>
                          </div>
                          <div className="flex flex-col">
                            <p className="font-semibold text-white truncate max-w-[180px]">{video.title}</p>
                            <p className="text-xs text-gray-500 font-mono">{video.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">
                          {video.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-gray-300 gap-1">
                            <i className="fa-solid fa-eye text-gray-500"></i> {video.views}
                          </div>
                          <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${video.rating}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          id={`ai-btn-${video.id}`}
                          onClick={() => handleGenerateAiDesc(video.id)}
                          disabled={isAiLoading}
                          className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:border-purple-500/60 hover:text-white transition-all"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          <span>Generate Desc</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-900/30 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-800/50">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{user.username?.[0] || 'U'}</div>
                            <div>
                               <p className="font-bold text-white">{user.username || 'Unknown'}</p>
                               <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.plan === 'blueberry' ? 'bg-indigo-900 text-indigo-200' : 'bg-gray-800 text-gray-300'}`}>
                             {user.plan || 'free'}
                         </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">{user.role || 'USER'}</td>
                      <td className="p-4 text-right">
                         <button className="text-gray-400 hover:text-white"><i className="fa-solid fa-ellipsis"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>
        
        {filteredVideos.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center text-gray-500">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
               <i className="fa-solid fa-film text-2xl opacity-50"></i>
            </div>
            <p className="text-lg font-medium">No videos found</p>
            <p className="text-sm">No videos available at the moment</p>
          </div>
        )}
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
           <span>Showing {filteredVideos.length} entries</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50">Prev</button>
             <button className="px-3 py-1 rounded bg-brand-600 text-white">1</button>
             <button className="px-3 py-1 rounded hover:bg-gray-800">2</button>
             <button className="px-3 py-1 rounded hover:bg-gray-800">Next</button>
           </div>
        </div>
      </div>
      )}

    </div>
  );
};

export default AdminPanel;