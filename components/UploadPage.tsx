import React, { useState } from 'react';
import { AppView } from '../types';

interface UploadPageProps {
  onBack: () => void;
  setView: (view: AppView) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onBack, setView }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const handleUpload = () => {
    // In a real app, this would upload the file and save metadata
    console.log('Upload data:', { title, description, scheduledDate, scheduledTime, isScheduled });
    alert('Video uploaded successfully!');
    onBack();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-white"></i>
        </button>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fa-solid fa-upload text-brand-500"></i> Upload Video
        </h1>
      </div>

      <div className="bg-dark-card rounded-2xl border border-gray-800 p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-brand-500 transition-colors">
              <i className="fa-solid fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
              <p className="text-white font-medium mb-2">Drop your video file here or click to browse</p>
              <p className="text-gray-400 text-sm">Supported formats: MP4, MOV, AVI (Max 2GB)</p>
              <input type="file" accept="video/*" className="hidden" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              placeholder="Enter video title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none resize-none"
              rows={4}
              placeholder="Describe your video"
            />
          </div>

          {/* Scheduling */}
          <div className="bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 text-brand-500 bg-gray-900 border-gray-700 rounded focus:ring-brand-500"
              />
              <label htmlFor="schedule" className="text-white font-medium">Schedule for later</label>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Release Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Release Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!title.trim()}
              className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScheduled ? 'Schedule Upload' : 'Upload Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;