import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import { Video, User } from '../types';

interface SearchResultsProps {
  videos: Video[];
  query: string;
  onVideoSelect: (video: Video) => void;
  currentUser: User | null;
  favoriteIds: Set<string>;
  watchLaterIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onShowToast: (msg: string) => void;
  isUltra: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  videos,
  query,
  onVideoSelect,
  currentUser,
  favoriteIds,
  watchLaterIds,
  onToggleFavorite,
  onToggleWatchLater,
  onShowToast,
  isUltra
}) => {
  const [filteredVideos, setFilteredVideos] = useState<Video[]>(videos);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views' | 'rating'>('relevance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'SD' | 'HD' | '4K'>('all');

  // Get unique categories and tags
  const categories = Array.from(new Set(videos.map(v => v.category)));
  const allTags = Array.from(new Set(videos.flatMap(v => v.tags)));

  useEffect(() => {
    let filtered = videos.filter(video => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(video.category)) return false;

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => video.tags.includes(tag))) return false;

      // Duration filter
      const duration = typeof video.duration === 'string' ? parseDuration(video.duration) : video.duration / 1000;
      if (durationFilter === 'short' && duration >= 300) return false; // <5min
      if (durationFilter === 'medium' && (duration < 300 || duration >= 900)) return false; // 5-15min
      if (durationFilter === 'long' && duration < 900) return false; // >15min

      // Quality filter
      if (qualityFilter !== 'all') {
        const hasQuality = video.tags.some(tag =>
          (qualityFilter === 'SD' && tag.toLowerCase().includes('sd')) ||
          (qualityFilter === 'HD' && (tag.toLowerCase().includes('hd') || tag.toLowerCase().includes('1080'))) ||
          (qualityFilter === '4K' && tag.toLowerCase().includes('4k'))
        );
        if (!hasQuality) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Assuming no upload date, sort by id or reverse
          return b.id.localeCompare(a.id);
        case 'views':
          return parseInt(b.views.replace(/,/g, '')) - parseInt(a.views.replace(/,/g, ''));
        case 'rating':
          return b.rating - a.rating;
        default: // relevance
          return 0; // Keep original order
      }
    });

    setFilteredVideos(filtered);
  }, [videos, selectedCategories, selectedTags, durationFilter, qualityFilter, sortBy]);

  const parseDuration = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const renderVideoList = (videos: Video[]) => {
    const isGuest = !currentUser || currentUser.role === 'GUEST';
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {videos.map(video => {
          const isPremium = video.category === 'Premium' || video.tags.includes('exclusive');
          const isLocked = isGuest && isPremium;
          return (
            <VideoCard
              key={video.id}
              video={video}
              onClick={onVideoSelect}
              isFavorite={favoriteIds.has(video.id)}
              isWatchLater={watchLaterIds.has(video.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleWatchLater={onToggleWatchLater}
              onShowToast={onShowToast}
              isLocked={isLocked}
              isUltra={isUltra}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-gray-900 rounded-lg p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Filters</h3>

            {/* Sort */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="views">Views</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat));
                        }
                      }}
                      className="mr-2"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allTags.slice(0, 20).map(tag => (
                  <label key={tag} className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        }
                      }}
                      className="mr-2"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="all">All</option>
                <option value="short">Short (under 5min)</option>
                <option value="medium">Medium (5-15min)</option>
                <option value="long">Long (over 15min)</option>
              </select>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="all">All</option>
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="4K">4K</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedTags([]);
                setDurationFilter('all');
                setQualityFilter('all');
                setSortBy('relevance');
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              Search results for "{query}" ({filteredVideos.length} videos)
            </h2>
          </div>
          {filteredVideos.length > 0 ? (
            renderVideoList(filteredVideos)
          ) : (
            <div className="text-center py-12">
              <i className="fa-solid fa-search text-4xl text-gray-600 mb-4"></i>
              <p className="text-gray-400">No videos found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;