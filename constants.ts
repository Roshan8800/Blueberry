

import { Category, User, UserRole, Video, Model, Playlist, CommunityPost } from "./types";

export const APP_NAME = "PlayNite";
export const ULTRA_NAME = "Blueberry";
export const PACKAGE_ID = "com.roshan.playnite";
export const DEVELOPERS = ["Roshan Sahu", "Papun Sahu", "Rohan Sahu"];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Trending', icon: 'fa-fire' },
  { id: '2', name: 'New Arrivals', icon: 'fa-clock' },
  { id: '3', name: 'Premium', icon: 'fa-crown' },
  { id: '4', name: 'Live Cams', icon: 'fa-video' }, 
  { id: '5', name: 'VR Experience', icon: 'fa-vr-cardboard' },
  { id: '6', name: 'Top Rated', icon: 'fa-star' },
];

export const MOCK_MODELS: Model[] = [
  { id: 'm1', name: 'Eva Elfie', thumbnail: 'https://picsum.photos/seed/eva/200/200', videoCount: 142, rank: 1 },
  { id: 'm2', name: 'Angela White', thumbnail: 'https://picsum.photos/seed/angela/200/200', videoCount: 215, rank: 2 },
  { id: 'm3', name: 'Lana Rhoades', thumbnail: 'https://picsum.photos/seed/lana/200/200', videoCount: 89, rank: 3 },
  { id: 'm4', name: 'Abella Danger', thumbnail: 'https://picsum.photos/seed/abella/200/200', videoCount: 180, rank: 4 },
  { id: 'm5', name: 'Mia Malkova', thumbnail: 'https://picsum.photos/seed/mia/200/200', videoCount: 112, rank: 5 },
  { id: 'm6', name: 'Riley Reid', thumbnail: 'https://picsum.photos/seed/riley/200/200', videoCount: 250, rank: 6 },
  { id: 'm7', name: 'Sweet Sweet', thumbnail: 'https://picsum.photos/seed/sweet/200/200', videoCount: 45, rank: 7 },
  { id: 'm8', name: 'Violet Myers', thumbnail: 'https://picsum.photos/seed/violet/200/200', videoCount: 98, rank: 8 },
];

// Duration is in milliseconds for "proper" metadata handling, but supports string fallback
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Cinematic Nightlife Experience',
    thumbnail: 'https://picsum.photos/seed/night1/600/400',
    duration: 765000, // 12:45
    views: '1.2M',
    author: 'PlayNite Originals',
    performers: ['Eva Elfie'],
    category: 'Trending',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ', 
    description: 'An exclusive look into the premium nightlife experience.',
    rating: 98,
    likes: 15400,
    dislikes: 230,
    tags: ['night', 'party', 'exclusive']
  },
  {
    id: 'v2',
    title: 'Exclusive Model Showcase',
    thumbnail: 'https://picsum.photos/seed/model1/600/400',
    duration: 510000, // 08:30
    views: '850K',
    author: 'Studio X',
    performers: ['Angela White', 'Abella Danger'],
    category: 'Premium',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'High fashion and glamour showcase featuring top talent.',
    rating: 95,
    likes: 9800,
    dislikes: 150,
    tags: ['fashion', 'glamour', 'model']
  },
  {
    id: 'v3',
    title: 'Virtual Reality Lounge',
    thumbnail: 'https://picsum.photos/seed/vr1/600/400',
    duration: 1500000, // 25:00
    views: '2.1M',
    author: 'VR Tech',
    performers: [],
    category: 'VR Experience',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Immersive 180-degree experience.',
    rating: 99,
    likes: 25000,
    dislikes: 50,
    tags: ['vr', 'immersive', '3d']
  },
  {
    id: 'v4',
    title: 'Private Dance Collection',
    thumbnail: 'https://picsum.photos/seed/dance/600/400',
    duration: 920000, // 15:20
    views: '3.4M',
    author: 'DanceElite',
    performers: ['Mia Malkova'],
    category: 'Top Rated',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Contemporary artistic dance performance.',
    rating: 92,
    likes: 18900,
    dislikes: 400,
    tags: ['dance', 'art', 'performance']
  },
  {
    id: 'v5',
    title: 'Behind The Scenes: Vol 4',
    thumbnail: 'https://picsum.photos/seed/bts/600/400',
    duration: 2710000, // 45:10
    views: '500K',
    author: 'ProductionHouse',
    performers: [],
    category: 'New Arrivals',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Uncensored access to the making of our top films.',
    rating: 88,
    likes: 4500,
    dislikes: 120,
    tags: ['bts', 'making of', 'raw']
  },
  {
    id: 'v6',
    title: 'Late Night Vibes',
    thumbnail: 'https://picsum.photos/seed/vibes/600/400',
    duration: 600000, // 10:00
    views: '1.1M',
    author: 'VibeCheck',
    performers: ['Sweet Sweet'],
    category: 'Trending',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Relaxing and sensual atmosphere.',
    rating: 94,
    likes: 12000,
    dislikes: 80,
    tags: ['chill', 'vibe', 'music']
  },
  {
    id: 'v7',
    title: 'Live: Bedroom Cam 01',
    thumbnail: 'https://picsum.photos/seed/cam1/600/400',
    duration: 'LIVE', // Special case
    views: '15k',
    author: 'CamModel_xx',
    performers: ['CamModel_xx'],
    category: 'Live Cams',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Live streaming now.',
    rating: 96,
    likes: 500,
    dislikes: 10,
    tags: ['live', 'webcam', 'chat']
  },
  {
    id: 'v8',
    title: 'Live: Private Show',
    thumbnail: 'https://picsum.photos/seed/cam2/600/400',
    duration: 'LIVE',
    views: '22k',
    author: 'SweetCheeks',
    performers: ['SweetCheeks'],
    category: 'Live Cams',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Join the private room now.',
    rating: 98,
    likes: 800,
    dislikes: 5,
    tags: ['live', 'premium', 'show']
  }
];

