
import React, { useState } from 'react';
import { MOCK_PLAYLISTS, MOCK_VIDEOS } from '../constants';
import { EmptyView } from './StateViews';

interface PlaylistViewProps {
  onBack: () => void;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ onBack }) => {
  const [activePlaylist, setActivePlaylist] = useState(MOCK_PLAYLISTS[0]);
  const hasPlaylists = MOCK_PLAYLISTS.length > 0;

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
                  <button className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30">
                      <i className="fa-solid fa-plus"></i> Create New
                  </button>
                  <div className="h-px bg-gray-800 my-4"></div>
                  {MOCK_PLAYLISTS.map(pl => (
                      <div 
                          key={pl.id}
                          onClick={() => setActivePlaylist(pl)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activePlaylist.id === pl.id ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'}`}
                      >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900">
                              <img src={pl.thumbnail} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="text-white font-semibold truncate">{pl.name}</p>
                              <p className="text-xs text-gray-500">{pl.videoCount} videos</p>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Detail View */}
              <div className="lg:col-span-3 bg-dark-card rounded-2xl border border-gray-800 p-6 min-h-[500px]">
                  <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-800">
                      <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
                          <img src={activePlaylist.thumbnail} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                           <h2 className="text-3xl font-bold text-white mb-2">{activePlaylist.name}</h2>
                           <p className="text-gray-400 mb-4">Created by You • Last updated today</p>
                           <div className="flex gap-3">
                              <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                  <i className="fa-solid fa-play"></i> Play All
                              </button>
                              <button className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-700 transition-colors flex items-center gap-2">
                                  <i className="fa-solid fa-shuffle"></i> Shuffle
                              </button>
                              <button className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white">
                                  <i className="fa-solid fa-pen"></i>
                              </button>
                           </div>
                      </div>
                  </div>

                  {/* Video List */}
                  <div className="space-y-2">
                      {MOCK_VIDEOS.slice(0, 6).map((video, index) => (
                          <div key={video.id} className="flex items-center gap-4 p-2 hover:bg-gray-800/50 rounded-lg group cursor-grab active:cursor-grabbing">
                               <span className="text-gray-600 font-mono w-6 text-center group-hover:hidden">{index + 1}</span>
                               <span className="text-gray-400 w-6 text-center hidden group-hover:block"><i className="fa-solid fa-grip-lines"></i></span>
                               
                               <div className="w-24 h-14 bg-gray-900 rounded overflow-hidden relative flex-shrink-0">
                                   <img src={video.thumbnail} className="w-full h-full object-cover" />
                               </div>
                               
                               <div className="flex-1">
                                   <p className="text-white font-medium line-clamp-1">{video.title}</p>
                                   <p className="text-xs text-gray-500">{video.author}</p>
                               </div>
                               
                               <p className="text-xs text-gray-500 font-mono mr-4">{video.duration}</p>
                               <button className="text-gray-600 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100">
                                  <i className="fa-solid fa-trash"></i>
                               </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        ) : (
          <EmptyView 
             icon="fa-list-ul"
             title="No Playlists"
             description="Create playlists to organize your favorite videos and watch them anytime."
             actionLabel="Create Playlist"
             onAction={() => {}} 
          />
        )}
    </div>
  );
};

export default PlaylistView;
