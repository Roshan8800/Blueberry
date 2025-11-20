import React, { useState, useEffect } from 'react';
import { Video, User } from '../types';
import { generateVideoDescription } from '../services/geminiService';
import { fetchVideos, fetchUsers, deleteDoc, doc, db, addDoc, collection } from '../services/firebase';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VIDEOS' | 'USERS'>('VIDEOS');
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Simplified user type
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newVideoData, setNewVideoData] = useState({ title: '', author: '', category: 'Trending' });

  useEffect(() => {
    const load = async () => {
        const vids = await fetchVideos();
        setVideos(vids);
        const usrs = await fetchUsers();
        setUsers(usrs);
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

  const handleSubmitNewVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    const newVideo = {
      title: newVideoData.title,
      author: newVideoData.author,
      category: newVideoData.category,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`,
      duration: '00:00',
      views: '0',
      embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
      description: 'Pending description...',
      rating: 0,
      tags: ['new', 'upload']
    };

    try {
        const ref = await addDoc(collection(db, "videos"), newVideo);
        setVideos([{ id: ref.id, ...newVideo } as Video, ...videos]);
        setShowModal(false);
        setNewVideoData({ title: '', author: '', category: 'Trending' });
    } catch (e) {
        console.error("Error adding video", e);
        alert("Failed to add video");
    }
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
            onClick={() => setActiveTab(activeTab === 'VIDEOS' ? 'USERS' : 'VIDEOS')}
            className={`flex-1 md:flex-none border px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'USERS' ? 'bg-white text-black border-white' : 'bg-dark-card border-gray-700 text-white hover:border-gray-500'}`}
          >
            <i className={`fa-solid ${activeTab === 'USERS' ? 'fa-video' : 'fa-users'} mr-2 ${activeTab === 'USERS' ? 'text-black' : 'text-gray-400'}`}></i>
            {activeTab === 'VIDEOS' ? 'Manage Users' : 'Manage Videos'}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]"
          >
            <i className="fa-solid fa-cloud-upload mr-2"></i>
            Upload Video
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Content Table Section */}
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
            <p className="text-sm">Upload a new video to get started</p>
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

      {/* Add Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-dark-surface border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Upload New Video</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <i className="fa-solid fa-times text-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitNewVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Title</label>
                <input 
                  required
                  value={newVideoData.title}
                  onChange={(e) => setNewVideoData({...newVideoData, title: e.target.value})}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Author/Studio</label>
                <input 
                  required
                  value={newVideoData.author}
                  onChange={(e) => setNewVideoData({...newVideoData, author: e.target.value})}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Studio Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Category</label>
                <select 
                  value={newVideoData.category}
                  onChange={(e) => setNewVideoData({...newVideoData, category: e.target.value})}
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none appearance-none"
                >
                  <option>Trending</option>
                  <option>Premium</option>
                  <option>VR Experience</option>
                  <option>Exclusive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-900/20 transition-all"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;