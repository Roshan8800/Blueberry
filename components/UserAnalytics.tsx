import React, { useState, useEffect } from 'react';
import type { UserAnalytics } from '../types';
import { fetchUserAnalytics } from '../services/firebase';

interface UserAnalyticsProps {
  userId: string;
  onBack: () => void;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ userId, onBack }) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const result = await fetchUserAnalytics(userId);
      if (result.success) {
        setAnalytics(result.data!);
      }
      setLoading(false);
    };
    loadAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-in fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-in fade-in">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-4"><i className="fa-solid fa-arrow-left"></i> Back</button>
        <div className="text-center py-12">
          <p className="text-gray-400">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-4"><i className="fa-solid fa-arrow-left"></i> Back</button>
          <h1 className="text-3xl font-bold text-white">Your Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Track your viewing habits and engagement</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
              <i className="fa-solid fa-clock text-blue-400"></i>
            </div>
            <span className="text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalWatchTime}m</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Watch Time</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
              <i className="fa-solid fa-play text-purple-400"></i>
            </div>
            <span className="text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.videosWatched}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Videos Watched</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <i className="fa-solid fa-heart text-green-400"></i>
            </div>
            <span className="text-xs text-blue-500 bg-blue-900/20 px-2 py-1 rounded">+5%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.engagementRate}%</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Engagement Rate</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
              <i className="fa-solid fa-calendar text-orange-400"></i>
            </div>
            <span className="text-xs text-gray-500 bg-gray-900/20 px-2 py-1 rounded">Today</span>
          </div>
          <p className="text-lg font-bold text-white">{analytics.lastActive.toLocaleDateString()}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Last Active</p>
        </div>
      </div>

      {/* Favorite Categories */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Favorite Categories</h3>
        <div className="flex flex-wrap gap-3">
          {analytics.favoriteCategories.map((category, index) => (
            <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Watch History Summary */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                <i className="fa-solid fa-play text-gray-400"></i>
              </div>
              <div>
                <p className="text-white font-medium">Watched "Sample Video"</p>
                <p className="text-gray-500 text-sm">2 hours ago</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">15m</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                <i className="fa-solid fa-heart text-gray-400"></i>
              </div>
              <div>
                <p className="text-white font-medium">Liked "Another Video"</p>
                <p className="text-gray-500 text-sm">1 day ago</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">Action</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;