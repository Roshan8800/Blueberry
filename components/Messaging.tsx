import React, { useState, useEffect, useRef } from 'react';
import { Message, User, AppView } from '../types';
import { sendMessage, fetchMessages, markMessageAsRead, getFollowers, getFollowing } from '../services/firebase';
import { EmptyView } from './StateViews';

interface MessagingProps {
  currentUser: User | null;
  setView: (view: AppView) => void;
  isUltra?: boolean;
}

interface Conversation {
  userId: string;
  username: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messaging: React.FC<MessagingProps> = ({ currentUser, setView, isUltra = false }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!currentUser) return;

    try {
      // Get followers and following to create conversation list
      const [followersResult, followingResult] = await Promise.all([
        getFollowers(currentUser.id),
        getFollowing(currentUser.id)
      ]);

      const connections = new Set([
        ...(followersResult.success ? followersResult.data : []),
        ...(followingResult.success ? followingResult.data : [])
      ]);

      // For demo purposes, create mock conversations
      const mockConversations: Conversation[] = Array.from(connections).slice(0, 5).map(userId => ({
        userId,
        username: `User${userId.slice(-4)}`,
        avatar: `https://picsum.photos/seed/${userId}/100/100`,
        lastMessage: 'Hey, how are you?',
        lastMessageTime: '2h ago',
        unreadCount: Math.floor(Math.random() * 3)
      }));

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!currentUser) return;

    const result = await fetchMessages(currentUser.id, otherUserId);
    if (result.success) {
      setMessages(result.data || []);
      // Mark messages as read
      result.data?.forEach(msg => {
        if (msg.receiverId === currentUser.id && !msg.read) {
          markMessageAsRead(msg.id);
        }
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !selectedConversation || !newMessage.trim()) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedConversation.userId,
      content: newMessage,
      read: false,
      time: 'Just now',
      createdAt: new Date()
    };

    const result = await sendMessage(messageData);
    if (result.success) {
      setMessages([...messages, result.data!]);
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <i className="fa-solid fa-lock text-4xl text-gray-500 mb-4"></i>
          <p className="text-gray-400">Please log in to access messaging.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const accentColor = isUltra ? 'text-cyan-400' : 'text-brand-500';
  const accentBg = isUltra ? 'bg-cyan-600' : 'bg-brand-600';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400">Connect privately with other users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-white">Conversations</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length > 0 ? conversations.map(conversation => (
              <button
                key={conversation.userId}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-800 transition-colors border-b border-gray-800/50 ${
                  selectedConversation?.userId === conversation.userId ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      className="w-12 h-12 rounded-full"
                      alt={conversation.username}
                    />
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-white truncate">{conversation.username}</p>
                      <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </button>
            )) : (
              <div className="p-8 text-center">
                <i className="fa-solid fa-comments text-3xl text-gray-600 mb-4"></i>
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-600 mt-2">Follow users to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-dark-card rounded-xl border border-gray-800 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <img
                  src={selectedConversation.avatar}
                  className="w-10 h-10 rounded-full"
                  alt={selectedConversation.username}
                />
                <div>
                  <h3 className="font-bold text-white">{selectedConversation.username}</h3>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser.id
                          ? `${accentBg} text-white`
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.senderId === currentUser.id ? 'text-gray-200' : 'text-gray-400'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/20 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${
                      newMessage.trim()
                        ? `${accentBg} text-white hover:opacity-90`
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyView
                icon="fa-comments"
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging."
                actionLabel="Browse Users"
                onAction={() => setView(AppView.MODELS)}
                isUltra={isUltra}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;