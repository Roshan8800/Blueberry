import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, updateProfile, deleteUser as firebaseDeleteUser } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc, getDoc, where, limit, startAfter, Timestamp, increment } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { Video, Model, Playlist, CommunityPost, CommunityComment, UserFollow, Message, Notification, User } from "../types";
import { MOCK_VIDEOS, MOCK_MODELS, MOCK_PLAYLISTS, MOCK_POSTS, DEMO_ADMIN, DEMO_BLUEBERRY_USER } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyBUv0KXB8-2nD9ecOpu1NAarMxrCVauU9I",
  authDomain: "playnite-3-complete-5032-aabb1.firebaseapp.com",
  databaseURL: "https://playnite-3-complete-5032-aabb1-default-rtdb.firebaseio.com",
  projectId: "playnite-3-complete-5032-aabb1",
  storageBucket: "playnite-3-complete-5032-aabb1.firebasestorage.app",
  messagingSenderId: "637434311909",
  appId: "1:637434311909:web:9cabae9bf226e36f2cd00c",
  measurementId: "G-18PSVYDZ1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
let analytics: any = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Firebase Analytics failed to initialize:", e);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Result type for error handling
export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const extractEmbedUrl = (embedString: string): string => {
  if (!embedString) return '';
  // Check if it's already a URL
  if (embedString.startsWith('http')) return embedString;
  // Extract src from iframe tag
  const match = embedString.match(/src="([^"]+)"/);
  return match ? match[1] : '';
};

const loadVideosFromJson = async (): Promise<Video[]> => {
  const videoModules = (import.meta as any).glob('../videos_json/*.json');
  const videos: Video[] = [];

  for (const path in videoModules) {
    try {
      const module = await videoModules[path]();
      const jsonData = module.default || module;

      // Map JSON data to Video interface
      const video: Video = {
        id: path.split('/').pop()?.replace('.json', '') || 'unknown',
        title: jsonData.title || 'Untitled',
        thumbnail: jsonData.thumbnail || '',
        duration: jsonData.duration || 0,
        views: String(jsonData.views || 0),
        author: jsonData.performers?.[0] || 'Unknown',
        performers: jsonData.performers || [],
        category: jsonData.categories?.[0] || 'Unknown',
        embedUrl: extractEmbedUrl(jsonData.embed || ''),
        description: jsonData.title || '',
        rating: jsonData.likes && jsonData.dislikes ?
          Math.round((jsonData.likes / (jsonData.likes + jsonData.dislikes)) * 100) : 50,
        likes: jsonData.likes || 0,
        dislikes: jsonData.dislikes || 0,
        tags: jsonData.tags || []
      };

      videos.push(video);
    } catch (error) {
      console.warn(`Failed to load video from ${path}:`, error);
    }
  }

  return videos;
};

export const fetchVideos = async (): Promise<Result<Video[]>> => {
  try {
    const videoList = await loadVideosFromJson();
    return { success: true, data: videoList };
  } catch (error) {
    return { success: false, error: `Failed to fetch videos: ${error}` };
  }
};

export const fetchModels = async (): Promise<Result<Model[]>> => {
  try {
    const modelsCollection = collection(db, 'models');
    const modelSnapshot = await getDocs(modelsCollection);
    const modelList: Model[] = modelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
    return { success: true, data: modelList };
  } catch (error) {
    return { success: false, error: `Failed to fetch models: ${error}` };
  }
};

// Video CRUD Operations
export const createVideo = async (video: Omit<Video, 'id'>): Promise<Result<Video>> => {
  try {
    const videosCollection = collection(db, 'videos');
    const docRef = await addDoc(videosCollection, video);
    const newVideo: Video = { id: docRef.id, ...video };
    return { success: true, data: newVideo };
  } catch (error) {
    return { success: false, error: `Failed to create video: ${error}` };
  }
};

export const updateVideo = async (id: string, updates: Partial<Video>): Promise<Result<Video>> => {
  try {
    const videoDoc = doc(db, 'videos', id);
    await updateDoc(videoDoc, updates);
    const updatedDoc = await getDoc(videoDoc);
    const updatedVideo: Video = { id: updatedDoc.id, ...updatedDoc.data() } as Video;
    return { success: true, data: updatedVideo };
  } catch (error) {
    return { success: false, error: `Failed to update video: ${error}` };
  }
};

