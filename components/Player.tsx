
import React, { useState, useEffect, useRef } from 'react';
import { Video, User, AppView } from '../types';
import { MOCK_VIDEOS } from '../constants';
import VideoCard from './VideoCard';

interface PlayerProps {
  video: Video;
  currentUser: User;
  onVideoSelect: (v: Video) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isWatchLater: (id: string) => boolean;
  onToggleWatchLater: (id: string) => void;
  onShowToast: (msg: string) => void;
  setView?: (view: AppView) => void;
  isUltra?: boolean;
}

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

const Player: React.FC<PlayerProps> = ({ 
  video, 
  currentUser,
  onVideoSelect,
  isFavorite,
  onToggleFavorite,
  isWatchLater,
  onToggleWatchLater,
  onShowToast,
  setView,
  isUltra = false
}) => {
  const suggested = MOCK_VIDEOS.filter(v => v.id !== video.id);
  
  // Video Element Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  
  // --- UI State ---
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false); // Screen Lock
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [seekAnim, setSeekAnim] = useState<{ type: 'forward' | 'backward', id: number } | null>(null);
  
  // --- Ultra Features State ---
  const [isAiUpscale, setIsAiUpscale] = useState(false);
  const [isSpatialAudio, setIsSpatialAudio] = useState(false);
  
  // --- Gesture States ---
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const [gestureFeedback, setGestureFeedback] = useState<{type: 'volume' | 'brightness', value: number} | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // --- Interactions State ---
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Safely calculate likes based on views, handling both string ("1.2M") and number (1200) formats
  const getRawViewCount = (val: string | number) => {
    if (typeof val === 'number') return val;
    const str = String(val).toUpperCase();
    if (str.includes('M')) {
      return parseFloat(str.replace(/,/g, '').replace('M', '')) * 1000000;
    }
    if (str.includes('K')) {
      return parseFloat(str.replace(/,/g, '').replace('K', '')) * 1000;
    }
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  const initialViews = getRawViewCount(video.views);
  const [likesCount, setLikesCount] = useState(initialViews * (video.rating / 100) * 0.1);
  
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "JohnDoe", avatar: "https://picsum.photos/seed/u1/100/100", text: "Great content! The production quality is amazing.", time: "2 hours ago", likes: 12 },
    { id: 2, user: "SarahSmith", avatar: "https://picsum.photos/seed/u2/100/100", text: "Ultra mode looks insane on my OLED.", time: "5 hours ago", likes: 5 },
    { id: 3, user: "MikeX", avatar: "https://picsum.photos/seed/u3/100/100", text: "Waiting for the next episode!", time: "1 day ago", likes: 42 }
  ]);

  // Sample Video for Demo (Big Buck Bunny for feature demonstration)
  // Using a reliable CDN source instead of Youtube iframe to enable advanced custom controls
  const DEMO_VIDEO_SRC = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const DEMO_POSTER = video.thumbnail;

  // Reset state on video change
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setIsLocked(false);
    setZoomLevel(1);
    setIsAiUpscale(false);
    setIsSpatialAudio(false);
    setLikesCount(getRawViewCount(video.views) * (video.rating / 100) * 0.1);
    
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [video.id, video.views, video.rating]);

  // Hide controls timer
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isPlaying && !isLocked) {
       timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls, isLocked]);

  const handleUserActivity = () => {
    if (!isLocked) setShowControls(true);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (isLocked) return;

      handleUserActivity();
      
      switch(e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          seekRelative(10);
          break;
        case 'ArrowLeft':
          seekRelative(-10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyT':
          setIsTheaterMode(prev => !prev);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyL':
          seekRelative(10);
          break;
        case 'KeyJ':
          seekRelative(-10);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isLocked]);

  // --- Video Event Handlers ---
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekRelative = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setSeekAnim({ type: seconds > 0 ? 'forward' : 'backward', id: Date.now() });
      setTimeout(() => setSeekAnim(null), 800);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const changeVolume = (newVol: number) => {
    if (videoRef.current) {
       videoRef.current.volume = newVol;
       setVolume(newVol);
       if (newVol === 0) setIsMuted(true);
       else setIsMuted(false);
       
       setGestureFeedback({type: 'volume', value: newVol * 100});
       setTimeout(() => setGestureFeedback(null), 1000);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      videoRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
      if (newMuteState) setVolume(0);
      else setVolume(0.8);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
       try {
         if (document.pictureInPictureElement) {
           await document.exitPictureInPicture();
         } else {
           await videoRef.current.requestPictureInPicture();
         }
       } catch (error) {
         onShowToast("PiP not supported or failed");
       }
    }
  };

  // --- Advanced Features ---

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      onShowToast(`Speed set to ${speed}x`);
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current) {
       const canvas = document.createElement('canvas');
       canvas.width = videoRef.current.videoWidth;
       canvas.height = videoRef.current.videoHeight;
       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
         // In a real app, download this or show it. For now, toast.
         const dataUrl = canvas.toDataURL('image/png');
         onShowToast("Screenshot captured!");
         // You could trigger a download here
         const link = document.createElement('a');
         link.download = `screenshot-${Date.now()}.png`;
         link.href = dataUrl;
         link.click();
       }
    }
  };

  const toggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    setShowControls(!newState);
    onShowToast(newState ? "Screen Locked" : "Screen Unlocked");
  };

  // --- Gestures ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked) {
      // Show lock icon feedback if locked
      return; 
    }
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    
    // Double Tap Logic could be implemented here with a timer
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isLocked) return;
    
    if (e.touches.length > 1) {
      // Pinch Zoom simulation
      const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      // Simple zoom toggle for demo
      if (dist > 100) setZoomLevel(Math.min(2, zoomLevel + 0.05));
      else setZoomLevel(Math.max(1, zoomLevel - 0.05));
      return;
    }

    const startY = touchStartRef.current.y;
    const currentY = e.touches[0].clientY;
    const diffY = startY - currentY;
    const screenWidth = window.innerWidth;
    const touchX = e.touches[0].clientX;

    if (Math.abs(diffY) > 10) {
        const delta = diffY > 0 ? 1 : -1;
        
        // Left side = Brightness, Right side = Volume
        if (touchX < screenWidth / 2) {
            const newBright = Math.min(150, Math.max(50, brightness + delta));
            setBrightness(newBright);
            setGestureFeedback({ type: 'brightness', value: ((newBright - 50) / 100) * 100 });
        } 
        else {
            const newVol = Math.min(1, Math.max(0, volume + (delta * 0.02)));
            changeVolume(newVol);
        }
        touchStartRef.current.y = currentY;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTimeout(() => setGestureFeedback(null), 1500);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Render ---

  const brandColor = isUltra ? 'indigo' : 'brand';
  const highlightColor = isUltra ? 'text-cyan-400' : 'text-brand-500';
  const sliderColor = isUltra ? 'accent-cyan-400' : 'accent-brand-500';

  return (
    <div className={`w-full mx-auto p-0 lg:p-4 ${isTheaterMode ? 'max-w-full' : 'max-w-7xl'}`}>
      <div className={`grid gap-6 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        
        {/* MAIN PLAYER COLUMN */}
        <div className={`${isTheaterMode ? '' : 'lg:col-span-2'} space-y-4`}>
          
          {/* Video Container */}
          <div 
            ref={playerContainerRef}
            className={`relative bg-black rounded-none lg:rounded-2xl overflow-hidden shadow-2xl group select-none ${isUltra ? 'shadow-indigo-900/30' : 'shadow-brand-900/20'} ${isTheaterMode || isFullscreen ? 'aspect-video h-[80vh] lg:h-auto' : 'aspect-video'}`}
            onMouseMove={handleUserActivity}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <video 
              ref={videoRef}
              src={DEMO_VIDEO_SRC}
              poster={DEMO_POSTER}
              className={`w-full h-full object-contain bg-black transition-transform duration-200`}
              style={{ 
                transform: `scale(${zoomLevel})`,
                filter: `brightness(${brightness}%) ${isAiUpscale ? 'contrast(1.1) saturate(1.2) drop-shadow(0 0 1px rgba(255,255,255,0.5))' : ''}` 
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={!isLocked ? togglePlay : undefined}
              loop={isLooping}
              playsInline
            />

            {/* --- OVERLAYS --- */}

            {/* Gesture Feedback */}
            {gestureFeedback && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-white animate-in fade-in zoom-in duration-200">
                        <i className={`fa-solid ${gestureFeedback.type === 'volume' ? (gestureFeedback.value === 0 ? 'fa-volume-xmark' : 'fa-volume-high') : 'fa-sun'} text-4xl mb-3`}></i>
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${isUltra ? 'bg-cyan-400' : 'bg-brand-500'}`} style={{ width: `${gestureFeedback.value}%` }}></div>
                        </div>
                        <span className="mt-2 font-bold">{Math.round(gestureFeedback.value)}%</span>
                    </div>
                </div>
            )}

            {/* Seek Animation */}
            {seekAnim && (
              <div className={`absolute top-1/2 ${seekAnim.type === 'forward' ? 'right-1/4' : 'left-1/4'} transform -translate-y-1/2 bg-black/40 rounded-full p-6 backdrop-blur-sm animate-ping`}>
                <i className={`fa-solid ${seekAnim.type === 'forward' ? 'fa-forward' : 'fa-backward'} text-white text-3xl`}></i>
              </div>
            )}

            {/* Lock Indicator (When Locked) */}
            {isLocked && (
               <div className="absolute top-6 left-6 z-50">
                  <button onClick={toggleLock} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/20">
                     <i className="fa-solid fa-lock text-xl"></i>
                  </button>
               </div>
            )}

            {/* --- CONTROLS --- */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-30 transition-opacity duration-300 flex flex-col justify-between p-4 ${showControls && !isLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
               {/* Top Bar */}
               <div className="flex justify-between items-start">
                  <h2 className="text-white font-bold text-lg drop-shadow-md truncate max-w-[70%]">{video.title}</h2>
                  <div className="flex gap-4">
                     {/* Ultra Features Toggles */}
                     {isUltra && (
                       <div className="flex gap-2">
                          <button 
                            onClick={() => {setIsAiUpscale(!isAiUpscale); onShowToast(isAiUpscale ? "AI Off" : "AI Enhanced")}}
                            className={`px-2 py-1 rounded text-xs font-bold border ${isAiUpscale ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-black/40 border-white/30 text-white'}`}
                          >
                             AI
                          </button>
                          <button 
                            onClick={() => {setIsSpatialAudio(!isSpatialAudio); onShowToast(isSpatialAudio ? "Stereo" : "Spatial Audio")}}
                            className={`px-2 py-1 rounded text-xs font-bold border ${isSpatialAudio ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-black/40 border-white/30 text-white'}`}
                          >
                             360°
                          </button>
                       </div>
                     )}
                     <button onClick={() => onShowToast("Casting to Living Room TV")} className="text-white hover:text-brand-400 transition-colors">
                       <i className="fa-brands fa-chromecast text-xl"></i>
                     </button>
                     <button onClick={toggleLock} className="text-white hover:text-brand-400 transition-colors">
                        <i className="fa-solid fa-lock-open text-lg"></i>
                     </button>
                  </div>
               </div>

               {/* Center Play Button (Big) */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                   {!isPlaying && (
                     <button onClick={togglePlay} className="w-16 h-16 bg-brand-600/80 hover:bg-brand-600 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm transition-transform hover:scale-110">
                        <i className="fa-solid fa-play text-2xl ml-1"></i>
                     </button>
                   )}
               </div>

               {/* Bottom Bar */}
               <div className="space-y-2">
                  {/* Progress Bar */}
                  <div className="relative group/scrubber h-4 flex items-center cursor-pointer">
                     {/* Hover Time (Would implement with proper mouse tracking in real app) */}
                     <input 
                       type="range" 
                       min={0} 
                       max={duration} 
                       value={currentTime} 
                       onChange={handleSeek}
                       className={`absolute w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer z-20 ${sliderColor}`}
                       style={{
                         backgroundSize: `${(currentTime/duration)*100}% 100%`,
                         backgroundImage: `linear-gradient(${isUltra ? '#22d3ee' : '#f43f5e'}, ${isUltra ? '#22d3ee' : '#f43f5e'})`
                       }}
                     />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-brand-400 w-6">
                           <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
                        </button>
                        
                        <button onClick={() => seekRelative(10)} className="text-gray-300 hover:text-white hidden sm:block">
                           <i className="fa-solid fa-rotate-right"></i>
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                           <button onClick={toggleMute} className="text-white hover:text-brand-400 w-6">
                              <i className={`fa-solid ${isMuted || volume === 0 ? 'fa-volume-xmark' : (volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high')} text-lg`}></i>
                           </button>
                           <input 
                             type="range" 
                             min="0" 
                             max="1" 
                             step="0.1" 
                             value={volume} 
                             onChange={(e) => changeVolume(parseFloat(e.target.value))}
                             className="w-0 group-hover/volume:w-24 transition-all duration-200 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer"
                           />
                        </div>

                        <span className="text-xs text-gray-300 font-mono">
                           {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                     </div>

                     <div className="flex items-center gap-4 text-white">
                        <button onClick={takeScreenshot} className="hover:text-brand-400 hidden md:block" title="Screenshot">
                           <i className="fa-solid fa-camera"></i>
                        </button>
                        
                        <button onClick={() => setIsLooping(!isLooping)} className={`${isLooping ? highlightColor : 'hover:text-brand-400'}`} title="Loop">
                           <i className="fa-solid fa-repeat"></i>
                        </button>

                        <button onClick={() => setCaptionsEnabled(!captionsEnabled)} className={`${captionsEnabled ? highlightColor : 'hover:text-brand-400'}`} title="Captions">
                           <i className="fa-regular fa-closed-captioning text-lg"></i>
                        </button>

                        <div className="relative">
                           <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="hover:text-brand-400 font-bold text-xs w-8">
                              {playbackSpeed}x
                           </button>
                           {showSpeedMenu && (
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 rounded-lg p-2 space-y-1 mb-2 min-w-[60px] text-center">
                                 {[0.5, 1, 1.5, 2].map(s => (
                                   <div key={s} onClick={() => handleSpeedChange(s)} className="cursor-pointer hover:bg-gray-700 rounded px-2 py-1 text-xs">{s}x</div>
                                 ))}
                              </div>
                           )}
                        </div>

                        <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="hover:text-brand-400" title="Quality">
                           <i className="fa-solid fa-gear"></i>
                        </button>
                        
                        <button onClick={togglePiP} className="hover:text-brand-400 hidden sm:block" title="PiP">
                           <i className="fa-solid fa-clone"></i>
                        </button>
                        
                        <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="hover:text-brand-400 hidden md:block" title="Theater">
                           <i className={`fa-solid ${isTheaterMode ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
                        
                        <button onClick={toggleFullscreen} className="hover:text-brand-400">
                           <i className={`fa-solid ${isFullscreen ? 'fa-compress-arrows-alt' : 'fa-expand'}`}></i>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Video Info & Interactions */}
          <div className={`bg-dark-card p-4 rounded-xl border ${isUltra ? 'border-indigo-900/30' : 'border-gray-800'}`}>
            <div className="flex items-start justify-between">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{video.title}</h1>
                {isUltra && isAiUpscale && <span className="text-[10px] bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded font-mono">AI UPSCALED</span>}
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isUltra ? 'from-indigo-500 to-cyan-500' : 'from-brand-500 to-purple-600'} flex items-center justify-center text-white font-bold overflow-hidden`}>
                   <img src={`https://picsum.photos/seed/${video.author}/100/100`} className="w-full h-full object-cover" alt={video.author} />
                </div>
                <div>
                   <p className="text-sm font-semibold text-white">{video.author}</p>
                   <p className="text-xs text-gray-400">Verified Creator</p>
                </div>
                <button 
                  onClick={() => { setIsSubscribed(!isSubscribed); onShowToast(isSubscribed ? "Unsubscribed" : "Subscribed"); }}
                  className={`ml-2 text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                    isSubscribed 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : `${isUltra ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/30' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-900/30'} text-white shadow-lg`
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Interaction Buttons */}
              <div className="flex items-center gap-2 md:gap-4 bg-black/20 p-1.5 rounded-full overflow-x-auto no-scrollbar">
                <div className="flex items-center bg-gray-800/50 rounded-full px-1">
                  <button 
                    onClick={() => { setIsLiked(!isLiked); if(!isLiked) setLikesCount(l => l+1); else setLikesCount(l => l-1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isLiked ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                     <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`}></i>
                     <span className="text-sm font-medium">{Math.floor(likesCount).toLocaleString()}</span>
                  </button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button 
                    onClick={() => setIsDisliked(!isDisliked)}
                    className={`px-3 py-1.5 rounded-full transition-colors ${isDisliked ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                     <i className={`${isDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`}></i>
                  </button>
                </div>

                <button 
                  onClick={() => { navigator.clipboard.writeText(window.location.href); onShowToast("Link Copied!"); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                   <i className="fa-solid fa-share"></i>
                   <span className="text-sm hidden sm:inline">Share</span>
                </button>
                
                <button 
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isFavorite ? `${isUltra ? 'text-cyan-400 bg-cyan-900/20' : 'text-brand-500 bg-brand-900/20'}` : `text-gray-400 ${isUltra ? 'hover:text-cyan-400' : 'hover:text-brand-500'} hover:bg-gray-800`}`}
                >
                   <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                   <span className="text-sm hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <div className="bg-dark-bg/50 p-4 rounded-xl">
               <p className="text-sm text-gray-300 leading-relaxed">
                 {video.description}
               </p>
               <div className="mt-3 flex flex-wrap gap-2">
                 {video.tags.map(tag => (
                   <span key={tag} className={`text-xs bg-gray-800 border border-gray-700 ${isUltra ? 'text-cyan-400' : 'text-brand-400'} px-2 py-1 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors`}>
                     #{tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>
          
          {/* Comments Section (Simplified for length) */}
          <div className={`bg-dark-card p-4 rounded-xl border ${isUltra ? 'border-indigo-900/30' : 'border-gray-800'}`}>
             <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
               Comments <span className="text-gray-500 text-sm font-normal">({comments.length})</span>
             </h3>
             {/* Input */}
             <form onSubmit={(e) => { e.preventDefault(); if(!commentText) return; setComments([{id: Date.now(), user: currentUser.username, avatar: currentUser.avatar || "", text: commentText, time: "Just now", likes: 0}, ...comments]); setCommentText(''); }} className="flex gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                 <img src={currentUser.avatar || "https://picsum.photos/seed/default/100/100"} alt="You" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1">
                 <input 
                   type="text" 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   placeholder="Add a comment..." 
                   className={`w-full bg-transparent border-b border-gray-700 ${isUltra ? 'focus:border-cyan-500' : 'focus:border-brand-500'} text-sm py-2 px-0 outline-none text-white transition-colors placeholder-gray-600`}
                 />
                 <div className={`flex justify-end mt-2 overflow-hidden transition-all duration-300 ${commentText ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button type="submit" className={`${isUltra ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-brand-600 hover:bg-brand-500'} text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors`}>
                      Comment
                    </button>
                 </div>
               </div>
             </form>
             {/* Comments List */}
             <div className="space-y-4">
               {comments.map(comment => (
                 <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                      <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${comment.user === currentUser.username ? `${isUltra ? 'bg-indigo-600' : 'bg-brand-600'} text-white px-1.5 rounded-sm` : 'text-gray-200'}`}>{comment.user}</span>
                        <span className="text-[10px] text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.text}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* SIDEBAR SUGGESTIONS */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h2 className="text-lg font-semibold text-white">Up Next</h2>
             <label className="flex items-center cursor-pointer">
               <span className="text-xs text-gray-400 mr-2">Autoplay</span>
               <div className="relative">
                 <input type="checkbox" className="sr-only" defaultChecked />
                 <div className="w-8 h-4 bg-gray-700 rounded-full shadow-inner"></div>
                 <div className={`dot absolute w-2 h-2 ${isUltra ? 'bg-cyan-400' : 'bg-brand-400'} rounded-full shadow -left-0 top-1 transition`}></div>
               </div>
             </label>
           </div>
           {suggested.map(v => (
              <VideoCard 
                key={v.id} 
                video={v} 
                onClick={onVideoSelect}
                isFavorite={isFavorite} 
                isWatchLater={isWatchLater(v.id)}
                onToggleFavorite={() => onToggleFavorite()}
                onToggleWatchLater={onToggleWatchLater}
                onShowToast={onShowToast}
                isUltra={isUltra}
              />
            ))}
        </div>

      </div>
    </div>
  );
};

export default Player;
