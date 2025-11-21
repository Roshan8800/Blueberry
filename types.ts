
export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export type UserPlan = 'free' | 'premium' | 'blueberry';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string | number; // Can be "MM:SS" or milliseconds
  views: string;
  author: string;
  performers?: string[]; // List of performers/pornstars
  category: string;
  embedUrl: string; // HLS stream or Iframe source
  description: string;
  rating: number; // 0-100
  likes?: number; // Count
  dislikes?: number; // Count
  tags: string[];
  isPremium?: boolean; // Requires premium subscription to access
  scheduledRelease?: Date; // For content scheduling
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  plan?: UserPlan;
  avatar?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  securityQuestions?: { question: string; answer: string }[];
  phoneNumber?: string;
  lastLogin?: Date;
  accountCreated?: Date;
  onboardingCompleted?: boolean;
  // Social fields
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  // Monetization fields
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
  subscriptionEndDate?: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Model {
  id: string;
  name: string;
  thumbnail: string;
  videoCount: number;
  rank: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  thumbnail: string;
  videos: Video[];
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  likedBy: string[]; // user IDs who liked
  comments: CommunityComment[];
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  replies: CommunityComment[];
  parentId?: string; // for replies
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFollow {
  id?: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  time: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'message';
  fromUserId: string;
  fromUsername: string;
  postId?: string;
  commentId?: string;
  messageId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'one_time' | 'tip' | 'payout';
  stripePaymentIntentId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: UserPlan;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tip {
  id: string;
  fromUserId: string;
  toUserId: string; // Creator
  videoId?: string;
  amount: number;
  message?: string;
  stripePaymentIntentId: string;
  createdAt: Date;
}

export interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isModerator?: boolean;
  isStreamer?: boolean;
}

export interface LivePoll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  createdAt: Date;
  endsAt: Date;
  isActive: boolean;
}

export interface LiveReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface LiveStream {
  id: string;
  title: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar: string;
  thumbnail: string;
  streamUrl: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: Date;
  chatMessages: LiveChatMessage[];
  activePolls: LivePoll[];
  reactions: LiveReaction[];
  isRecording?: boolean;
}


export enum AppView {
  LANDING = 'LANDING',
  HOME = 'HOME',
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  SEARCH = 'SEARCH',
  PREMIUM = 'PREMIUM',
  FAVORITES = 'FAVORITES',
  HISTORY = 'HISTORY',
  MODELS = 'MODELS',
  MODEL_DETAIL = 'MODEL_DETAIL',
  CATEGORY = 'CATEGORY',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  PARENTAL = 'PARENTAL',
  EXEMPTION = 'EXEMPTION',
  DMCA = 'DMCA',
  // New Screens
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  SHORTS = 'SHORTS',
  LIVE = 'LIVE',
  DOWNLOADS = 'DOWNLOADS',
  PLAYLIST_DETAIL = 'PLAYLIST_DETAIL',
  COMMUNITY = 'COMMUNITY',
  MESSAGES = 'MESSAGES',
  UPLOAD = 'UPLOAD',
  HELP = 'HELP',
  PRICING = 'PRICING',
  // Ultra Exclusive
  ANALYTICS = 'ANALYTICS',
  STUDIO = 'STUDIO',
  VIP_SUPPORT = 'VIP_SUPPORT',
  // Monetization
  BILLING = 'BILLING'
}
