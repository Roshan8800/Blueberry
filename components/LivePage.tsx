
import React, { useState, useEffect } from 'react';
import { EmptyView, ErrorView } from './StateViews';
import { fetchVideos } from '../services/firebase';
import { Video, LiveStream, User } from '../types';
import LivePlayer from './LivePlayer';

interface LivePageProps {
  onBack: () => void;
  currentUser: User | null;
  onShowToast: (msg: string) => void;
}

const LivePage: React.FC<LivePageProps> = ({ onBack, currentUser, onShowToast }) => {
   const [liveChannels, setLiveChannels] = useState<Video[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  useEffect(() => {
      const loadLive = async () => {
          setLoading(true);
          setError(null);
          try {
              const result = await fetchVideos();
              if (result.success) {
                  const videos = result.data || [];
                  const live = videos.filter(v => v.category === 'Live Cams' || v.duration === 'LIVE');

                  setLiveChannels(live); // No fallback
              } else {
                  setError(result.error || "Failed to load live channels");
                  setLiveChannels([]);
              }
          } catch (err) {
              setError("An unexpected error occurred while loading live channels");
              setLiveChannels([]);
          }
          setLoading(false);
      };
      loadLive();
  }, []);

  const createLiveStream = (video: Video): LiveStream => {
    return {
      id: video.id,
      title: video.title,
      streamerId: video.author, // Assuming author is the streamer ID
      streamerName: video.author,
      streamerAvatar: `https://picsum.photos/seed/${video.author}/100/100`,
      thumbnail: video.thumbnail,
      streamUrl: video.embedUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Fallback for demo
      isLive: true,
      viewerCount: Math.floor(Math.random() * 5000 + 500),
      startedAt: new Date(Date.now() - Math.random() * 3600000), // Random start time within last hour
      chatMessages: [
        {
          id: '1',
          userId: 'user1',
          username: 'Fan123',
          avatar: 'https://picsum.photos/seed/user1/40/40',
          message: 'Great stream!',
          timestamp: new Date(Date.now() - 300000),
        },
        {
          id: '2',
          userId: 'user2',
          username: 'Viewer456',
          avatar: 'https://picsum.photos/seed/user2/40/40',
          message: 'Love the energy!',
          timestamp: new Date(Date.now() - 120000),
        }
      ],
      activePolls: [
        {
          id: 'poll1',
          question: 'What should I play next?',
          options: [
            { id: 'opt1', text: 'Rock music', votes: 15 },
            { id: 'opt2', text: 'Pop music', votes: 8 },
            { id: 'opt3', text: 'Jazz', votes: 5 }
          ],
          createdAt: new Date(),
          endsAt: new Date(Date.now() + 300000), // 5 minutes
          isActive: true
        }
      ],
      reactions: [],
      isRecording: false
    };
  };

  const handleChannelClick = (video: Video) => {
    const stream = createLiveStream(video);
    setSelectedStream(stream);
  };

  // If a stream is selected, show the LivePlayer
  if (selectedStream) {
    return <LivePlayer stream={selectedStream} currentUser={currentUser!} onBack={() => setSelectedStream(null)} onShowToast={onShowToast} />;
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
       <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
             <i className="fa-solid fa-arrow-left text-white"></i>
          </button>
          <h1 className="text-2xl font-bold text-white">Live Channels</h1>
       </div>

       {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
             <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
       ) : error ? (
         <ErrorView
           message={error}
           onRetry={() => {
             const loadLive = async () => {
               setLoading(true);
               setError(null);
               try {
                 const result = await fetchVideos();
                 if (result.success) {
                   const videos = result.data || [];
                   const live = videos.filter(v => v.category === 'Live Cams' || v.duration === 'LIVE');

                   setLiveChannels(live); // No fallback, show empty if no live channels
                 } else {
                   setError(result.error || "Failed to load live channels");
                   setLiveChannels([]);
                 }
               } catch (err) {
                 setError("An unexpected error occurred while loading live channels");
                 setLiveChannels([]);
               }
               setLoading(false);
             };
             loadLive();
           }}
         />
       ) : liveChannels.length > 0 ? (
         <>
           <div className="relative rounded-2xl overflow-hidden aspect-[4/1] mb-8 border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
               <img src="https://picsum.photos/seed/crowd/1600/400" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex items-center p-10">
                   <div>
                       <div className="flex items-center gap-2 mb-2">
                           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                           <span className="text-red-500 font-bold tracking-wider text-sm uppercase">Live Now</span>
                       </div>
                       <h1 className="text-4xl font-bold text-white mb-4">Live Exclusive Events</h1>
                       <p className="text-gray-300 max-w-lg mb-6">Join thousands of users in real-time interactive shows. Chat, tip, and interact with your favorite stars.</p>
                       <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50">
                           Browse Channels
                       </button>
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveChannels.map(channel => (
                 <div key={channel.id} onClick={() => handleChannelClick(channel)} className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 group cursor-pointer hover:border-red-900/50 transition-all">
                     <div className="aspect-video relative">
                         <img src={channel.thumbnail} className="w-full h-full object-cover" />
                         <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                             LIVE
                         </div>
                         <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                             <i className="fa-solid fa-user"></i> {Math.floor(Math.random() * 5000 + 500)}
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <i className="fa-regular fa-circle-play text-4xl text-white drop-shadow-lg"></i>
                         </div>
                     </div>
                     <div className="p-3 flex gap-3">
                         <img src={`https://picsum.photos/seed/${channel.author}/50/50`} className="w-10 h-10 rounded-full border border-gray-700" />
                         <div>
                             <h3 className="text-white font-bold text-sm line-clamp-1">{channel.title}</h3>
                             <p className="text-gray-400 text-xs">{channel.author}</p>
                             <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 rounded border border-gray-700">Chat</span>
                                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 rounded border border-gray-700">HD</span>
                             </div>
                         </div>
                     </div>
                 </div>
              ))}
           </div>
         </>
       ) : (
         <EmptyView 
            icon="fa-video-slash"
            title="No Live Streams"
            description="There are no live broadcasts at the moment. Check back later for scheduled events."
            actionLabel="View Schedule"
            onAction={() => {}}
         />
       )}
    </div>
  );
};

export default LivePage;
