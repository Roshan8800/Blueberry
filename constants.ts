

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

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Cinematic Nightlife Experience',
    thumbnail: 'https://picsum.photos/seed/night1/600/400',
    duration: '12:45',
    views: '1.2M',
    author: 'PlayNite Originals',
    category: 'Trending',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ', 
    description: 'An exclusive look into the premium nightlife experience.',
    rating: 98,
    tags: ['night', 'party', 'exclusive']
  },
  {
    id: 'v2',
    title: 'Exclusive Model Showcase',
    thumbnail: 'https://picsum.photos/seed/model1/600/400',
    duration: '08:30',
    views: '850K',
    author: 'Studio X',
    category: 'Premium',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'High fashion and glamour showcase featuring top talent.',
    rating: 95,
    tags: ['fashion', 'glamour', 'model']
  },
  {
    id: 'v3',
    title: 'Virtual Reality Lounge',
    thumbnail: 'https://picsum.photos/seed/vr1/600/400',
    duration: '25:00',
    views: '2.1M',
    author: 'VR Tech',
    category: 'VR Experience',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Immersive 180-degree experience.',
    rating: 99,
    tags: ['vr', 'immersive', '3d']
  },
  {
    id: 'v4',
    title: 'Private Dance Collection',
    thumbnail: 'https://picsum.photos/seed/dance/600/400',
    duration: '15:20',
    views: '3.4M',
    author: 'DanceElite',
    category: 'Top Rated',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Contemporary artistic dance performance.',
    rating: 92,
    tags: ['dance', 'art', 'performance']
  },
  {
    id: 'v5',
    title: 'Behind The Scenes: Vol 4',
    thumbnail: 'https://picsum.photos/seed/bts/600/400',
    duration: '45:10',
    views: '500K',
    author: 'ProductionHouse',
    category: 'New Arrivals',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Uncensored access to the making of our top films.',
    rating: 88,
    tags: ['bts', 'making of', 'raw']
  },
  {
    id: 'v6',
    title: 'Late Night Vibes',
    thumbnail: 'https://picsum.photos/seed/vibes/600/400',
    duration: '10:00',
    views: '1.1M',
    author: 'VibeCheck',
    category: 'Trending',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Relaxing and sensual atmosphere.',
    rating: 94,
    tags: ['chill', 'vibe', 'music']
  },
  {
    id: 'v7',
    title: 'Live: Bedroom Cam 01',
    thumbnail: 'https://picsum.photos/seed/cam1/600/400',
    duration: 'LIVE',
    views: '15k',
    author: 'CamModel_xx',
    category: 'Live Cams',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Live streaming now.',
    rating: 96,
    tags: ['live', 'webcam', 'chat']
  },
  {
    id: 'v8',
    title: 'Live: Private Show',
    thumbnail: 'https://picsum.photos/seed/cam2/600/400',
    duration: 'LIVE',
    views: '22k',
    author: 'SweetCheeks',
    category: 'Live Cams',
    embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    description: 'Join the private room now.',
    rating: 98,
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
  { id: 'p1', name: 'Late Night Chill', videoCount: 12, thumbnail: 'https://picsum.photos/seed/vibes/300/300' },
  { id: 'p2', name: 'Workout Motivation', videoCount: 8, thumbnail: 'https://picsum.photos/seed/gym/300/300' },
  { id: 'p3', name: 'Favorites 2024', videoCount: 45, thumbnail: 'https://picsum.photos/seed/favs/300/300' },
];

export const MOCK_POSTS: CommunityPost[] = [
  { id: 'c1', user: 'Sarah_99', avatar: 'https://picsum.photos/seed/u2/100/100', content: 'Just watched the new Velvet Room episode. Absolutely stunning production!', likes: 245, comments: 42, time: '2h ago' },
  { id: 'c2', user: 'MikeR', avatar: 'https://picsum.photos/seed/u3/100/100', content: 'Does anyone have recommendations for VR headsets that work best with this site?', likes: 89, comments: 15, time: '5h ago' },
];
