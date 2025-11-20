
import React, { useState } from 'react';
import { Model, Video } from '../types';
import VideoCard from './VideoCard';

interface ModelProfileProps {
  model: Model;
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  favoriteIds: Set<string>;
  watchLaterIds: Set<string>;
  onShowToast: (msg: string) => void;
}

const ModelProfile: React.FC<ModelProfileProps> = ({
  model,
  videos,
  onVideoSelect,
  onBack,
  onToggleFavorite,
  onToggleWatchLater,
  favoriteIds,
  watchLaterIds,
  onShowToast
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    onShowToast(isSubscribed ? `Unsubscribed from ${model.name}` : `Subscribed to ${model.name}`);
  };

  // Generate a deterministic cover image based on model ID for demo
  const coverImage = `https://picsum.photos/seed/${model.id}_cover/1600/400`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full bg-gray-900 overflow-hidden">
        <img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 md:left-8 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-brand-600 transition-colors flex items-center justify-center z-20"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-dark-bg bg-gray-800 shadow-2xl overflow-hidden group">
            <img 
              src={model.thumbnail} 
              alt={model.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{model.name}</h1>
               {model.rank <= 3 && <i className="fa-solid fa-certificate text-brand-500 text-xl" title="Top Model"></i>}
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-xl">
              Exclusive content creator. Fashion, lifestyle, and premium entertainment.
              Join my private club for daily updates.
            </p>
            <div className="flex gap-4 mt-3 text-sm text-gray-300 font-medium">
              <span><span className="text-white font-bold">{model.videoCount}</span> Videos</span>
              <span><span className="text-white font-bold">2.4M</span> Views</span>
              <span><span className="text-white font-bold">150K</span> Subscribers</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-4 w-full md:w-auto">
             <button 
               onClick={handleSubscribe}
               className={`flex-1 md:flex-none px-8 py-3 rounded-full font-bold transition-all shadow-lg transform hover:-translate-y-1 ${isSubscribed ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-900/40'}`}
             >
               {isSubscribed ? 'Subscribed' : 'Subscribe'}
             </button>
             <button className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors">
               <i className="fa-brands fa-instagram"></i>
             </button>
             <button className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors">
               <i className="fa-brands fa-twitter"></i>
             </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex gap-8 text-sm font-medium">
            <button className="border-b-2 border-brand-500 text-white px-1 py-3">Videos</button>
            <button className="border-b-2 border-transparent text-gray-500 hover:text-white px-1 py-3 transition-colors">Playlists</button>
            <button className="border-b-2 border-transparent text-gray-500 hover:text-white px-1 py-3 transition-colors">About</button>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Latest Uploads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(video => (
              <VideoCard 
                key={video.id}
                video={video}
                onClick={onVideoSelect}
                isFavorite={favoriteIds.has(video.id)}
                isWatchLater={watchLaterIds.has(video.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleWatchLater={onToggleWatchLater}
                onShowToast={onShowToast}
              />
            ))}
            
            {/* Add fake data if needed to fill grid */}
            {videos.length < 4 && videos.map((video, i) => (
               <VideoCard 
                key={`dup-${i}`}
                video={{...video, id: `dup-${video.id}-${i}`, title: `Archive: ${video.title}`}}
                onClick={onVideoSelect}
                isFavorite={false}
                isWatchLater={false}
                onToggleFavorite={onToggleFavorite}
                onToggleWatchLater={onToggleWatchLater}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelProfile;
