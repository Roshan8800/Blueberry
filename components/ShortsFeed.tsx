
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_VIDEOS } from '../constants';
import { EmptyView } from './StateViews';

interface ShortsFeedProps {
  isUltra?: boolean;
  onBack: () => void;
}

const ShortsFeed: React.FC<ShortsFeedProps> = ({ isUltra = false, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Using MOCK_VIDEOS to simulate shorts
  const shorts = MOCK_VIDEOS.map((v, i) => ({...v, id: `short-${i}`}));
  // Uncomment to test empty
  // const shorts: any[] = [];

  // Use IntersectionObserver to detect which video is in view
  useEffect(() => {
    if (shorts.length === 0) return;

    const options = {
      root: containerRef.current,
      threshold: 0.6 // 60% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoId = entry.target.getAttribute('data-id');
          if (videoId) setPlayingId(videoId);
        }
      });
    }, options);

    const elements = document.querySelectorAll('.short-item');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [shorts.length]);

  if (shorts.length === 0) {
    return (
      <div className="h-screen w-full bg-black relative flex items-center justify-center">
         <button 
           onClick={onBack} 
           className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-colors flex items-center justify-center"
         >
            <i className="fa-solid fa-arrow-left"></i>
         </button>
         <EmptyView 
           icon="fa-bolt"
           title="No Shorts Available"
           description="We're out of shorts for now! Check back later for more quick bites of entertainment."
           actionLabel="Go Home"
           onAction={onBack}
           isUltra={isUltra}
         />
      </div>
    );
  }

  return (
    <div 
      className="h-[calc(100vh-4rem)] w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative"
      ref={containerRef}
    >
       {/* Back Button Overlay */}
       <button 
         onClick={onBack} 
         className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-colors flex items-center justify-center"
       >
          <i className="fa-solid fa-arrow-left"></i>
       </button>

       {shorts.map((video) => {
         const isPlaying = playingId === video.id;
         // Defensive safe string for author
         const safeAuthor = String(video.author || 'Unknown');
         
         return (
           <div 
             key={video.id} 
             data-id={video.id}
             className="short-item h-full w-full snap-start relative flex items-center justify-center bg-gray-900 shrink-0"
           >
              {/* Blurred Background */}
              <img 
                src={video.thumbnail} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl"
              />
              
              {/* Short Container */}
              <div className={`relative h-full aspect-[9/16] bg-black max-w-md w-full overflow-hidden shadow-2xl border-x border-gray-800 flex flex-col justify-center`}>
                 {isPlaying ? (
                     // Simulating a playing video with an image for now, but in a real app this would be <video>
                     // We use a slight zoom effect to simulate "alive" state
                     <img 
                       src={video.thumbnail} 
                       className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-[10s]" 
                       alt="Playing content"
                     />
                 ) : (
                     <img 
                       src={video.thumbnail} 
                       className="w-full h-full object-cover grayscale-[0.3]" 
                       alt="Paused content"
                     />
                 )}
                 
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                 
                 {/* Play/Pause Overlay */}
                 {!isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <i className="fa-solid fa-play text-6xl text-white/80 drop-shadow-lg"></i>
                     </div>
                 )}

                 {/* Right Action Bar */}
                 <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
                    <button className="flex flex-col items-center gap-1 group">
                      <div className={`w-12 h-12 bg-gray-800/50 backdrop-blur rounded-full flex items-center justify-center ${isUltra ? 'group-hover:bg-indigo-600' : 'group-hover:bg-brand-600'} transition-colors hover:scale-110`}>
                          <i className="fa-solid fa-heart text-white text-xl"></i>
                      </div>
                      <span className="text-white text-xs font-bold">24.5K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className={`w-12 h-12 bg-gray-800/50 backdrop-blur rounded-full flex items-center justify-center ${isUltra ? 'group-hover:bg-indigo-600' : 'group-hover:bg-brand-600'} transition-colors hover:scale-110`}>
                          <i className="fa-solid fa-comment-dots text-white text-xl"></i>
                      </div>
                      <span className="text-white text-xs font-bold">1.2K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className={`w-12 h-12 bg-gray-800/50 backdrop-blur rounded-full flex items-center justify-center ${isUltra ? 'group-hover:bg-indigo-600' : 'group-hover:bg-brand-600'} transition-colors hover:scale-110`}>
                          <i className="fa-solid fa-share text-white text-xl"></i>
                      </div>
                      <span className="text-white text-xs font-bold">Share</span>
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 bg-gray-800/50 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                          <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-white text-xl`}></i>
                      </div>
                    </button>
                 </div>

                 {/* Bottom Info */}
                 <div className="absolute left-4 bottom-6 right-20 text-white z-20">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                           <img src={`https://picsum.photos/seed/${safeAuthor}/50/50`} className="w-full h-full object-cover" />
                       </div>
                       <div>
                           <p className="font-bold text-sm drop-shadow-md shadow-black">@{safeAuthor.replace(/\s/g, '').toLowerCase()}</p>
                           <button className={`text-[10px] ${isUltra ? 'bg-indigo-600' : 'bg-brand-600'} px-3 py-1 rounded-full font-bold mt-0.5 hover:brightness-110`}>Subscribe</button>
                       </div>
                    </div>
                    <p className="text-sm line-clamp-2 mb-2 drop-shadow-md font-medium">{video.description} #shorts #viral #trending</p>
                    <div className="flex items-center gap-2 text-xs opacity-90 bg-black/40 px-3 py-1 rounded-full w-fit backdrop-blur-sm">
                       <i className="fa-solid fa-music"></i>
                       <span className="animate-pulse">Original Sound - {safeAuthor}</span>
                    </div>
                 </div>
              </div>
           </div>
         );
       })}
    </div>
  );
};

export default ShortsFeed;
