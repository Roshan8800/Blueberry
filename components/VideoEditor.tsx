import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoEditorProps {
  video: Video;
  onClose: () => void;
  onSave: (editedVideo: { startTime: number; endTime: number; cropArea?: { x: number; y: number; width: number; height: number } }) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ video, onClose, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setDuration(videoRef.current!.duration);
        setEndTime(videoRef.current!.duration);
      });
      videoRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(videoRef.current!.currentTime);
      });
    }
  }, []);

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

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

  const handleSave = () => {
    onSave({
      startTime,
      endTime,
      cropArea: cropArea || undefined
    });
    onClose();
  };

  const drawCropArea = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (cropArea) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  };

  useEffect(() => {
    if (isCropping) {
      drawCropArea();
    }
  }, [currentTime, cropArea, isCropping]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Simple crop: click to set top-left, drag to set size
    if (!cropArea) {
      setCropArea({ x, y, width: 100, height: 100 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Video: {video.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"
          >
            <i className="fa-solid fa-x text-white"></i>
          </button>
        </div>

        <div className="space-y-6">
          {/* Video Preview */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={video.embedUrl}
              className="w-full h-auto max-h-96 object-contain"
              onLoadedMetadata={() => setDuration(videoRef.current!.duration)}
              onTimeUpdate={() => setCurrentTime(videoRef.current!.currentTime)}
            />
            {isCropping && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onClick={handleCanvasClick}
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white">
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
                </button>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleTimeUpdate}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <span className="text-white text-sm font-mono">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Trimming Controls */}
          <div className="bg-gray-900 p-4 rounded-xl">
            <h3 className="text-white font-bold mb-4">Trim Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time: {Math.floor(startTime / 60)}:{(startTime % 60).toFixed(0).padStart(2, '0')}</label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time: {Math.floor(endTime / 60)}:{(endTime % 60).toFixed(0).padStart(2, '0')}</label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
              <p className="text-sm text-gray-400">Duration: {(endTime - startTime).toFixed(1)} seconds</p>
            </div>
          </div>

          {/* Cropping Controls */}
          <div className="bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Crop Video</h3>
              <button
                onClick={() => setIsCropping(!isCropping)}
                className={`px-3 py-1 rounded text-sm font-bold ${isCropping ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {isCropping ? 'Stop Cropping' : 'Start Cropping'}
              </button>
            </div>
            {isCropping && (
              <p className="text-sm text-gray-400 mb-4">
                Click on the video to set crop area. This is a preview - actual cropping requires server-side processing.
              </p>
            )}
            {cropArea && (
              <div className="text-sm text-gray-300">
                <p>Crop Area: X:{cropArea.x.toFixed(0)}, Y:{cropArea.y.toFixed(0)}, W:{cropArea.width.toFixed(0)}, H:{cropArea.height.toFixed(0)}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;