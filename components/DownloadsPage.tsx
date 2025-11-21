
import React from 'react';
import { EmptyView } from './StateViews';

interface DownloadsPageProps {
  onBack: () => void;
}

import { Video } from '../types';

const DownloadsPage: React.FC<DownloadsPageProps> = ({ onBack }) => {
  // Mock downloaded data - In a real PWA this would access Cache Storage or IndexedDB
  // For this web version, we simulate downloads via localStorage
  const [downloads, setDownloads] = React.useState<Video[]>([]);

  React.useEffect(() => {
      try {
          const saved = localStorage.getItem('playnite_downloads');
          if (saved) {
              setDownloads(JSON.parse(saved));
          } else {
              setDownloads([]); // No mock fallback
          }
      } catch (e) {
          setDownloads([]);
      }
  }, []);

  const handleDelete = (id: string) => {
      const newDownloads = downloads.filter(v => v.id !== id);
      setDownloads(newDownloads);
      localStorage.setItem('playnite_downloads', JSON.stringify(newDownloads));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in">
       <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-white"></i>
          </button>
          <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500">
             <i className="fa-solid fa-download text-xl"></i>
          </div>
          <div>
             <h1 className="text-2xl font-bold text-white">Downloads</h1>
             <p className="text-gray-400 text-sm">Watch your content offline.</p>
          </div>
          <div className="ml-auto text-right">
             <p className="text-white font-bold">{downloads.length > 0 ? `${(downloads.length * 0.4).toFixed(1)} GB` : '0 B'}</p>
             <p className="text-xs text-gray-500">Used Space</p>
          </div>
       </div>

       {downloads.length > 0 ? (
         <div className="space-y-4">
           {downloads.map(video => (
              <div key={video.id} className="flex flex-col sm:flex-row gap-4 bg-dark-card p-4 rounded-xl border border-gray-800 group hover:border-gray-600 transition-colors">
                 <div className="w-full sm:w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                    <img src={video.thumbnail} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 rounded font-mono">{video.duration}</div>
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{video.author} • ~400 MB</p>
                    <div className="flex gap-3">
                       <button className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-brand-500 flex items-center gap-2">
                          <i className="fa-solid fa-play"></i> Play
                       </button>
                       <button onClick={() => handleDelete(video.id)} className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2">
                          <i className="fa-solid fa-trash"></i> Delete
                       </button>
                    </div>
                 </div>
              </div>
           ))}
         </div>
       ) : (
         <EmptyView 
           icon="fa-download"
           title="No Downloads"
           description="Videos you download will appear here for offline viewing. Great for when you're on the go."
           actionLabel="Find Videos"
           onAction={onBack}
         />
       )}
    </div>
  );
};

export default DownloadsPage;
