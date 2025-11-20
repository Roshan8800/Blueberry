
import React, { useState, useEffect } from 'react';
import { MOCK_VIDEOS } from '../constants';
import { EmptyView } from './StateViews';
import { fetchVideos } from '../services/firebase';
import { Video } from '../types';

interface LivePageProps {
  onBack: () => void;
}

const LivePage: React.FC<LivePageProps> = ({ onBack }) => {
  const [liveChannels, setLiveChannels] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadLive = async () => {
          const vids = await fetchVideos();
          const live = vids.filter(v => v.category === 'Live Cams' || v.duration === 'LIVE');

          if (live.length > 0) {
              setLiveChannels(live);
          } else {
               // Fallback / Mock if no live found
               setLiveChannels(MOCK_VIDEOS.slice(0, 4).map(v => ({...v, id: `live-${v.id}`, duration: 'LIVE'})));
          }
          setLoading(false);
      };
      loadLive();
  }, []);

  return (
    <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
       <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
             <i className="fa-solid fa-arrow-left text-white"></i>
          </button>
          <h1 className="text-2xl font-bold text-white">Live Channels</h1>
       </div>

       {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
             <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
       ) : liveChannels.length > 0 ? (
         <>
           <div className="relative rounded-2xl overflow-hidden aspect-[4/1] mb-8 border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
               <img src="https://picsum.photos/seed/crowd/1600/400" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex items-center p-10">
                   <div>
                       <div className="flex items-center gap-2 mb-2">
                           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                           <span className="text-red-500 font-bold tracking-wider text-sm uppercase">Live Now</span>
                       </div>
                       <h1 className="text-4xl font-bold text-white mb-4">Live Exclusive Events</h1>
                       <p className="text-gray-300 max-w-lg mb-6">Join thousands of users in real-time interactive shows. Chat, tip, and interact with your favorite stars.</p>
                       <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50">
                           Browse Channels
                       </button>
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveChannels.map(channel => (
                 <div key={channel.id} className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 group cursor-pointer hover:border-red-900/50 transition-all">
                     <div className="aspect-video relative">
                         <img src={channel.thumbnail} className="w-full h-full object-cover" />
                         <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                             LIVE
                         </div>
                         <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                             <i className="fa-solid fa-user"></i> {Math.floor(Math.random() * 5000 + 500)}
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <i className="fa-regular fa-circle-play text-4xl text-white drop-shadow-lg"></i>
                         </div>
                     </div>
                     <div className="p-3 flex gap-3">
                         <img src={`https://picsum.photos/seed/${channel.author}/50/50`} className="w-10 h-10 rounded-full border border-gray-700" />
                         <div>
                             <h3 className="text-white font-bold text-sm line-clamp-1">{channel.title}</h3>
                             <p className="text-gray-400 text-xs">{channel.author}</p>
                             <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 rounded border border-gray-700">Chat</span>
                                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 rounded border border-gray-700">HD</span>
                             </div>
                         </div>
                     </div>
                 </div>
              ))}
           </div>
         </>
       ) : (
         <EmptyView 
            icon="fa-video-slash"
            title="No Live Streams"
            description="There are no live broadcasts at the moment. Check back later for scheduled events."
            actionLabel="View Schedule"
            onAction={() => {}}
         />
       )}
    </div>
  );
};

export default LivePage;