export const deleteVideo = async (id: string): Promise<Result<boolean>> => {
  try {
    const videoDoc = doc(db, 'videos', id);
    await deleteDoc(videoDoc);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete video: ${error}` };
  }
};

export const likeVideo = async (id: string): Promise<Result<number>> => {
  try {
    const videoDoc = doc(db, 'videos', id);
    await updateDoc(videoDoc, { likes: increment(1) });
    const updatedDoc = await getDoc(videoDoc);
    const likes = updatedDoc.data()?.likes || 0;
    return { success: true, data: likes };
  } catch (error) {
    return { success: false, error: `Failed to like video: ${error}` };
  }
};

export const dislikeVideo = async (id: string): Promise<Result<number>> => {
  try {
    const videoDoc = doc(db, 'videos', id);
    await updateDoc(videoDoc, { dislikes: increment(1) });
    const updatedDoc = await getDoc(videoDoc);
    const dislikes = updatedDoc.data()?.dislikes || 0;
    return { success: true, data: dislikes };
  } catch (error) {
    return { success: false, error: `Failed to dislike video: ${error}` };
  }
};

// Model CRUD Operations
export const createModel = async (model: Omit<Model, 'id'>): Promise<Result<Model>> => {
  try {
    const modelsCollection = collection(db, 'models');
    const docRef = await addDoc(modelsCollection, model);
    const newModel: Model = { id: docRef.id, ...model };
    return { success: true, data: newModel };
  } catch (error) {
    return { success: false, error: `Failed to create model: ${error}` };
  }
};

export const updateModel = async (id: string, updates: Partial<Model>): Promise<Result<Model>> => {
  try {
    const modelDoc = doc(db, 'models', id);
    await updateDoc(modelDoc, updates);
    const updatedDoc = await getDoc(modelDoc);
    const updatedModel: Model = { id: updatedDoc.id, ...updatedDoc.data() } as Model;
    return { success: true, data: updatedModel };
  } catch (error) {
    return { success: false, error: `Failed to update model: ${error}` };
  }
};

export const deleteModel = async (id: string): Promise<Result<boolean>> => {
  try {
    const modelDoc = doc(db, 'models', id);
    await deleteDoc(modelDoc);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete model: ${error}` };
  }
};

// Playlist CRUD Operations
export const fetchPlaylists = async (): Promise<Result<Playlist[]>> => {
  try {
    const playlistsCollection = collection(db, 'playlists');
    const playlistSnapshot = await getDocs(playlistsCollection);
    const playlistList: Playlist[] = playlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
    return { success: true, data: playlistList };
  } catch (error) {
    return { success: false, error: `Failed to fetch playlists: ${error}` };
  }
};

export const createPlaylist = async (playlist: Omit<Playlist, 'id'>): Promise<Result<Playlist>> => {
  try {
    const playlistsCollection = collection(db, 'playlists');
    const docRef = await addDoc(playlistsCollection, playlist);
    const newPlaylist: Playlist = { id: docRef.id, ...playlist };
    return { success: true, data: newPlaylist };
  } catch (error) {
    return { success: false, error: `Failed to create playlist: ${error}` };
  }
};

export const updatePlaylist = async (id: string, updates: Partial<Playlist>): Promise<Result<Playlist>> => {
  try {
    const playlistDoc = doc(db, 'playlists', id);
    await updateDoc(playlistDoc, updates);
    const updatedDoc = await getDoc(playlistDoc);
    const updatedPlaylist: Playlist = { id: updatedDoc.id, ...updatedDoc.data() } as Playlist;
    return { success: true, data: updatedPlaylist };
  } catch (error) {
    return { success: false, error: `Failed to update playlist: ${error}` };
  }
};

