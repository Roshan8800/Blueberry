
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
  duration: string;
  views: string;
  author: string;
  category: string;
  embedUrl: string; // In a real app, this would be the HLS stream or Iframe source
  description: string;
  rating: number;
  tags: string[];
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  plan?: UserPlan;
  avatar?: string;
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
  videoCount: number;
  thumbnail: string;
}

export interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
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
  SHORTS = 'SHORTS',
  LIVE = 'LIVE',
  DOWNLOADS = 'DOWNLOADS',
  PLAYLIST_DETAIL = 'PLAYLIST_DETAIL',
  COMMUNITY = 'COMMUNITY',
  HELP = 'HELP',
  UPLOAD = 'UPLOAD',
  PRICING = 'PRICING',
  // Ultra Exclusive
  ANALYTICS = 'ANALYTICS',
  STUDIO = 'STUDIO',
  VIP_SUPPORT = 'VIP_SUPPORT'
}
