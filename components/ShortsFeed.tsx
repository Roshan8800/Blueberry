
import React, { useState, useRef, useEffect } from 'react';
import { EmptyView, ErrorView } from './StateViews';
import { fetchVideos, auth, db, doc, setDoc, collection, getDocs } from '../services/firebase';
import { Video } from '../types';

interface ShortsFeedProps {
  isUltra?: boolean;
  onBack: () => void;
}

const ShortsFeed: React.FC<ShortsFeedProps> = ({ isUltra = false, onBack }) => {
   // Need full screen container for intersection observer
   const [playingId, setPlayingId] = useState<string | null>(null);
   const [isMuted, setIsMuted] = useState(true);
   const [shorts, setShorts] = useState<Video[]>([]);
   const [likes, setLikes] = useState<Record<string, boolean>>({});
   const [error, setError] = useState<string | null>(null);
   const lastTap = useRef<number>(0);

  useEffect(() => {
    const loadShorts = async () => {
        setError(null);
        try {
            const result = await fetchVideos();
            if (result.success) {
                // Prefer vertical videos or short duration, for now just shuffle
                const videos = result.data || [];
                setShorts(videos.length > 0 ? videos.sort(() => 0.5 - Math.random()) : []);
            } else {
                setError(result.error || "Failed to load shorts");
                setShorts([]);
            }

            // Load likes if user is logged in
            if (auth.currentUser) {
                const likesRef = collection(db, "users", auth.currentUser.uid, "likes");
                const likesSnap = await getDocs(likesRef);
                const loadedLikes: Record<string, boolean> = {};
                likesSnap.forEach(doc => { loadedLikes[doc.id] = true; });
                setLikes(loadedLikes);
            }
        } catch (err) {
            setError("An unexpected error occurred while loading shorts");
            setShorts([]); // No fallback, show empty state
        }
    };
    loadShorts();
  }, []);

  const toggleLike = async (id: string) => {
     const isLiked = !likes[id];
     setLikes(prev => ({...prev, [id]: isLiked}));

     if (auth.currentUser) {
         const likeRef = doc(db, "users", auth.currentUser.uid, "likes", id);
         if (isLiked) {
             await setDoc(likeRef, { likedAt: new Date() });
         } else {
             // In a real app we might deleteDoc, but for now just toggle state
             await setDoc(likeRef, { likedAt: null }); // Soft delete or actual delete
         }
     }
  };

  const handleDoubleTap = (id: string) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
          if (!likes[id]) toggleLike(id);
      }
      lastTap.current = now;
  };

  // Use IntersectionObserver to detect which video is in view
  useEffect(() => {
    if (shorts.length === 0) return;

    // Note: root must be the scrollable container.
    // We select it by ID or ref.
    const container = document.getElementById('shorts-container');

    const options = {
      root: container,
      threshold: 0.5 // 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoId = entry.target.getAttribute('data-id');
          if (videoId && videoId !== playingId) {
             setPlayingId(videoId);
          }
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
         {error ? (
           <ErrorView
             message={error}
             onRetry={() => {
               setError(null);
               const loadShorts = async () => {
                 setError(null);
                 try {
                   const result = await fetchVideos();
                   if (result.success) {
                     const videos = result.data || [];
                     setShorts(videos.length > 0 ? videos.sort(() => 0.5 - Math.random()) : []);
                   } else {
                     setError(result.error || "Failed to load shorts");
                     setShorts([]);
                   }
                 } catch (err) {
                   setError("An unexpected error occurred while loading shorts");
                   setShorts([]);
                 }
               };
               loadShorts();
             }}
           />
         ) : (
           <EmptyView
             icon="fa-bolt"
             title="No Shorts Available"
             description="We're out of shorts for now! Check back later for more quick bites of entertainment."
             actionLabel="Go Home"
             onAction={onBack}
             isUltra={isUltra}
           />
         )}
      </div>
    );
  }

  return (
    <div 
      id="shorts-container"
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative"
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
         
         // Video Source Logic
         const isIframe = video.embedUrl.includes('<iframe') || video.embedUrl.includes('pornhub.com') || video.embedUrl.includes('youtube.com') || video.embedUrl.includes('vimeo.com');
         const hasValidSrc = video.embedUrl && !isIframe && video.embedUrl.startsWith('http');
         const videoSrc = hasValidSrc ? video.embedUrl : null;

         return (
           <div 
             key={video.id} 
             data-id={video.id}
             className="short-item h-full w-full snap-start relative flex items-center justify-center bg-gray-900 shrink-0"
             onClick={() => handleDoubleTap(video.id)}
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
                     isIframe ? (
                         <iframe
                           src={video.embedUrl}
                           className="w-full h-full animate-in fade-in"
                           frameBorder="0"
                           allowFullScreen
                           allow="autoplay; encrypted-media"
                         />
                     ) : hasValidSrc ? (
                         <video
                           src={videoSrc}
                           className="w-full h-full object-cover animate-in fade-in"
                           autoPlay
                           loop
                           muted={isMuted}
                           playsInline
                         />
                     ) : (
                         <img
                           src={video.thumbnail}
                           className="w-full h-full object-cover grayscale-[0.3]"
                           alt="Paused content"
                         />
                     )
                 ) : (
                     <img
                       src={video.thumbnail}
                       className="w-full h-full object-cover grayscale-[0.3]"
                       alt="Paused content"
                     />
                 )}
                 {!hasValidSrc && !isIframe && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm">Video unavailable</div>
                 )}
                 
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none"></div>
                 
                 {/* Play/Pause Overlay */}
                 {!isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <i className="fa-solid fa-play text-6xl text-white/80 drop-shadow-lg"></i>
                     </div>
                 )}

                 {/* Right Action Bar */}
                 <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
                    <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1 group">
                      <div className={`w-12 h-12 backdrop-blur rounded-full flex items-center justify-center transition-colors hover:scale-110 ${likes[video.id] ? (isUltra ? 'bg-indigo-600' : 'bg-brand-600') : 'bg-gray-800/50'}`}>
                          <i className={`fa-solid fa-heart text-xl ${likes[video.id] ? 'text-white' : 'text-white'}`}></i>
                      </div>
                      <span className="text-white text-xs font-bold">{likes[video.id] ? '24.6K' : '24.5K'}</span>
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