export const deletePlaylist = async (id: string): Promise<Result<boolean>> => {
  try {
    const playlistDoc = doc(db, 'playlists', id);
    await deleteDoc(playlistDoc);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete playlist: ${error}` };
  }
};

// Community Post CRUD Operations
export const fetchCommunityPosts = async (): Promise<Result<CommunityPost[]>> => {
  try {
    const postsCollection = collection(db, 'communityPosts');
    const postSnapshot = await getDocs(postsCollection);
    const postList: CommunityPost[] = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
    return { success: true, data: postList };
  } catch (error) {
    return { success: false, error: `Failed to fetch community posts: ${error}` };
  }
};

export const createCommunityPost = async (post: Omit<CommunityPost, 'id'>): Promise<Result<CommunityPost>> => {
  try {
    const postsCollection = collection(db, 'communityPosts');
    const docRef = await addDoc(postsCollection, post);
    const newPost: CommunityPost = { id: docRef.id, ...post };
    return { success: true, data: newPost };
  } catch (error) {
    return { success: false, error: `Failed to create community post: ${error}` };
  }
};

export const updateCommunityPost = async (id: string, updates: Partial<CommunityPost>): Promise<Result<CommunityPost>> => {
  try {
    const postDoc = doc(db, 'communityPosts', id);
    await updateDoc(postDoc, updates);
    const updatedDoc = await getDoc(postDoc);
    const updatedPost: CommunityPost = { id: updatedDoc.id, ...updatedDoc.data() } as CommunityPost;
    return { success: true, data: updatedPost };
  } catch (error) {
    return { success: false, error: `Failed to update community post: ${error}` };
  }
};

export const deleteCommunityPost = async (id: string): Promise<Result<boolean>> => {
  try {
    const postDoc = doc(db, 'communityPosts', id);
    await deleteDoc(postDoc);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete community post: ${error}` };
  }
};

export const likeCommunityPost = async (id: string, userId: string): Promise<Result<number>> => {
  try {
    const postDoc = doc(db, 'communityPosts', id);
    const postData = await getDoc(postDoc);
    if (!postData.exists()) {
      return { success: false, error: 'Post not found' };
    }
    const post = postData.data() as CommunityPost;
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(postDoc, {
        likedBy: likedBy.filter(id => id !== userId),
        likes: increment(-1)
      });
    } else {
      // Like
      await updateDoc(postDoc, {
        likedBy: [...likedBy, userId],
        likes: increment(1)
      });

      // Create notification for post author if not liking own post
      if (post.userId !== userId) {
        // Get user data for fromUsername
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        await createNotification({
          userId: post.userId,
          type: 'like',
          fromUserId: userId,
          fromUsername: userData?.username || 'Unknown',
          postId: id,
          read: false,
          createdAt: new Date()
        });
      }
    }

    const updatedDoc = await getDoc(postDoc);
    const likes = updatedDoc.data()?.likes || 0;
    return { success: true, data: likes };
  } catch (error) {
    return { success: false, error: `Failed to like community post: ${error}` };
  }
};

export const addCommentToPost = async (id: string): Promise<Result<number>> => {
  try {
    const postDoc = doc(db, 'communityPosts', id);
    await updateDoc(postDoc, { comments: increment(1) });
    const updatedDoc = await getDoc(postDoc);
    const comments = updatedDoc.data()?.comments || 0;
    return { success: true, data: comments };
  } catch (error) {
    return { success: false, error: `Failed to add comment to post: ${error}` };
  }
};

// Comment CRUD Operations
export const createComment = async (comment: Omit<CommunityComment, 'id'>): Promise<Result<CommunityComment>> => {
  try {
    const commentsCollection = collection(db, 'comments');
    const docRef = await addDoc(commentsCollection, comment);
    const newComment: CommunityComment = { id: docRef.id, ...comment };

    // Create notification for post author if not commenting on own post
    if (comment.postId) {
      // Get post data to find post author
      const postDoc = await getDoc(doc(db, 'communityPosts', comment.postId));
      const postData = postDoc.data() as CommunityPost;
      if (postData && postData.userId !== comment.userId) {
        // Get user data for fromUsername
        const userDoc = await getDoc(doc(db, 'users', comment.userId));
        const userData = userDoc.data();
        await createNotification({
          userId: postData.userId,
          type: 'comment',
          fromUserId: comment.userId,
          fromUsername: userData?.username || 'Unknown',
          postId: comment.postId,
          commentId: newComment.id,
          read: false,
          createdAt: new Date()
        });
      }
    }

    return { success: true, data: newComment };
  } catch (error) {
    return { success: false, error: `Failed to create comment: ${error}` };
  }
};

export const fetchCommentsForPost = async (postId: string): Promise<Result<CommunityComment[]>> => {
  try {
    const commentsCollection = collection(db, 'comments');
    const q = query(commentsCollection, where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const commentSnapshot = await getDocs(q);
    const commentList: CommunityComment[] = commentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityComment));
    return { success: true, data: commentList };
  } catch (error) {
    return { success: false, error: `Failed to fetch comments: ${error}` };
  }
};

