import React, { useState, useEffect } from 'react';
import type { CreatorAnalytics } from '../types';
import { fetchCreatorAnalytics } from '../services/firebase';

interface CreatorAnalyticsProps {
  creatorId: string;
  onBack: () => void;
}

const CreatorAnalytics: React.FC<CreatorAnalyticsProps> = ({ creatorId, onBack }) => {
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const result = await fetchCreatorAnalytics(creatorId);
      if (result.success) {
        setAnalytics(result.data!);
      }
      setLoading(false);
    };
    loadAnalytics();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-in fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading creator analytics...</p>
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
          <h1 className="text-3xl font-bold text-white">Creator Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Detailed insights into your content performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
              <i className="fa-solid fa-eye text-blue-400"></i>
            </div>
            <span className="text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded">+15%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Views</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
              <i className="fa-solid fa-heart text-red-400"></i>
            </div>
            <span className="text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalLikes.toLocaleString()}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Likes</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <i className="fa-solid fa-comment text-green-400"></i>
            </div>
            <span className="text-xs text-blue-500 bg-blue-900/20 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalComments.toLocaleString()}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Comments</p>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
              <i className="fa-solid fa-dollar-sign text-yellow-400"></i>
            </div>
            <span className="text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded">+20%</span>
          </div>
          <p className="text-2xl font-bold text-white">${analytics.revenue.total.toLocaleString()}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Revenue</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">${analytics.revenue.fromSubscriptions.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">From Subscriptions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">${analytics.revenue.fromTips.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">From Tips</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">${analytics.revenue.fromAds.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">From Ads</p>
          </div>
        </div>
      </div>

      {/* Top Videos */}
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Videos</h3>
        <div className="space-y-4">
          {analytics.topVideos.map((video, index) => (
            <div key={video.videoId} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400 w-8">#{index + 1}</span>
                <div>
                  <p className="text-white font-medium">{video.title}</p>
                  <p className="text-gray-500 text-sm">{video.views.toLocaleString()} views • {video.likes} likes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">${Math.floor(video.views / 1000) * 0.01}</p>
                <p className="text-gray-500 text-xs">Estimated earnings</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Audience Demographics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Age Groups</p>
              {Object.entries(analytics.demographics.ageGroups).map(([age, percentage]) => (
                <div key={age} className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">{age}</span>
                  <span className="text-gray-400 text-sm">{percentage}%</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Gender</p>
              {Object.entries(analytics.demographics.genders).map(([gender, percentage]) => (
                <div key={gender} className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm capitalize">{gender}</span>
                  <span className="text-gray-400 text-sm">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.demographics.locations).map(([location, percentage]) => (
              <div key={location} className="flex justify-between items-center">
                <span className="text-white">{location}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-gray-400 text-sm w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAnalytics;