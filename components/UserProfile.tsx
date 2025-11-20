
import React, { useState } from 'react';
import { User, AppView } from '../types';
import { MOCK_VIDEOS } from '../constants';

interface UserProfileProps {
  user: User;
  setView: (view: AppView) => void;
  onUpdateUser?: (updates: Partial<User>) => void; // Optional prop for updating user
}

const UserProfile: React.FC<UserProfileProps> = ({ user, setView, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.username);

  const handleSave = () => {
      if(onUpdateUser) {
          onUpdateUser({ username: editName });
      }
      setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header / Banner */}
      <div className="relative mb-24">
        <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-brand-950 to-slate-900 relative overflow-hidden border border-gray-800">
           {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="absolute top-4 right-4">
             <button 
                onClick={() => setView(AppView.SETTINGS)}
                className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm hover:bg-black/60 transition-colors border border-white/10 flex items-center gap-2"
             >
               <i className="fa-solid fa-gear"></i> Settings
             </button>
          </div>
        </div>
        
        <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-dark-bg bg-gray-800 overflow-hidden relative group shadow-2xl">
            <img src={user.avatar || "https://picsum.photos/seed/user/200/200"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <i className="fa-solid fa-camera text-white text-xl"></i>
            </div>
          </div>
          <div className="mb-4">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                       type="text"
                       value={editName}
                       onChange={(e) => setEditName(e.target.value)}
                       className="bg-black/30 border border-gray-600 rounded p-1 text-xl font-bold text-white outline-none focus:border-brand-500"
                    />
                    <button onClick={handleSave} className="bg-brand-600 px-3 py-1 rounded text-xs font-bold hover:bg-brand-500">Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-600">Cancel</button>
                </div>
            ) : (
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 group">
                {user.username}
                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white text-sm"><i className="fa-solid fa-pen"></i></button>
                <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">{user.plan === 'premium' ? 'Premium' : user.plan === 'blueberry' ? 'Ultra' : 'Free'}</span>
                </h1>
            )}
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <i className="fa-regular fa-calendar"></i> Member since Jan 2024
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pt-4">
        <div className="bg-dark-card p-5 rounded-xl border border-gray-800 text-center hover:border-gray-700 transition-colors">
           <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-500 flex items-center justify-center mx-auto mb-2">
             <i className="fa-solid fa-play"></i>
           </div>
           <p className="text-2xl font-bold text-white">1,245</p>
           <p className="text-gray-500 text-xs uppercase tracking-wider">Watched</p>
        </div>
        <div className="bg-dark-card p-5 rounded-xl border border-gray-800 text-center hover:border-gray-700 transition-colors">
           <div className="w-10 h-10 rounded-full bg-brand-900/30 text-brand-500 flex items-center justify-center mx-auto mb-2">
             <i className="fa-solid fa-heart"></i>
           </div>
           <p className="text-2xl font-bold text-white">84</p>
           <p className="text-gray-500 text-xs uppercase tracking-wider">Favorites</p>
        </div>
        <div className="bg-dark-card p-5 rounded-xl border border-gray-800 text-center hover:border-gray-700 transition-colors">
           <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-500 flex items-center justify-center mx-auto mb-2">
             <i className="fa-solid fa-comment"></i>
           </div>
           <p className="text-2xl font-bold text-white">32</p>
           <p className="text-gray-500 text-xs uppercase tracking-wider">Comments</p>
        </div>
        <div className="bg-dark-card p-5 rounded-xl border border-gray-800 text-center hover:border-gray-700 transition-colors">
           <div className="w-10 h-10 rounded-full bg-green-900/30 text-green-500 flex items-center justify-center mx-auto mb-2">
             <i className="fa-solid fa-wallet"></i>
           </div>
           <p className="text-xl font-bold text-white">Active</p>
           <p className="text-gray-500 text-xs uppercase tracking-wider">Subscription</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Watching */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-brand-500"></i> Continue Watching
              </h3>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
            </div>
            
            <div className="space-y-3">
              {MOCK_VIDEOS.slice(0, 3).map(video => (
                <div key={video.id} className="flex gap-4 bg-dark-card p-3 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer group">
                  <div className="w-32 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                    <div className="absolute bottom-0 left-0 h-1 bg-brand-600" style={{width: '65%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-play text-white"></i>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{video.author}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                       <i className="fa-solid fa-hourglass-half text-[10px]"></i> 12m remaining
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Playlists */}
           <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-list text-blue-500"></i> My Playlists
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <div className="bg-dark-card aspect-square rounded-xl border border-gray-800 flex flex-col items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors group">
                  <i className="fa-solid fa-plus text-3xl text-gray-600 group-hover:text-brand-500 transition-colors mb-2"></i>
                  <span className="text-sm font-medium text-gray-400 group-hover:text-white">New Playlist</span>
               </div>
               <div className="bg-dark-card aspect-square rounded-xl border border-gray-800 overflow-hidden relative group cursor-pointer">
                  <img src="https://picsum.photos/seed/dance/300/300" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Playlist" />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black to-transparent">
                     <span className="font-bold text-white">Late Night</span>
                     <span className="text-xs text-gray-400">12 Videos</span>
                  </div>
               </div>
            </div>
           </div>

        </div>

        {/* Right Col - Recommended / Offers */}
        <div className="space-y-6">
           <div className="bg-gradient-to-b from-brand-900/20 to-dark-card p-6 rounded-xl border border-brand-900/30">
              <h3 className="font-bold text-white mb-2">Upgrade your Plan</h3>
              <p className="text-sm text-gray-400 mb-4">Get 4K downloads and VR access.</p>
              <button className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors">
                View Plans
              </button>
           </div>

           <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="font-bold text-white mb-4">Activity</h3>
              <ul className="space-y-4 relative border-l-2 border-gray-800 ml-2">
                <li className="pl-6 relative">
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-800 border-2 border-dark-bg"></div>
                   <p className="text-sm text-gray-300">Liked <span className="text-white font-medium">Midnight Vibes</span></p>
                   <p className="text-xs text-gray-500">2 hours ago</p>
                </li>
                <li className="pl-6 relative">
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-800 border-2 border-dark-bg"></div>
                   <p className="text-sm text-gray-300">Commented on <span className="text-white font-medium">Eva's Vlog</span></p>
                   <p className="text-xs text-gray-500">5 hours ago</p>
                </li>
                <li className="pl-6 relative">
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-600 border-2 border-dark-bg"></div>
                   <p className="text-sm text-gray-300">Renewed Premium</p>
                   <p className="text-xs text-gray-500">Yesterday</p>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
