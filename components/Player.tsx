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
  // Generate suggestions that exclude current video
  const suggested = MOCK_VIDEOS.filter(v => v.id !== video.id);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);

  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(true); 
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
  const [isLocked, setIsLocked] = useState(false); 
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [seekAnim, setSeekAnim] = useState<{ type: 'forward' | 'backward' | 'play' | 'pause', id: number } | null>(null);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // Minutes

  // --- Ultra/Premium Features State ---
  const [isAiUpscale, setIsAiUpscale] = useState(false);
  const [isSpatialAudio, setIsSpatialAudio] = useState(false);
  const [audioBoost, setAudioBoost] = useState(false);
  const [abLoop, setAbLoop] = useState<{a: number, b: number | null} | null>(null);
  
  // --- Gesture States ---
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const [gestureFeedback, setGestureFeedback] = useState<{type: 'volume' | 'brightness' | 'speed', value: number | string} | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // --- Interactions State ---
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "JohnDoe", avatar: "https://picsum.photos/seed/u1/100/100", text: "Great content! The production quality is amazing.", time: "2 hours ago", likes: 12 },
    { id: 2, user: "SarahSmith", avatar: "https://picsum.photos/seed/u2/100/100", text: "Ultra mode looks insane on my OLED.", time: "5 hours ago", likes: 5 },
  ]);
  const [commentText, setCommentText] = useState('');

  // Iframe handling
  const isIframeEmbed = video.embedUrl && (video.embedUrl.includes('http') || video.embedUrl.includes('<iframe'));
  const iframeSrc = video.embedUrl; 
  const DEMO_VIDEO_SRC = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Safe View Count Parsing
  const getRawViewCount = (val: string | number | undefined) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).toUpperCase();
    try {
        if (str.includes('M')) return parseFloat(str.replace(/,/g, '').replace('M', '')) * 1000000;
        if (str.includes('K')) return parseFloat(str.replace(/,/g, '').replace('K', '')) * 1000;
        return parseInt(str.replace(/,/g, '')) || 0;
    } catch (e) { return 0; }
  };
  const [likesCount, setLikesCount] = useState(Math.floor(getRawViewCount(video.views) * (video.rating / 100) * 0.1));

  // Effects
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setIsLocked(false);
    setZoomLevel(1);
    setAbLoop(null);
    setAudioBoost(false);
    // Reset video element
    if (videoRef.current && !isIframeEmbed) {
      videoRef.current.load();
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [video.id]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isPlaying && !isLocked) {
       timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls, isLocked]);

  useEffect(() => {
     if(sleepTimer && sleepTimer > 0) {
        const timer = setTimeout(() => {
            if(videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
                setSleepTimer(null);
                onShowToast("Sleep timer: Video paused");
            }
        }, sleepTimer * 60000);
        return () => clearTimeout(timer);
     }
  }, [sleepTimer]);

  // AB Loop Logic
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      
      // Handle AB Loop
      if (abLoop && abLoop.b && curr >= abLoop.b) {
         videoRef.current.currentTime = abLoop.a;
      }
    }
  };

  // --- Actions ---
  
  const togglePlay = () => {
    if (isIframeEmbed) return;
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      setSeekAnim({ type: !isPlaying ? 'play' : 'pause', id: Date.now() });
      setTimeout(() => setSeekAnim(null), 600);
    }
  };

  const seekRelative = (seconds: number) => {
    if (isIframeEmbed || !videoRef.current) return;
    videoRef.current.currentTime += seconds;
    setSeekAnim({ type: seconds > 0 ? 'forward' : 'backward', id: Date.now() });
    setTimeout(() => setSeekAnim(null), 600);
  };

  const changeVolume = (newVol: number) => {
    if (isIframeEmbed || !videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
    setGestureFeedback({ type: 'volume', value: Math.round(clamped * 100) });
    setTimeout(() => setGestureFeedback(null), 1000);
  };

  const toggleMute = () => {
    changeVolume(isMuted ? 0.8 : 0);
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      onShowToast(`Speed: ${speed}x`);
      setShowSpeedMenu(false);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      onShowToast("PiP not supported or enabled");
    }
  };

  const toggleABLoop = () => {
     if(!videoRef.current) return;
     const curr = videoRef.current.currentTime;
     
     if (!abLoop) {
         setAbLoop({ a: curr, b: null });
         onShowToast("Loop Point A Set");
     } else if (abLoop.a !== null && abLoop.b === null) {
         if (curr > abLoop.a) {
             setAbLoop({ ...abLoop, b: curr });
             onShowToast("Loop Point B Set - Looping Active");
         } else {
             onShowToast("Point B must be after Point A");
         }
     } else {
         setAbLoop(null);
         onShowToast("Loop Cleared");
     }
  };

  const stepFrame = (forward: boolean) => {
     if(videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime += (forward ? 0.04 : -0.04); // Approx 1 frame at 24fps
     }
  };

  // --- Gestures ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked || isIframeEmbed) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    
    // Double Tap Logic
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
        const width = window.innerWidth;
        const x = e.touches[0].clientX;
        if (x < width * 0.3) seekRelative(-10);
        else if (x > width * 0.7) seekRelative(10);
        else togglePlay();
    }
    lastTapRef.current = now;

    // Long Press for Speed (2x)
    longPressTimer.current = setTimeout(() => {
        if(videoRef.current) {
            videoRef.current.playbackRate = 2.0;
            setGestureFeedback({type: 'speed', value: '2x'});
        }
    }, 600);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isLocked || isIframeEmbed) return;
    
    // Cancel Long Press if moving
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }

    const deltaY = touchStartRef.current.y - e.touches[0].clientY;
    const deltaX = touchStartRef.current.x - e.touches[0].clientX;
    
    // Ignore small movements
    if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10) return;

    const { innerWidth } = window;
    const touchX = e.touches[0].clientX;

    // Vertical Swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const step = deltaY > 0 ? 0.02 : -0.02;
        if (touchX < innerWidth / 2) {
             // Left Side: Brightness
             const newBright = Math.min(150, Math.max(20, brightness + (step * 100)));
             setBrightness(newBright);
             setGestureFeedback({ type: 'brightness', value: Math.round(newBright) });
        } else {
             // Right Side: Volume
             changeVolume(volume + step);
        }
    }
    
    touchStartRef.current.y = e.touches[0].clientY; // Update for continuous drag
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
    }
    // Reset speed if it was long pressed
    if(videoRef.current && videoRef.current.playbackRate === 2.0 && playbackSpeed !== 2.0) {
        videoRef.current.playbackRate = playbackSpeed;
    }
    touchStartRef.current = null;
    setTimeout(() => setGestureFeedback(null), 500);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowleft':
          seekRelative(-5);
          break;
        case 'arrowright':
          seekRelative(5);
          break;
        case 't':
          setIsTheaterMode(prev => !prev);
          break;
        case 'l':
          seekRelative(10);
          break;
        case 'j':
          seekRelative(-10);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, isTheaterMode]);

  const toggleLightsOff = () => setIsLightsOff(!isLightsOff);

  // --- Styling ---
  const accentColor = isUltra ? 'text-cyan-400' : 'text-brand-500';
  const accentBg = isUltra ? 'bg-cyan-500' : 'bg-brand-600';
  const sliderClass = isUltra ? 'accent-cyan-400' : 'accent-brand-500';

  return (
    <div className={`w-full mx-auto p-0 ${isTheaterMode ? 'max-w-full' : 'lg:max-w-[1800px] lg:p-6'} transition-all duration-500 relative z-20`}>
      
      {/* Lights Off Overlay */}
      <div className={`fixed inset-0 bg-black z-[-1] transition-opacity duration-1000 pointer-events-none ${isLightsOff ? 'opacity-95' : 'opacity-0'}`}></div>

      <div className={`grid gap-6 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-4'}`}>
        
        {/* MAIN PLAYER COLUMN (Spans 2 or 3 cols) */}
        <div className={`${isTheaterMode ? '' : 'lg:col-span-2 xl:col-span-3'} flex flex-col gap-4`}>
          
          {/* Player Wrapper */}
          <div 
            ref={playerContainerRef}
            className={`relative bg-black rounded-none lg:rounded-xl overflow-hidden shadow-2xl group select-none ${isUltra ? 'shadow-indigo-900/20' : 'shadow-brand-900/20'} ${isFullscreen ? 'h-screen w-screen fixed inset-0 z-50 rounded-none' : (isTheaterMode ? 'aspect-video h-[80vh]' : 'aspect-video')}`}
            onMouseMove={() => { setShowControls(true); }}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
             {isIframeEmbed ? (
                 <iframe src={iframeSrc} className="w-full h-full" frameBorder="0" allowFullScreen allow="autoplay; encrypted-media"></iframe>
             ) : (
                 <video 
                    ref={videoRef}
                    src={DEMO_VIDEO_SRC}
                    poster={video.thumbnail}
                    className="w-full h-full object-contain bg-black"
                    style={{ 
                        transform: `scale(${zoomLevel})`,
                        filter: `brightness(${brightness}%) ${isAiUpscale ? 'contrast(1.1) saturate(1.2) drop-shadow(0 0 1px rgba(255,255,255,0.5))' : ''}` 
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => { if(videoRef.current) setDuration(videoRef.current.duration); }}
                    onEnded={() => setIsPlaying(false)}
                    onClick={!isLocked ? togglePlay : undefined}
                    loop={isLooping}
                    playsInline
                 />
             )}

             {/* --- Custom Controls Overlay (Only for non-iframe) --- */}
             {!isIframeEmbed && (
               <>
                 {/* Gesture Feedback Center Overlay */}
                 {gestureFeedback && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-white animate-in fade-in zoom-in duration-200">
                            <i className={`fa-solid ${gestureFeedback.type === 'volume' ? 'fa-volume-high' : gestureFeedback.type === 'brightness' ? 'fa-sun' : 'fa-forward'} text-3xl mb-2`}></i>
                            <span className="font-bold text-xl">{gestureFeedback.value}{gestureFeedback.type !== 'speed' && '%'}</span>
                        </div>
                    </div>
                 )}
                 
                 {/* Seek Animation */}
                 {seekAnim && (
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 rounded-full p-8 backdrop-blur-sm animate-ping duration-500 pointer-events-none`}>
                        <i className={`fa-solid ${seekAnim.type === 'play' ? 'fa-play' : seekAnim.type === 'pause' ? 'fa-pause' : seekAnim.type === 'forward' ? 'fa-forward' : 'fa-backward'} text-white text-4xl`}></i>
                    </div>
                 )}

                 {/* Lock Status */}
                 {isLocked && (
                    <div className="absolute top-6 left-6 z-50">
                         <button onClick={() => {setIsLocked(false); onShowToast("Unlocked")}} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-all">
                            <i className="fa-solid fa-lock text-xl"></i>
                         </button>
                    </div>
                 )}

                 {/* Control Bar */}
                 <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 z-30 transition-opacity duration-300 flex flex-col justify-between p-4 ${showControls && !isLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    
                    {/* Top Bar */}
                    <div className="flex justify-between items-start">
                        <h2 className="text-white font-bold text-lg drop-shadow-md truncate max-w-[60%]">{video.title}</h2>
                        <div className="flex gap-3">
                             {/* Premium Toggles */}
                             {isUltra && (
                                <div className="hidden sm:flex bg-black/40 rounded-lg border border-white/10 p-1 gap-1">
                                    <button onClick={() => setIsAiUpscale(!isAiUpscale)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isAiUpscale ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}>AI Upscale</button>
                                    <button onClick={() => setIsSpatialAudio(!isSpatialAudio)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isSpatialAudio ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>360° Audio</button>
                                    <button onClick={() => setAudioBoost(!audioBoost)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${audioBoost ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}>Boost</button>
                                </div>
                             )}
                             <button onClick={toggleLightsOff} className="text-white hover:text-brand-400" title="Lights Off"><i className={`fa-regular ${isLightsOff ? 'fa-lightbulb' : 'fa-moon'}`}></i></button>
                             <button onClick={() => setIsLocked(true)} className="text-white hover:text-brand-400"><i className="fa-solid fa-lock-open"></i></button>
                        </div>
                    </div>

                    {/* Center Play Trigger (Invisible mostly, huge hit area) */}
                    <div className="absolute inset-0 z-[-1]" onClick={togglePlay}></div>

                    {/* Bottom Controls */}
                    <div className="space-y-2">
                        {/* Scrubber */}
                        <div className="group/scrubber relative h-4 flex items-center cursor-pointer">
                           {abLoop && abLoop.b && (
                               <div className="absolute h-full bg-yellow-500/30 z-0" style={{ 
                                   left: `${(abLoop.a / duration) * 100}%`, 
                                   width: `${((abLoop.b - abLoop.a) / duration) * 100}%` 
                               }}></div>
                           )}
                           <input 
                             type="range" 
                             min={0} 
                             max={duration} 
                             value={currentTime} 
                             onChange={(e) => { if(videoRef.current) videoRef.current.currentTime = Number(e.target.value); }}
                             className={`absolute w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer z-20 ${sliderClass} hover:h-1.5 transition-all`}
                             style={{
                                 backgroundSize: `${(currentTime/duration)*100}% 100%`,
                                 backgroundImage: `linear-gradient(${isUltra ? '#22d3ee' : '#f43f5e'}, ${isUltra ? '#22d3ee' : '#f43f5e'})`
                               }}
                           />
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Left Controls */}
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="text-white hover:text-brand-400 w-8"><i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i></button>
                                <button onClick={() => seekRelative(-10)} className="text-gray-300 hover:text-white hidden sm:block"><i className="fa-solid fa-rotate-left"></i></button>
                                <button onClick={() => seekRelative(10)} className="text-gray-300 hover:text-white hidden sm:block"><i className="fa-solid fa-rotate-right"></i></button>
                                
                                <div className="flex items-center gap-2 group/vol">
                                   <button onClick={toggleMute} className="text-white hover:text-brand-400 w-6"><i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i></button>
                                   <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} className={`w-0 group-hover/vol:w-20 transition-all duration-300 h-1 rounded-lg appearance-none ${sliderClass}`} />
                                </div>

                                <span className="text-xs text-gray-300 font-mono">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-3 relative">
                                {/* AB Loop */}
                                <button onClick={toggleABLoop} className={`text-xs font-bold px-2 py-0.5 rounded border ${abLoop ? 'bg-yellow-500 text-black border-yellow-500' : 'border-gray-500 text-gray-400 hover:text-white'}`}>
                                    {abLoop ? (abLoop.b ? 'A-B ON' : 'SET B') : 'A-B'}
                                </button>

                                {/* Frame Step */}
                                <div className="hidden sm:flex border border-gray-600 rounded overflow-hidden">
                                   <button onClick={() => stepFrame(false)} className="px-2 hover:bg-gray-700 text-gray-300"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
                                   <button onClick={() => stepFrame(true)} className="px-2 hover:bg-gray-700 text-gray-300"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
                                </div>

                                {/* Settings Menu */}
                                <div className="relative">
                                    <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className={`text-white hover:${accentColor} transition-transform ${showSettingsMenu ? 'rotate-45' : ''}`}><i className="fa-solid fa-gear text-lg"></i></button>
                                    {showSettingsMenu && (
                                        <div className="absolute bottom-full right-0 mb-3 bg-black/90 border border-gray-800 rounded-xl p-2 w-48 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                                            <div className="space-y-1">
                                                <button onClick={() => {setShowSpeedMenu(!showSpeedMenu); setShowSettingsMenu(false)}} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex justify-between">
                                                    <span>Speed</span> <span>{playbackSpeed}x <i className="fa-solid fa-chevron-right text-xs"></i></span>
                                                </button>
                                                <button onClick={() => setIsLooping(!isLooping)} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex justify-between">
                                                    <span>Loop Video</span> {isLooping && <i className="fa-solid fa-check text-green-400"></i>}
                                                </button>
                                                <div className="h-px bg-gray-800 my-1"></div>
                                                <div className="px-3 py-2">
                                                   <span className="text-xs text-gray-400 block mb-1">Sleep Timer</span>
                                                   <div className="flex gap-1">
                                                       <button onClick={() => setSleepTimer(10)} className={`flex-1 py-1 text-xs rounded ${sleepTimer === 10 ? 'bg-brand-600' : 'bg-gray-800'}`}>10m</button>
                                                       <button onClick={() => setSleepTimer(30)} className={`flex-1 py-1 text-xs rounded ${sleepTimer === 30 ? 'bg-brand-600' : 'bg-gray-800'}`}>30m</button>
                                                       <button onClick={() => setSleepTimer(null)} className={`flex-1 py-1 text-xs rounded ${sleepTimer === null ? 'bg-white text-black' : 'bg-gray-800'}`}>Off</button>
                                                   </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Speed Submenu */}
                                    {showSpeedMenu && (
                                        <div className="absolute bottom-full right-0 mb-3 bg-black/90 border border-gray-800 rounded-xl overflow-hidden w-32 animate-in fade-in">
                                            {[0.25, 0.5, 1, 1.25, 1.5, 2].map(s => (
                                                <button key={s} onClick={() => handleSpeedChange(s)} className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 ${playbackSpeed === s ? accentColor : 'text-white'}`}>{s}x</button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button onClick={togglePiP} className="text-white hover:text-brand-400 hidden sm:block" title="Picture in Picture"><i className="fa-solid fa-up-right-from-square"></i></button>
                                <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="text-white hover:text-brand-400 hidden md:block"><i className={`fa-solid ${isTheaterMode ? 'fa-compress' : 'fa-expand'}`}></i></button>
                                <button onClick={toggleFullscreen} className="text-white hover:text-brand-400"><i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i></button>
                            </div>
                        </div>
                    </div>
                 </div>
               </>
             )}
          </div>

          {/* Info / Actions Bar */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">{video.title}</h1>
              
              <div className="flex flex-wrap justify-between items-center gap-4">
                 {/* Stats & Author */}
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${video.author}/100/100`} className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm hover:underline cursor-pointer">{video.author}</p>
                        <p className="text-xs text-gray-400">{video.views} views • {video.category}</p>
                    </div>
                    <button 
                        onClick={() => setIsSubscribed(!isSubscribed)}
                        className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${isSubscribed ? 'bg-gray-700 text-gray-300' : (isUltra ? 'bg-white text-black hover:bg-gray-200' : 'bg-brand-600 text-white hover:bg-brand-500')}`}
                    >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                 </div>

                 {/* Interaction Buttons */}
                 <div className="flex items-center gap-2 bg-black/20 p-1 rounded-full border border-gray-800/50">
                    <button onClick={() => setLikesCount(prev => prev + 1)} className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        <i className="fa-regular fa-thumbs-up"></i> <span className="text-xs font-bold">{likesCount}</span>
                    </button>
                    <div className="w-px h-4 bg-gray-700"></div>
                    <button className="px-4 py-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"><i className="fa-regular fa-thumbs-down"></i></button>
                    <div className="w-px h-4 bg-gray-700"></div>
                    <button onClick={() => onToggleFavorite()} className={`px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors ${isFavorite ? 'text-brand-500' : 'text-gray-300 hover:text-white'}`}>
                        <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
                    </button>
                    <button className="px-4 py-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"><i className="fa-solid fa-share"></i></button>
                    <button className="px-4 py-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors hidden sm:block"><i className="fa-solid fa-download"></i></button>
                 </div>
              </div>

              {/* Description Box */}
              <div className="mt-4 bg-black/20 rounded-xl p-3 text-sm text-gray-300 hover:bg-black/30 transition-colors cursor-pointer">
                  <p className="line-clamp-2 hover:line-clamp-none transition-all">
                      <span className="font-bold text-white block mb-1">Description</span>
                      {video.description}
                  </p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                      {video.tags.map(tag => <span key={tag} className="text-brand-400 text-xs">#{tag}</span>)}
                  </div>
              </div>
          </div>

          {/* Comments Section */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800 hidden md:block">
              <h3 className="font-bold text-white mb-4">Comments <span className="text-gray-500 font-normal text-sm">(142)</span></h3>
              <div className="flex gap-3 mb-6">
                 <img src={currentUser.avatar || "https://picsum.photos/seed/me/50/50"} className="w-8 h-8 rounded-full" />
                 <div className="flex-1">
                     <input 
                       type="text" 
                       value={commentText} 
                       onChange={e => setCommentText(e.target.value)} 
                       placeholder="Add a comment..." 
                       className="w-full bg-transparent border-b border-gray-700 focus:border-white outline-none text-white pb-1 text-sm transition-colors"
                     />
                     {commentText && (
                         <div className="flex justify-end gap-2 mt-2">
                             <button onClick={() => setCommentText('')} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                             <button className={`text-xs px-3 py-1 rounded-full font-bold ${isUltra ? 'bg-cyan-600 text-black' : 'bg-brand-600 text-white'}`}>Comment</button>
                         </div>
                     )}
                 </div>
              </div>
              <div className="space-y-4">
                 {comments.map(c => (
                     <div key={c.id} className="flex gap-3">
                         <img src={c.avatar} className="w-8 h-8 rounded-full" />
                         <div>
                             <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-white">{c.user}</span>
                                 <span className="text-[10px] text-gray-500">{c.time}</span>
                             </div>
                             <p className="text-sm text-gray-300 mt-0.5">{c.text}</p>
                             <div className="flex gap-3 mt-1">
                                 <button className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"><i className="fa-solid fa-thumbs-up"></i> {c.likes}</button>
                                 <button className="text-[10px] text-gray-500 hover:text-white">Reply</button>
                             </div>
                         </div>
                     </div>
                 ))}
              </div>
          </div>
        </div>

        {/* SIDEBAR RECOMMENDATIONS (Right Col) */}
        <div className="lg:col-span-1 flex flex-col gap-3 h-full overflow-y-auto no-scrollbar">
           <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-white font-bold text-lg">Up Next</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                 <span>Autoplay</span>
                 <div className={`w-8 h-4 rounded-full bg-gray-700 relative cursor-pointer`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${true ? 'translate-x-4 bg-brand-500' : ''}`}></div>
                 </div>
              </div>
           </div>

           {/* Suggestion Filter Chips */}
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-2">
              {['All', 'From this channel', 'Related', 'New'].map(filter => (
                  <button key={filter} className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'All' ? (isUltra ? 'bg-white text-black' : 'bg-gray-200 text-black') : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                      {filter}
                  </button>
              ))}
           </div>

           {suggested.map((vid) => (
              <div 
                key={vid.id} 
                onClick={() => onVideoSelect(vid)}
                className="flex gap-2 group cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-colors"
              >
                 {/* Compact Horizontal Card Layout for Sidebar */}
                 <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-900 relative flex-shrink-0 border border-transparent group-hover:border-gray-600 transition-colors">
                    <img src={vid.thumbnail} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">{vid.duration}</span>
                    {vid.category === 'Premium' && <div className="absolute top-1 left-1 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded">PRO</div>}
                 </div>
                 <div className="flex flex-col gap-1 min-w-0 pt-0.5">
                    <h4 className="text-white text-sm font-bold line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors">{vid.title}</h4>
                    <p className="text-gray-400 text-xs hover:text-white">{vid.author}</p>
                    <p className="text-gray-500 text-[10px] mt-auto">{vid.views} views • {Math.floor(Math.random() * 10)} days ago</p>
                 </div>
                 <div className="ml-auto">
                     <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity px-1"><i className="fa-solid fa-ellipsis-vertical text-xs"></i></button>
                 </div>
              </div>
           ))}

           {/* Load More / Infinite Scroll Dummy */}
           <button className="w-full py-3 text-xs text-gray-500 hover:text-white border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors mt-2">
               Show More
           </button>
        </div>
      </div>
    </div>
  );
};

export default Player;