
import React, { useState } from 'react';
import { MOCK_PLAYLISTS, MOCK_VIDEOS } from '../constants';
import { EmptyView } from './StateViews';
import PlaylistModal from './PlaylistModal';
import { Playlist } from '../types';

interface PlaylistViewProps {
  onBack: () => void;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ onBack }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);
  const [activePlaylist, setActivePlaylist] = useState(playlists[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | undefined>();
  const hasPlaylists = playlists.length > 0;

  const handleCreatePlaylist = (newPlaylistData: Omit<Playlist, 'id' | 'createdAt' | 'lastUpdated' | 'videoCount'>) => {
    const newPlaylist: Playlist = {
      ...newPlaylistData,
      id: `p${Date.now()}`,
      videoCount: newPlaylistData.videos.length,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setActivePlaylist(newPlaylist);
  };

  const handleEditPlaylist = (updatedData: Omit<Playlist, 'id' | 'createdAt' | 'lastUpdated' | 'videoCount'>) => {
    if (!editingPlaylist) return;
    const updatedPlaylist: Playlist = {
      ...editingPlaylist,
      ...updatedData,
      videoCount: updatedData.videos.length,
      lastUpdated: new Date()
    };
    setPlaylists(prev => prev.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
    setActivePlaylist(updatedPlaylist);
    setEditingPlaylist(undefined);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylist.id === playlistId) {
      const remaining = playlists.filter(p => p.id !== playlistId);
      setActivePlaylist(remaining[0] || null);
    }
  };

  const handleReorderVideos = (playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      const videos = [...p.videos];
      const [moved] = videos.splice(fromIndex, 1);
      videos.splice(toIndex, 0, moved);
      return { ...p, videos, lastUpdated: new Date() };
    }));
    if (activePlaylist.id === playlistId) {
      const videos = [...activePlaylist.videos];
      const [moved] = videos.splice(fromIndex, 1);
      videos.splice(toIndex, 0, moved);
      setActivePlaylist({ ...activePlaylist, videos, lastUpdated: new Date() });
    }
  };

  const handleRemoveVideo = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      const videos = p.videos.filter(v => v.id !== videoId);
      return { ...p, videos, videoCount: videos.length, lastUpdated: new Date() };
    }));
    if (activePlaylist.id === playlistId) {
      const videos = activePlaylist.videos.filter(v => v.id !== videoId);
      setActivePlaylist({ ...activePlaylist, videos, videoCount: videos.length, lastUpdated: new Date() });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in">
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
                <i className="fa-solid fa-arrow-left text-white"></i>
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <i className="fa-solid fa-list text-brand-500"></i> Library
            </h1>
        </div>
        
        {hasPlaylists ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar List */}
              <div className="space-y-2">
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30 hover:bg-brand-700 transition-colors"
                  >
                      <i className="fa-solid fa-plus"></i> Create New
                  </button>
                  <div className="h-px bg-gray-800 my-4"></div>
                  {playlists.map(pl => (
                      <div
                          key={pl.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${activePlaylist?.id === pl.id ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'}`}
                      >
                          <div
                              onClick={() => setActivePlaylist(pl)}
                              className="flex items-center gap-3 flex-1"
                          >
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900">
                                  <img src={pl.thumbnail} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                  <p className="text-white font-semibold truncate">{pl.name}</p>
                                  <p className="text-xs text-gray-500">{pl.videoCount} videos</p>
                              </div>
                          </div>
                          <button
                              onClick={() => handleDeletePlaylist(pl.id)}
                              className="text-gray-600 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <i className="fa-solid fa-trash"></i>
                          </button>
                      </div>
                  ))}
              </div>

              {/* Detail View */}
              {activePlaylist ? (
                <div className="lg:col-span-3 bg-dark-card rounded-2xl border border-gray-800 p-6 min-h-[500px]">
                  <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-800">
                      <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
                          <img src={activePlaylist.thumbnail} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                           <h2 className="text-3xl font-bold text-white mb-2">{activePlaylist.name}</h2>
                           {activePlaylist.description && <p className="text-gray-300 mb-2">{activePlaylist.description}</p>}
                           <p className="text-gray-400 mb-4">Created by {activePlaylist.createdBy} • Last updated {activePlaylist.lastUpdated.toLocaleDateString()}</p>
                           <div className="flex gap-3">
                              <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                  <i className="fa-solid fa-play"></i> Play All
                              </button>
                              <button className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-700 transition-colors flex items-center gap-2">
                                  <i className="fa-solid fa-shuffle"></i> Shuffle
                              </button>
                              <button
                                  onClick={() => { setEditingPlaylist(activePlaylist); setIsModalOpen(true); }}
                                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                              >
                                  <i className="fa-solid fa-pen"></i>
                              </button>
                           </div>
                      </div>
                  </div>

                  {/* Video List */}
                  <div className="space-y-2">
                      {activePlaylist.videos.map((video, index) => (
                          <div key={video.id} className="flex items-center gap-4 p-2 hover:bg-gray-800/50 rounded-lg group">
                               <div className="flex flex-col gap-1">
                                   <button
                                       onClick={() => index > 0 && handleReorderVideos(activePlaylist.id, index, index - 1)}
                                       disabled={index === 0}
                                       className="text-gray-600 hover:text-white p-1 disabled:opacity-30"
                                   >
                                       <i className="fa-solid fa-chevron-up"></i>
                                   </button>
                                   <button
                                       onClick={() => index < activePlaylist.videos.length - 1 && handleReorderVideos(activePlaylist.id, index, index + 1)}
                                       disabled={index === activePlaylist.videos.length - 1}
                                       className="text-gray-600 hover:text-white p-1 disabled:opacity-30"
                                   >
                                       <i className="fa-solid fa-chevron-down"></i>
                                   </button>
                               </div>

                               <div className="w-24 h-14 bg-gray-900 rounded overflow-hidden relative flex-shrink-0">
                                   <img src={video.thumbnail} className="w-full h-full object-cover" />
                               </div>

                               <div className="flex-1">
                                   <p className="text-white font-medium line-clamp-1">{video.title}</p>
                                   <p className="text-xs text-gray-500">{video.author}</p>
                               </div>

                               <p className="text-xs text-gray-500 font-mono mr-4">{video.duration}</p>
                               <button
                                   onClick={() => handleRemoveVideo(activePlaylist.id, video.id)}
                                   className="text-gray-600 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <i className="fa-solid fa-trash"></i>
                               </button>
                          </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-3 bg-dark-card rounded-2xl border border-gray-800 p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-400">Select a playlist to view details</p>
                </div>
              )}
          </div>
        ) : (
          <EmptyView
             icon="fa-list-ul"
             title="No Playlists"
             description="Create playlists to organize your favorite videos and watch them anytime."
             actionLabel="Create Playlist"
             onAction={() => setIsModalOpen(true)}
          />
        )}

        <PlaylistModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPlaylist(undefined); }}
          onSave={editingPlaylist ? handleEditPlaylist : handleCreatePlaylist}
          initialPlaylist={editingPlaylist}
        />
    </div>
  );
};

export default PlaylistView;
