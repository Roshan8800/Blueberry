import React, { useState, useEffect } from 'react';
import { CommunityPost, CommunityComment, User, AppView } from '../types';
import { fetchCommunityPosts, createCommunityPost, likeCommunityPost, createComment, fetchCommentsForPost, likeComment, shareVideo } from '../services/firebase';
import { EmptyView } from './StateViews';

interface CommunityProps {
  currentUser: User | null;
  setView: (view: AppView) => void;
  isUltra?: boolean;
}

const Community: React.FC<CommunityProps> = ({ currentUser, setView, isUltra = false }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [shareOptionsPostId, setShareOptionsPostId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const result = await fetchCommunityPosts();
    if (result.success) {
      setPosts(result.data || []);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!currentUser || !newPostContent.trim()) return;

    const postData = {
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar || '',
      content: newPostContent,
      likes: 0,
      likedBy: [],
      comments: [],
      time: 'Just now',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await createCommunityPost(postData);
    if (result.success) {
      setPosts([result.data!, ...posts]);
      setNewPostContent('');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;

    const result = await likeCommunityPost(postId, currentUser.id);
    if (result.success) {
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: result.data!,
              likedBy: post.likedBy.includes(currentUser.id)
                ? post.likedBy.filter(id => id !== currentUser.id)
                : [...post.likedBy, currentUser.id]
            }
          : post
      ));
    }
  };

  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!currentUser || !commentContent.trim()) return;

    const commentData = {
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar || '',
      content: commentContent,
      likes: 0,
      likedBy: [],
      replies: [],
      time: 'Just now',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await createComment({ ...commentData, postId });
    if (result.success) {
      // Update post comments count
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, result.data!] }
          : post
      ));
    }
  };

  const handleLikeComment = async (commentId: string, postId: string) => {
    if (!currentUser) return;

    const result = await likeComment(commentId, currentUser.id);
    if (result.success) {
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.likedBy.includes(currentUser.id)
                        ? comment.likes - 1
                        : comment.likes + 1,
                      likedBy: comment.likedBy.includes(currentUser.id)
                        ? comment.likedBy.filter(id => id !== currentUser.id)
                        : [...comment.likedBy, currentUser.id]
                    }
                  : comment
              )
            }
          : post
      ));
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleShare = async (postId: string, platform: string) => {
    if (!currentUser) {
      return;
    }

    const result = await shareVideo(postId, currentUser.id, platform);
    if (result.success) {
      // Could show a toast here
    }
    setShareOptionsPostId(null);
  };

  const copyPostLink = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast here
    });
    setShareOptionsPostId(null);
  };

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
        <p className="text-gray-400">Connect with other users, share your thoughts, and engage with the community.</p>
      </div>

      {/* Create Post */}
      {currentUser && (
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 mb-8">
          <div className="flex gap-4">
            <img
              src={currentUser.avatar || "https://picsum.photos/seed/me/100/100"}
              className="w-12 h-12 rounded-full"
              alt={currentUser.username}
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-black/20 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:border-white focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className={`px-6 py-2 rounded-full font-bold transition-colors ${
                    newPostContent.trim()
                      ? `${accentBg} text-white hover:opacity-90`
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? posts.map(post => (
          <div key={post.id} className="bg-dark-card p-6 rounded-xl border border-gray-800">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-4">
              <img
                src={post.avatar}
                className="w-12 h-12 rounded-full"
                alt={post.username}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{post.username}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{post.time}</span>
                </div>
                <p className="text-gray-300">{post.content}</p>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/10 transition-colors ${
                  currentUser && post.likedBy.includes(currentUser.id) ? accentColor : 'text-gray-400'
                }`}
              >
                <i className={`fa-${currentUser && post.likedBy.includes(currentUser.id) ? 'solid' : 'regular'} fa-heart`}></i>
                <span className="text-sm">{post.likes}</span>
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <i className="fa-regular fa-comment"></i>
                <span className="text-sm">{post.comments.length}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShareOptionsPostId(shareOptionsPostId === post.id ? null : post.id)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-share"></i>
                </button>
                {shareOptionsPostId === post.id && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-800 rounded-xl p-2 w-48 shadow-xl animate-in fade-in slide-in-from-bottom-2 z-50">
                    <div className="space-y-1">
                      <button onClick={() => copyPostLink(post.id)} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex items-center gap-2">
                        <i className="fa-solid fa-link text-xs"></i> Copy Link
                      </button>
                      <button onClick={() => handleShare(post.id, 'twitter')} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex items-center gap-2">
                        <i className="fa-brands fa-twitter text-xs"></i> Share on Twitter
                      </button>
                      <button onClick={() => handleShare(post.id, 'facebook')} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex items-center gap-2">
                        <i className="fa-brands fa-facebook text-xs"></i> Share on Facebook
                      </button>
                      <button onClick={() => handleShare(post.id, 'reddit')} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white flex items-center gap-2">
                        <i className="fa-brands fa-reddit text-xs"></i> Share on Reddit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post.id) && (
              <div className="mt-6 pt-4 border-t border-gray-800">
                {/* Add Comment */}
                {currentUser && (
                  <div className="flex gap-3 mb-4">
                    <img
                      src={currentUser.avatar || "https://picsum.photos/seed/me/50/50"}
                      className="w-8 h-8 rounded-full"
                      alt={currentUser.username}
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-black/20 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.avatar}
                        className="w-8 h-8 rounded-full"
                        alt={comment.username}
                      />
                      <div className="flex-1">
                        <div className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{comment.username}</span>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-gray-300">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 ml-3">
                          <button
                            onClick={() => handleLikeComment(comment.id, post.id)}
                            className={`text-xs hover:text-white transition-colors ${
                              currentUser && comment.likedBy.includes(currentUser.id) ? accentColor : 'text-gray-500'
                            }`}
                          >
                            <i className={`fa-${currentUser && comment.likedBy.includes(currentUser.id) ? 'solid' : 'regular'} fa-heart mr-1`}></i>
                            {comment.likes}
                          </button>
                          <button className="text-xs text-gray-500 hover:text-white transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )) : (
          <EmptyView
            icon="fa-users"
            title="No Posts Yet"
            description="Be the first to share something with the community!"
            actionLabel="Create Post"
            onAction={() => currentUser && document.querySelector('textarea')?.focus()}
            isUltra={isUltra}
          />
        )}
      </div>
    </div>
  );
};

export default Community;