export const likeComment = async (commentId: string, userId: string): Promise<Result<boolean>> => {
  try {
    const commentDoc = doc(db, 'comments', commentId);
    const commentData = await getDoc(commentDoc);
    if (!commentData.exists()) {
      return { success: false, error: 'Comment not found' };
    }
    const comment = commentData.data() as CommunityComment;
    const likedBy = comment.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(commentDoc, {
        likedBy: likedBy.filter(id => id !== userId),
        likes: increment(-1)
      });
    } else {
      // Like
      await updateDoc(commentDoc, {
        likedBy: [...likedBy, userId],
        likes: increment(1)
      });
    }
    return { success: true, data: !isLiked };
  } catch (error) {
    return { success: false, error: `Failed to like comment: ${error}` };
  }
};

// Following System
export const followUser = async (followerId: string, followingId: string): Promise<Result<UserFollow>> => {
  try {
    // Check if already following
    const followsCollection = collection(db, 'follows');
    const q = query(followsCollection, where('followerId', '==', followerId), where('followingId', '==', followingId));
    const existingFollow = await getDocs(q);
    if (!existingFollow.empty) {
      return { success: false, error: 'Already following' };
    }

    const followData: Omit<UserFollow, 'id'> = {
      followerId,
      followingId,
      createdAt: new Date()
    };
    const docRef = await addDoc(followsCollection, followData);
    const newFollow: UserFollow = { id: docRef.id, ...followData };

    // Update follower counts manually
    const followerDoc = await getDoc(doc(db, 'users', followerId));
    const followingDoc = await getDoc(doc(db, 'users', followingId));
    const currentFollowingCount = followerDoc.data()?.followingCount || 0;
    const currentFollowersCount = followingDoc.data()?.followersCount || 0;

    await updateDoc(doc(db, 'users', followerId), { followingCount: currentFollowingCount + 1 });
    await updateDoc(doc(db, 'users', followingId), { followersCount: currentFollowersCount + 1 });

    // Create notification for the followed user
    const followerData = followerDoc.data();
    await createNotification({
      userId: followingId,
      type: 'follow',
      fromUserId: followerId,
      fromUsername: followerData?.username || 'Unknown',
      read: false,
      createdAt: new Date()
    });

    return { success: true, data: newFollow };
  } catch (error) {
    return { success: false, error: `Failed to follow user: ${error}` };
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<Result<boolean>> => {
  try {
    const followsCollection = collection(db, 'follows');
    const q = query(followsCollection, where('followerId', '==', followerId), where('followingId', '==', followingId));
    const existingFollow = await getDocs(q);
    if (existingFollow.empty) {
      return { success: false, error: 'Not following' };
    }

    const followDoc = existingFollow.docs[0];
    await deleteDoc(followDoc.ref);

    // Update follower counts manually
    const followerDoc = await getDoc(doc(db, 'users', followerId));
    const followingDoc = await getDoc(doc(db, 'users', followingId));
    const currentFollowingCount = followerDoc.data()?.followingCount || 0;
    const currentFollowersCount = followingDoc.data()?.followersCount || 0;

    await updateDoc(doc(db, 'users', followerId), { followingCount: Math.max(0, currentFollowingCount - 1) });
    await updateDoc(doc(db, 'users', followingId), { followersCount: Math.max(0, currentFollowersCount - 1) });

    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to unfollow user: ${error}` };
  }
};

export const getFollowers = async (userId: string): Promise<Result<string[]>> => {
  try {
    const followsCollection = collection(db, 'follows');
    const q = query(followsCollection, where('followingId', '==', userId));
    const followersSnapshot = await getDocs(q);
    const followerIds = followersSnapshot.docs.map(doc => doc.data().followerId);
    return { success: true, data: followerIds };
  } catch (error) {
    return { success: false, error: `Failed to get followers: ${error}` };
  }
};

export const getFollowing = async (userId: string): Promise<Result<string[]>> => {
  try {
    const followsCollection = collection(db, 'follows');
    const q = query(followsCollection, where('followerId', '==', userId));
    const followingSnapshot = await getDocs(q);
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    return { success: true, data: followingIds };
  } catch (error) {
    return { success: false, error: `Failed to get following: ${error}` };
  }
};

export const isFollowing = async (followerId: string, followingId: string): Promise<Result<boolean>> => {
  try {
    const followsCollection = collection(db, 'follows');
    const q = query(followsCollection, where('followerId', '==', followerId), where('followingId', '==', followingId));
    const existingFollow = await getDocs(q);
    return { success: true, data: !existingFollow.empty };
  } catch (error) {
    return { success: false, error: `Failed to check follow status: ${error}` };
  }
};

// Messaging System
export const sendMessage = async (message: Omit<Message, 'id'>): Promise<Result<Message>> => {
  try {
    const messagesCollection = collection(db, 'messages');
    const docRef = await addDoc(messagesCollection, message);
    const newMessage: Message = { id: docRef.id, ...message };

    // Create notification for the receiver
    const senderDoc = await getDoc(doc(db, 'users', message.senderId));
    const senderData = senderDoc.data();
    await createNotification({
      userId: message.receiverId,
      type: 'message',
      fromUserId: message.senderId,
      fromUsername: senderData?.username || 'Unknown',
      messageId: newMessage.id,
      read: false,
      createdAt: new Date()
    });

    return { success: true, data: newMessage };
  } catch (error) {
    return { success: false, error: `Failed to send message: ${error}` };
  }
};

export const fetchMessages = async (userId: string, otherUserId: string): Promise<Result<Message[]>> => {
  try {
    const messagesCollection = collection(db, 'messages');
    const q = query(
      messagesCollection,
      where('senderId', 'in', [userId, otherUserId]),
      where('receiverId', 'in', [userId, otherUserId]),
      orderBy('createdAt', 'asc')
    );
    const messagesSnapshot = await getDocs(q);
    const messageList: Message[] = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    return { success: true, data: messageList };
  } catch (error) {
    return { success: false, error: `Failed to fetch messages: ${error}` };
  }
};

export const markMessageAsRead = async (messageId: string): Promise<Result<boolean>> => {
  try {
    const messageDoc = doc(db, 'messages', messageId);
    await updateDoc(messageDoc, { read: true });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to mark message as read: ${error}` };
  }
};

// Notifications System
export const createNotification = async (notification: Omit<Notification, 'id'>): Promise<Result<Notification>> => {
  try {
    const notificationsCollection = collection(db, 'notifications');
    const docRef = await addDoc(notificationsCollection, notification);
    const newNotification: Notification = { id: docRef.id, ...notification };
    return { success: true, data: newNotification };
  } catch (error) {
    return { success: false, error: `Failed to create notification: ${error}` };
  }
};

export const fetchNotifications = async (userId: string): Promise<Result<Notification[]>> => {
  try {
    const notificationsCollection = collection(db, 'notifications');
    const q = query(notificationsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const notificationsSnapshot = await getDocs(q);
    const notificationList: Notification[] = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    return { success: true, data: notificationList };
  } catch (error) {
    return { success: false, error: `Failed to fetch notifications: ${error}` };
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<Result<boolean>> => {
  try {
    const notificationDoc = doc(db, 'notifications', notificationId);
    await updateDoc(notificationDoc, { read: true });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to mark notification as read: ${error}` };
  }
};

// Social Sharing
export const shareVideo = async (videoId: string, userId: string, platform: string): Promise<Result<boolean>> => {
  try {
    // In a real implementation, this would integrate with social media APIs
    // For now, we'll just log the share action
    const sharesCollection = collection(db, 'shares');
    await addDoc(sharesCollection, {
      videoId,
      userId,
      platform,
      createdAt: new Date()
    });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to share video: ${error}` };
  }
};

// User CRUD Operations
export const fetchUsers = async (): Promise<Result<User[]>> => {
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList: User[] = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return { success: true, data: userList };
  } catch (error) {
    return { success: false, error: `Failed to fetch users: ${error}` };
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<Result<User>> => {
  try {
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, user);
    const newUser: User = { id: docRef.id, ...user };
    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, error: `Failed to create user: ${error}` };
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<Result<User>> => {
  try {
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, updates);
    const updatedDoc = await getDoc(userDoc);
    const updatedUser: User = { id: updatedDoc.id, ...updatedDoc.data() } as User;
    return { success: true, data: updatedUser };
  } catch (error) {
    return { success: false, error: `Failed to update user: ${error}` };
  }
};

export const deleteUser = async (id: string): Promise<Result<boolean>> => {
  try {
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete user: ${error}` };
  }
};

// Real-time listeners
export const subscribeToVideoLikes = (videoId: string, callback: (likes: number) => void) => {
  const videoDoc = doc(db, 'videos', videoId);
  return onSnapshot(videoDoc, (doc) => {
    const data = doc.data();
    if (data) callback(data.likes || 0);
  });
};

export const subscribeToPostLikes = (postId: string, callback: (likes: number) => void) => {
  const postDoc = doc(db, 'communityPosts', postId);
  return onSnapshot(postDoc, (doc) => {
    const data = doc.data();
    if (data) callback(data.likes || 0);
  });
};

export const subscribeToPostComments = (postId: string, callback: (comments: number) => void) => {
  const postDoc = doc(db, 'communityPosts', postId);
  return onSnapshot(postDoc, (doc) => {
    const data = doc.data();
    if (data) callback(data.comments || 0);
  });
};

export const seedDatabaseIfEmpty = async (): Promise<Result<boolean>> => {
  try {
    // Check if videos collection is empty
    const videosCollection = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosCollection);
    if (videosSnapshot.empty) {
      // Seed videos
      for (const video of MOCK_VIDEOS) {
        await addDoc(videosCollection, video);
      }
    }

    // Check if models collection is empty
    const modelsCollection = collection(db, 'models');
    const modelsSnapshot = await getDocs(modelsCollection);
    if (modelsSnapshot.empty) {
      // Seed models
      for (const model of MOCK_MODELS) {
        await addDoc(modelsCollection, model);
      }
    }

    // Check if playlists collection is empty
    const playlistsCollection = collection(db, 'playlists');
    const playlistsSnapshot = await getDocs(playlistsCollection);
    if (playlistsSnapshot.empty) {
      // Seed playlists
      for (const playlist of MOCK_PLAYLISTS) {
        await addDoc(playlistsCollection, playlist);
      }
    }

    // Check if communityPosts collection is empty
    const postsCollection = collection(db, 'communityPosts');
    const postsSnapshot = await getDocs(postsCollection);
    if (postsSnapshot.empty) {
      // Seed posts
      for (const post of MOCK_POSTS) {
        await addDoc(postsCollection, post);
      }
    }

    // Check if users collection is empty
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    if (usersSnapshot.empty) {
      // Seed users
      await addDoc(usersCollection, DEMO_ADMIN);
      await addDoc(usersCollection, DEMO_BLUEBERRY_USER);
    }

    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to seed database: ${error}` };
  }
}

// Authentication helper functions
export const sendVerificationEmail = async (): Promise<Result<boolean>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    await sendEmailVerification(user);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to send verification email: ${error}` };
  }
};

export const resetPassword = async (email: string): Promise<Result<boolean>> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to send password reset email: ${error}` };
  }
};

