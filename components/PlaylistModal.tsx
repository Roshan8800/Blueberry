import React, { useState } from 'react';
import { Playlist, Video } from '../types';
import { MOCK_VIDEOS } from '../constants';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'lastUpdated' | 'videoCount'>) => void;
  initialPlaylist?: Playlist;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, onSave, initialPlaylist }) => {
  const [name, setName] = useState(initialPlaylist?.name || '');
  const [description, setDescription] = useState(initialPlaylist?.description || '');
  const [selectedVideos, setSelectedVideos] = useState<string[]>(initialPlaylist?.videos.map(v => v.id) || []);

  const handleSave = () => {
    if (!name.trim()) return;

    const videos = MOCK_VIDEOS.filter(v => selectedVideos.includes(v.id));
    onSave({
      name: name.trim(),
      description: description.trim(),
      thumbnail: videos[0]?.thumbnail || 'https://picsum.photos/seed/default/300/300',
      videos,
      createdBy: 'You'
    });
    onClose();
  };

  const toggleVideo = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {initialPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"
          >
            <i className="fa-solid fa-x text-white"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              placeholder="Enter playlist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Describe your playlist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Add Videos</label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {MOCK_VIDEOS.map(video => (
                <div
                  key={video.id}
                  onClick={() => toggleVideo(video.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedVideos.includes(video.id) ? 'bg-brand-900/30 border border-brand-500' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video.id)}
                    onChange={() => toggleVideo(video.id)}
                    className="w-4 h-4 text-brand-500 bg-gray-900 border-gray-700 rounded focus:ring-brand-500"
                  />
                  <img src={video.thumbnail} className="w-12 h-8 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">{video.title}</p>
                    <p className="text-gray-400 text-xs">{video.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialPlaylist ? 'Save Changes' : 'Create Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;