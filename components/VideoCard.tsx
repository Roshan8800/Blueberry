
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  isFavorite?: boolean;
  isWatchLater?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleWatchLater?: (id: string) => void;
  onShowToast?: (msg: string) => void;
  isLocked?: boolean;
  isUltra?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onClick, 
  isFavorite = false, 
  isWatchLater = false,
  onToggleFavorite,
  onToggleWatchLater,
  onShowToast,
  isLocked = false,
  isUltra = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Preview State
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLive = video.category === 'Live Cams' || video.duration === 'LIVE';

  // Reset preview on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlayingPreview(false);
    setPreviewProgress(0);
    setShowMenu(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleMouseEnter = () => {
    if (!isLocked) setIsHovered(true);
  };

  // Handle Video Playback Sync
  useEffect(() => {
    if (isPlayingPreview && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play prevented", error);
                setIsPlayingPreview(false);
            });
        }
    } else if (!isPlayingPreview && videoRef.current) {
        videoRef.current.pause();
    }
  }, [isPlayingPreview]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration > 0) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setPreviewProgress(progress);
    }
  };

  const togglePreviewPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingPreview(!isPlayingPreview);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    onShowToast?.(isMuted ? "Unmuted Preview" : "Muted Preview");
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(video.id);
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWatchLater?.(video.id);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleShare = (e: React.MouseEvent, platform?: string) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (platform) {
      onShowToast?.(`Shared to ${platform}`);
    } else {
      navigator.clipboard.writeText(`https://playnite.com/watch/${video.id}`);
      onShowToast?.("Link copied to clipboard!");
    }
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsDismissed(true);
    onShowToast?.("Video removed from your feed");
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onShowToast?.("Thanks for reporting. We will review this content.");
  };

  const handleClick = () => {
    if (isLocked) {
      onShowToast?.("Sign up to watch Premium content");
      return;
    }
    onClick(video);
  };

  if (isDismissed) return null;

  // Theme variables
  const accentColor = isUltra ? 'text-cyan-400' : 'text-brand-500';
  const accentBg = isUltra ? 'bg-cyan-500' : 'bg-brand-600';
  const glowColor = isUltra ? 'group-hover:shadow-cyan-500/20' : 'group-hover:shadow-brand-500/20';

  // Preview Source (Mock)
  const PREVIEW_SRC = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-dark-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${glowColor} border border-gray-800/50 flex flex-col h-full select-none ${isLocked ? 'opacity-80 grayscale-[0.5]' : ''}`}
    >
      {/* Thumbnail Wrapper */}
      <div className="aspect-video relative overflow-hidden bg-gray-900">
        {/* Locked Overlay */}
        {isLocked && (
           <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center mb-2">
                 <i className="fa-solid fa-lock text-brand-500 text-xl"></i>
              </div>
              <span className="text-white font-bold text-sm">Premium Only</span>
              <span className="text-gray-400 text-xs mt-1">Sign up to unlock</span>
           </div>
        )}

        {/* Thumbnail Image */}
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'} ${isPlayingPreview ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />

        {/* Video Preview Layer */}
        {isHovered && !isLocked && (
            <video 
                ref={videoRef}
                src={PREVIEW_SRC}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlayingPreview ? 'opacity-100' : 'opacity-0'}`}
                muted={isMuted}
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
            />
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity ${isPlayingPreview ? 'opacity-0' : 'opacity-60 group-hover:opacity-40'}`} />
        
        {/* Live Badge or Duration */}
        <div className={`absolute top-2 right-2 z-10 transition-opacity ${isPlayingPreview ? 'opacity-0' : 'opacity-100'}`}>
          {isLive ? (
             <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse shadow-lg shadow-red-900/50">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
             </div>
          ) : (
             <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-1.5 py-0.5 rounded border border-white/10">
              {video.duration}
             </span>
          )}
        </div>

        {/* Hover Controls & Preview UI (Hidden if Locked) */}
        {isHovered && !isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-200">
            {/* Top Actions */}
            <div className="flex justify-between p-3">
               <div className="flex gap-2">
                  <button 
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs`}></i>
                  </button>
               </div>
               <div className="flex gap-2">
                  <button 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isWatchLater ? `${accentBg} text-white` : 'bg-black/60 hover:bg-white hover:text-black text-white'}`}
                    onClick={handleWatchLater}
                    title="Watch Later"
                  >
                    <i className={`fa-${isWatchLater ? 'solid' : 'regular'} fa-clock text-xs`}></i>
                  </button>
                  <button 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorite ? `${accentBg} text-white` : 'bg-black/60 hover:bg-white hover:text-black text-white'}`}
                    onClick={handleFavorite}
                    title="Favorite"
                  >
                    <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-xs`}></i>
                  </button>
               </div>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                   onClick={togglePreviewPlay}
                   className={`pointer-events-auto w-12 h-12 rounded-full ${isPlayingPreview ? 'bg-transparent border-2 border-white/50 opacity-0 hover:opacity-100' : `${accentBg} shadow-lg opacity-100`} flex items-center justify-center text-white transition-all transform hover:scale-110`}
                >
                   <i className={`fa-solid ${isPlayingPreview ? 'fa-pause' : 'fa-play'} ${isPlayingPreview ? 'text-sm' : 'ml-1 text-lg'}`}></i>
                </button>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-auto">
               <div className="flex justify-between items-end px-3 pb-2 text-xs text-white font-medium text-shadow-sm">
                  <span className="bg-black/50 px-1.5 rounded">{isPlayingPreview ? "Previewing" : "Click to Preview"}</span>
               </div>
               <div className="w-full h-1 bg-white/20">
                  <div 
                     className={`h-full ${accentBg} transition-all duration-100 ease-linear`} 
                     style={{ width: `${previewProgress}%` }}
                  ></div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 relative z-20 bg-dark-card flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1 relative">
          <h3 className={`text-gray-100 font-bold text-sm line-clamp-2 leading-snug group-hover:${accentColor} transition-colors flex-1`}>
            {video.title}
          </h3>
          
          {!isLocked && (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="text-gray-500 hover:text-white transition-colors p-1 -mr-1 rounded-full hover:bg-gray-800"
              >
                <i className="fa-solid fa-ellipsis-vertical text-xs w-4 text-center"></i>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                  ></div>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-dark-surface border border-gray-700 rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <button onClick={(e) => handleShare(e)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-3 transition-colors">
                      <i className="fa-solid fa-link w-4"></i> Copy Link
                    </button>
                    <button onClick={(e) => handleShare(e, "Twitter")} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-3 transition-colors">
                      <i className="fa-brands fa-twitter w-4"></i> Share on X
                    </button>
                    <div className="h-px bg-gray-800 my-1 mx-2"></div>
                    <button onClick={handleNotInterested} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-3 transition-colors">
                      <i className="fa-solid fa-ban w-4"></i> Not Interested
                    </button>
                    <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-3 transition-colors">
                      <i className="fa-solid fa-flag w-4"></i> Report
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span className={`${isLive ? "text-red-400 font-semibold" : "hover:text-white transition-colors"}`}>
            {video.author}
          </span>
          {video.rating > 95 && (
            <span className="text-yellow-500" title="Top Rated">
              <i className="fa-solid fa-star text-[10px]"></i>
            </span>
          )}
        </div>
        
        <div className="mt-auto flex justify-between items-center border-t border-gray-800 pt-2">
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
             <span className="flex items-center gap-1">
               <i className="fa-solid fa-eye"></i> {video.views}
             </span>
             <span className="flex items-center gap-1">
               <i className="fa-solid fa-thumbs-up"></i> {video.rating}%
             </span>
          </div>
          
          {/* Premium Badge */}
          {video.category === 'Premium' && (
            <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/30 px-1.5 rounded bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
              PREMIUM
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
