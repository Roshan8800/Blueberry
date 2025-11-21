import React, { useState, useEffect, useRef } from 'react';
import { Video, User, LiveChatMessage, LivePoll, LiveReaction, LiveStream } from '../types';

interface LivePlayerProps {
  stream: LiveStream;
  currentUser: User;
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ stream, currentUser, onBack, onShowToast }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(stream.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [activePolls, setActivePolls] = useState<LivePoll[]>(stream.activePolls || []);
  const [reactions, setReactions] = useState<LiveReaction[]>(stream.reactions || []);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(5);
  const [tipMessage, setTipMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(stream.viewerCount);
  const [isRecording, setIsRecording] = useState(stream.isRecording || false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate viewer count changes
      setViewerCount(prev => prev + Math.floor(Math.random() * 10 - 5));

      // Simulate new reactions
      if (Math.random() < 0.1) {
        const emojis = ['❤️', '🔥', '👏', '😍', '💯', '🚀'];
        const newReaction: LiveReaction = {
          id: Date.now().toString(),
          userId: `user_${Math.random()}`,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          timestamp: new Date()
        };
        setReactions(prev => [...prev.slice(-20), newReaction]);

        // Remove reaction after animation
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: LiveChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/40/40`,
      message: chatInput,
      timestamp: new Date(),
      isStreamer: currentUser.id === stream.streamerId
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    chatInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  const sendTip = async () => {
    if (tipAmount < 1) {
      onShowToast("Minimum tip amount is $1");
      return;
    }

    // Simulate payment processing
    onShowToast(`Sending $${tipAmount} tip...`);

    setTimeout(() => {
      onShowToast(`Tip of $${tipAmount} sent successfully! ${tipMessage ? `"${tipMessage}"` : ''}`);

      // Add tip message to chat
      const tipMessageObj: LiveChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/40/40`,
        message: `tipped $${tipAmount}${tipMessage ? ` - ${tipMessage}` : ''}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, tipMessageObj]);
      setShowTipModal(false);
      setTipAmount(5);
      setTipMessage('');
    }, 1000);
  };

  const voteInPoll = (pollId: string, optionId: string) => {
    setActivePolls(prev => prev.map(poll =>
      poll.id === pollId
        ? {
            ...poll,
            options: poll.options.map(opt =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
          }
        : poll
    ));
    onShowToast("Vote submitted!");
  };

  const sendReaction = (emoji: string) => {
    const newReaction: LiveReaction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      emoji,
      timestamp: new Date()
    };

    setReactions(prev => [...prev.slice(-20), newReaction]);

    // Remove after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    onShowToast(isRecording ? "Recording stopped" : "Recording started");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`w-full h-screen bg-black relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-white"></i>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">{stream.title}</h1>
              <p className="text-gray-300 text-sm">{stream.streamerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
            <div className="flex items-center gap-2 text-white">
              <i className="fa-solid fa-eye"></i>
              <span>{viewerCount.toLocaleString()}</span>
            </div>
            {currentUser.id === stream.streamerId && (
              <button
                onClick={toggleRecording}
                className={`px-3 py-1 rounded-full text-sm font-bold ${isRecording ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                <i className="fa-solid fa-circle"></i> {isRecording ? 'Recording' : 'Record'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full h-full relative">
        <video
          ref={videoRef}
          src={stream.streamUrl}
          poster={stream.thumbnail}
          className="w-full h-full object-contain"
          autoPlay
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Tip Overlay */}
        <div className="absolute bottom-20 left-4 z-30">
          <button
            onClick={() => setShowTipModal(true)}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full font-bold hover:from-pink-600 hover:to-red-600 transition-all shadow-lg"
          >
            <i className="fa-solid fa-heart mr-2"></i>Tip
          </button>
        </div>

        {/* Reaction Buttons */}
        <div className="absolute bottom-20 right-4 z-30 flex flex-col gap-2">
          {['❤️', '🔥', '👏', '😍', '💯'].map(emoji => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl transition-all hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Floating Reactions */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {reactions.map(reaction => (
            <div
              key={reaction.id}
              className="absolute animate-bounce text-4xl"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                animation: `float-up 3s ease-out forwards`
              }}
            >
              {reaction.emoji}
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-red-400">
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
              </button>
              <button onClick={toggleMute} className="text-white hover:text-red-400">
                <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
              </button>
              <div className="text-white text-sm">
                Live Stream
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setShowChat(!showChat)} className="text-white hover:text-red-400">
                <i className="fa-solid fa-comments"></i>
              </button>
              <button onClick={toggleFullscreen} className="text-white hover:text-red-400">
                <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-20 right-4 bottom-4 w-80 bg-black/90 rounded-xl border border-gray-700 flex flex-col z-30">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-white font-bold">Live Chat</h3>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map(message => (
              <div key={message.id} className="flex gap-2">
                <img src={message.avatar} className="w-6 h-6 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${message.isStreamer ? 'text-red-400' : message.isModerator ? 'text-green-400' : 'text-white'}`}>
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{message.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={sendChatMessage}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div className="absolute top-20 left-4 w-80 bg-black/90 rounded-xl border border-gray-700 p-4 z-30">
          <h3 className="text-white font-bold mb-3">Live Poll</h3>
          {activePolls.map(poll => (
            <div key={poll.id} className="space-y-2">
              <p className="text-white font-medium">{poll.question}</p>
              <div className="space-y-1">
                {poll.options.map(option => {
                  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                  return (
                    <button
                      key={option.id}
                      onClick={() => voteInPoll(poll.id, option.id)}
                      className="w-full text-left bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-colors relative overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-red-600 opacity-30"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="relative z-10">{option.text}</span>
                      <span className="relative z-10 float-right text-sm text-gray-400">
                        {option.votes} ({percentage.toFixed(0)}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-4">Send a Tip</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Message (optional)</label>
                <textarea
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  placeholder="Say something nice..."
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendTip}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-500 transition-colors font-bold"
                >
                  Send Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(100px); opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LivePlayer;