import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import { Video, User } from '../types';
import { getVideoRecommendations } from '../services/geminiService';

interface RecommendationsProps {
  allVideos: Video[];
  currentUser: User | null;
  favoriteIds: Set<string>;
  watchLaterIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onShowToast: (msg: string) => void;
  onVideoSelect: (video: Video) => void;
  isUltra: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  allVideos,
  currentUser,
  favoriteIds,
  watchLaterIds,
  onToggleFavorite,
  onToggleWatchLater,
  onShowToast,
  onVideoSelect,
  isUltra
}) => {
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let sampleTags: string[] = [];
        if (currentUser && favoriteIds.size > 0) {
          // Use tags from user's favorites for personalization
          const favoriteVideos = allVideos.filter(v => favoriteIds.has(v.id));
          sampleTags = Array.from(new Set(favoriteVideos.flatMap(v => v.tags)));
        }
        if (sampleTags.length === 0) {
          sampleTags = ['amateur', 'teen', 'blonde']; // Default
        }
        const recTags = await getVideoRecommendations(sampleTags);

        // Filter videos that match recommended tags
        const recs = allVideos.filter(video =>
          recTags.some(tag => video.tags.some(vTag => vTag.toLowerCase().includes(tag.toLowerCase())))
        ).slice(0, 10); // Limit to 10

        setRecommendedVideos(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        // Fallback to random videos
        setRecommendedVideos(allVideos.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [allVideos]);

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedVideos.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
        {recommendedVideos.map(video => {
          const isGuest = !currentUser || currentUser.role === 'GUEST';
          const isPremium = video.category === 'Premium' || video.tags.includes('exclusive');
          const isLocked = isGuest && isPremium;
          return (
            <div key={video.id} className="flex-shrink-0 w-48">
              <VideoCard
                video={video}
                onClick={onVideoSelect}
                isFavorite={favoriteIds.has(video.id)}
                isWatchLater={watchLaterIds.has(video.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleWatchLater={onToggleWatchLater}
                onShowToast={onShowToast}
                isLocked={isLocked}
                isUltra={isUltra}
                compact={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;