export const DEMO_ADMIN: User = {
  id: 'admin1',
  username: 'Roshan',
  role: UserRole.ADMIN,
  plan: 'premium',
  avatar: 'https://picsum.photos/seed/admin/100/100'
};

export const DEMO_BLUEBERRY_USER: User = {
  id: 'ultra1',
  username: 'AlexUltra',
  role: UserRole.USER,
  plan: 'blueberry',
  avatar: 'https://picsum.photos/seed/ultra/100/100'
};

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Late Night Chill',
    description: 'Relaxing videos for late night viewing',
    videoCount: 6,
    thumbnail: 'https://picsum.photos/seed/vibes/300/300',
    videos: MOCK_VIDEOS.slice(0, 6),
    createdBy: 'You',
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  {
    id: 'p2',
    name: 'Workout Motivation',
    description: 'Energetic videos to pump you up',
    videoCount: 6,
    thumbnail: 'https://picsum.photos/seed/gym/300/300',
    videos: MOCK_VIDEOS.slice(1, 7),
    createdBy: 'You',
    createdAt: new Date('2024-02-01'),
    lastUpdated: new Date()
  },
  {
    id: 'p3',
    name: 'Favorites 2024',
    description: 'My top picks from this year',
    videoCount: 6,
    thumbnail: 'https://picsum.photos/seed/favs/300/300',
    videos: MOCK_VIDEOS.slice(2, 8),
    createdBy: 'You',
    createdAt: new Date('2024-03-01'),
    lastUpdated: new Date()
  },
];

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'c1',
    userId: 'u1',
    username: 'Sarah_99',
    avatar: 'https://picsum.photos/seed/u2/100/100',
    content: 'Just watched the new Velvet Room episode. Absolutely stunning production!',
    likes: 245,
    likedBy: ['u2', 'u3', 'u4'],
    comments: [],
    time: '2h ago',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'c2',
    userId: 'u2',
    username: 'MikeR',
    avatar: 'https://picsum.photos/seed/u3/100/100',
    content: 'Does anyone have recommendations for VR headsets that work best with this site?',
    likes: 89,
    likedBy: ['u1', 'u5'],
    comments: [],
    time: '5h ago',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
];
