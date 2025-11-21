
import React from 'react';
import VideoCard from './VideoCard';
import { Video } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
  onUltraAuth?: () => void;
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onGuest, onUltraAuth, videos, onVideoSelect }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      
      {/* Navbar for Landing */}
      <nav className="w-full p-6 flex justify-between items-center z-50 absolute top-0 left-0 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <i className="fa-solid fa-play text-sm"></i>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            PlayNite
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-gray-300 hover:text-white font-medium transition-colors hidden sm:block"
          >
            Sign In
          </button>
          <button 
            onClick={onRegister}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Join Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
           <img 
             src="https://picsum.photos/seed/nightlife/1920/1080" 
             alt="Background" 
             className="w-full h-full object-cover opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite]" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/40"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
           <span className="bg-brand-500/20 border border-brand-500/50 text-brand-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              Premium Entertainment
           </span>
           <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             Unlock the Ultimate <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">Streaming Experience</span>
           </h1>
           <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             Access thousands of exclusive videos, live events, and premium collections. 
             Experience content like never before in 4K HDR.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <button 
                onClick={onRegister}
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2"
              >
                Start Your Free Trial <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button 
                onClick={onGuest}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Continue as Guest
              </button>
           </div>
           <p className="mt-4 text-xs text-gray-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
             Guests have limited access to 500 videos. Login for unlimited streaming.
           </p>
        </div>
      </div>

      {/* Features / Comparison */}
      <div className="bg-black py-20 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Experience</h2>
              <p className="text-gray-400">Upgrade anytime to unlock the full potential of PlayNite.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               
               {/* Guest Tier */}
               <div className="bg-dark-card border border-gray-800 rounded-3xl p-8 relative overflow-hidden hover:border-gray-600 transition-colors">
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-white mb-1">Guest</h3>
                     <p className="text-2xl font-bold text-white">Free</p>
                     <p className="text-xs text-gray-500 mt-1">Limited Access</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-gray-300 text-sm">
                        <i className="fa-solid fa-check text-gray-500"></i> Stream 500 Videos
                     </li>
                     <li className="flex items-center gap-3 text-gray-300 text-sm">
                        <i className="fa-solid fa-check text-gray-500"></i> SD Quality (720p)
                     </li>
                     <li className="flex items-center gap-3 text-gray-300 text-sm">
                        <i className="fa-solid fa-check text-gray-500"></i> Ad-Supported
                     </li>
                     <li className="flex items-center gap-3 text-gray-500 text-sm opacity-50">
                        <i className="fa-solid fa-xmark"></i> Download Content
                     </li>
                  </ul>
                  <button 
                    onClick={onGuest}
                    className="w-full py-3 rounded-xl border border-gray-600 text-white font-bold hover:bg-gray-800 transition-colors"
                  >
                    Browse as Guest
                  </button>
               </div>

               {/* Registered Tier */}
               <div className="bg-dark-card border border-brand-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-brand-900/20">
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                     <p className="text-2xl font-bold text-white">$9.99 <span className="text-sm font-normal text-gray-500">/ month</span></p>
                     <p className="text-xs text-gray-500 mt-1">Most Popular</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <i className="fa-solid fa-check text-brand-500"></i> Unlimited Streaming
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <i className="fa-solid fa-check text-brand-500"></i> HD Quality (1080p)
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <i className="fa-solid fa-check text-brand-500"></i> Create Playlists
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <i className="fa-solid fa-check text-brand-500"></i> VR Experience
                     </li>
                  </ul>
                  <button 
                    onClick={onRegister}
                    className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors shadow-lg shadow-brand-900/40"
                  >
                    Sign Up Free
                  </button>
               </div>

               {/* Blueberry Ultra Tier */}
               <div className="bg-[#050b1d] border-2 border-indigo-500 rounded-3xl p-8 relative overflow-hidden hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all transform md:-translate-y-4 group animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  {/* Ribbon */}
                  <div className="absolute top-6 -right-12 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-bold px-12 py-1 rotate-45 shadow-lg z-20">
                     BEST VALUE
                  </div>
                  
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                  <div className="absolute top-4 left-4 text-indigo-400 text-2xl">
                     <i className="fa-solid fa-atom animate-spin-slow"></i>
                  </div>

                  <div className="mb-6 relative z-10 mt-4">
                     <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-1">Blueberry</h3>
                     <p className="text-3xl font-bold text-white">$19.99 <span className="text-sm font-normal text-gray-500">/ month</span></p>
                     <p className="text-xs text-indigo-300 mt-1">Professional Grade</p>
                  </div>
                  <ul className="space-y-4 mb-8 relative z-10">
                     <li className="flex items-center gap-3 text-white text-sm">
                        <i className="fa-solid fa-check text-cyan-400"></i> 8K / 4K Upscaling
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm">
                        <i className="fa-solid fa-check text-cyan-400"></i> Spatial Audio
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm">
                        <i className="fa-solid fa-check text-cyan-400"></i> Creator Analytics
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm">
                        <i className="fa-solid fa-check text-cyan-400"></i> Priority Support
                     </li>
                     <li className="flex items-center gap-3 text-white text-sm">
                        <i className="fa-solid fa-check text-cyan-400"></i> Studio Pro Access
                     </li>
                  </ul>
                  
                  {/* Decorative Glow */}
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] pointer-events-none"></div>

                  <button 
                    onClick={() => { if(onUltraAuth) onUltraAuth(); else onLogin(); }} 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold hover:scale-105 transition-transform relative z-10 shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-bolt"></i> Get Blueberry
                  </button>
               </div>

            </div>
         </div>
      </div>

      {/* Featured Videos Section */}
      {videos.length > 0 && (
        <div className="bg-black py-20 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold mb-4">Explore Our Content</h2>
                 <p className="text-gray-400">Browse through thousands of videos and discover your favorites.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {videos.slice(0, 8).map(video => (
                    <VideoCard
                       key={video.id}
                       video={video}
                       onClick={onVideoSelect}
                       isFavorite={false}
                       isWatchLater={false}
                       onToggleFavorite={() => {}}
                       onToggleWatchLater={() => {}}
                       onShowToast={() => {}}
                       isLocked={false}
                       isUltra={false}
                    />
                 ))}
              </div>
              <div className="text-center mt-12">
                 <button
                    onClick={onGuest}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                 >
                    Browse All Videos <i className="fa-solid fa-arrow-right ml-2"></i>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="bg-neutral-900 py-8 text-center text-gray-500 text-sm">
         <p>&copy; 2025 PlayNite. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