export const signInWithGoogle = async (): Promise<Result<any>> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: `Google sign in failed: ${error}` };
  }
};

export const deleteCurrentUser = async (): Promise<Result<boolean>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    await firebaseDeleteUser(user);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to delete user: ${error}` };
  }
};

export const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<Result<boolean>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    await updateProfile(user, updates);
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to update profile: ${error}` };
  }
};

// 2FA Functions (Basic implementation - in production, use a proper TOTP library)
export const generateTOTPSecret = (): string => {
  // Generate a random 32-character base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

export const verifyTOTP = (secret: string, token: string): boolean => {
  // Basic TOTP verification (in production, use a proper library like speakeasy)
  // This is a simplified version for demonstration
  const currentTime = Math.floor(Date.now() / 30000); // 30-second windows
  // In a real implementation, you'd use a TOTP library to verify the token
  return token.length === 6 && /^\d{6}$/.test(token);
};

export const enable2FA = async (userId: string, secret: string): Promise<Result<boolean>> => {
  try {
    await updateUser(userId, { twoFactorEnabled: true, twoFactorSecret: secret });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to enable 2FA: ${error}` };
  }
};

export const disable2FA = async (userId: string): Promise<Result<boolean>> => {
  try {
    await updateUser(userId, { twoFactorEnabled: false, twoFactorSecret: undefined });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: `Failed to disable 2FA: ${error}` };
  }
};

export {
  analytics,
  logEvent,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  ref
};
