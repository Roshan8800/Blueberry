
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import Player from './components/Player';
import AdminPanel from './components/AdminPanel';
import WarningModal from './components/WarningModal';
import ModelCard from './components/ModelCard';
import ModelProfile from './components/ModelProfile';
import StaticPage from './components/StaticPage';
import UserProfile from './components/UserProfile';
import SettingsPage from './components/SettingsPage';
import Toast from './components/Toast';
import ShortsFeed from './components/ShortsFeed';
import AuthPages from './components/AuthPages';
import DownloadsPage from './components/DownloadsPage';
import PlaylistView from './components/PlaylistView';
import LivePage from './components/LivePage';
import LandingPage from './components/LandingPage';
import UltraAnalytics from './components/UltraAnalytics';
import StudioPro from './components/StudioPro';
import VipSupport from './components/VipSupport';
import PricingPage from './components/PricingPage';
import { EmptyView, ErrorView } from './components/StateViews';
import { MOCK_VIDEOS, DEMO_ADMIN, DEVELOPERS, MOCK_MODELS, MOCK_POSTS, DEMO_BLUEBERRY_USER } from './constants';
import { Video, AppView, User, Model, UserRole } from './types';
import { getSmartSearchSuggestions } from './services/geminiService';
import { analytics, logEvent, fetchVideos, seedDatabaseIfEmpty, auth, onAuthStateChanged, fetchModels } from './services/firebase';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  
  // --- Global Navigation History ---
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  // Track the current history index to determine navigation direction
  const historyIndexRef = useRef<number>(0);

  // --- Data State ---
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  
  // Global App State for Interactions
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [watchLaterIds, setWatchLaterIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Categories & Filtering
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Trending');
  
  // Search State
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guestWatchCount, setGuestWatchCount] = useState(0);
  const GUEST_WATCH_LIMIT_DEMO = 5; 

  // Blueberry Plan State
  const isUltra = currentUser?.plan === 'blueberry';

  // Swipe Gesture State
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  // --- Fetch Videos from Firestore ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingVideos(true);
      await seedDatabaseIfEmpty();

      const dbVideos = await fetchVideos();
      const dbModels = await fetchModels();

      if (dbVideos.length > 0) {
        setAllVideos(dbVideos);
      } else {
         // Fallback if fetch failed
         setAllVideos(MOCK_VIDEOS);
      }

      if (dbModels.length > 0) {
        setAllModels(dbModels);
      } else {
        setAllModels(MOCK_MODELS);
      }

      setIsLoadingVideos(false);
    };
    loadData();

    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          username: user.email?.split('@')[0] || 'User',
          role: UserRole.USER,
          plan: 'premium', // Default
          avatar: user.photoURL || undefined
        });
      } else {
        // Don't auto-logout demo users for now if they are mock-logged in
        // But strictly for Firebase auth, we should set null
        // setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Browser History Sync ---
  useEffect(() => {
    // Initialize history state on mount if needed
    if (!window.history.state) {
      window.history.replaceState({ view: AppView.LANDING, index: 0 }, '', window.location.search);
      historyIndexRef.current = 0;
    } else if (typeof window.history.state.index === 'number') {
      historyIndexRef.current = window.history.state.index;
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        const newIndex = event.state.index ?? 0;
        const currentIndex = historyIndexRef.current;

        // Determine direction
        if (newIndex < currentIndex) {
          // Back
          const delta = currentIndex - newIndex;
          setViewHistory(prev => {
            if (prev.length >= delta) return prev.slice(0, -delta);
            return []; // Safety fallback
          });
        } else if (newIndex > currentIndex) {
          // Forward
          setViewHistory(prev => [...prev, currentView]);
        }

        historyIndexRef.current = newIndex;
        setCurrentView(event.state.view);
      } else {
        // If state is null (e.g. initial load), default to Landing
        setCurrentView(AppView.LANDING);
        setViewHistory([]);
        historyIndexRef.current = 0;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // --- Analytics Logging ---
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: currentView,
        firebase_screen_class: 'App'
      });
    }
  }, [currentView]);

  // --- Navigation Handlers ---

  const navigate = (newView: AppView) => {
    if (newView === currentView) return;
    
    // Push current view to history
    setViewHistory(prev => [...prev, currentView]);
    
    // Update state
    setCurrentView(newView);
    
    // Increment index and push to browser history
    const newIndex = historyIndexRef.current + 1;
    historyIndexRef.current = newIndex;
    window.history.pushState({ view: newView, index: newIndex }, '', `?view=${newView}`);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (viewHistory.length === 0) {
        // If no history, default to home or landing depending on auth
        if (currentUser && currentView !== AppView.HOME) navigate(AppView.HOME);
        else if (!currentUser && currentView !== AppView.LANDING) navigate(AppView.LANDING);
        return;
    }

    // Use browser back to ensure synchronization
    window.history.back();
  };

  // Load Persisted Data
  useEffect(() => {
    const savedHistory = localStorage.getItem('playnite_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }

    const savedFavs = localStorage.getItem('playnite_favorites');
    if (savedFavs) {
      try {
         setFavoriteIds(new Set(JSON.parse(savedFavs)));
      } catch(e) {}
    }

    const savedWatchLater = localStorage.getItem('playnite_watch_later');
    if (savedWatchLater) {
      try {
        setWatchLaterIds(new Set(JSON.parse(savedWatchLater)));
      } catch(e) {}
    }
  }, []);

  // Persistence Helpers
  const toggleFavorite = (id: string) => {
    const newSet = new Set(favoriteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      showToast("Removed from Favorites");
    } else {
      newSet.add(id);
      showToast("Added to Favorites");
    }
    setFavoriteIds(newSet);
    localStorage.setItem('playnite_favorites', JSON.stringify(Array.from(newSet)));
  };

  const toggleWatchLater = (id: string) => {
    const newSet = new Set(watchLaterIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      showToast("Removed from Watch Later");
    } else {
      newSet.add(id);
      showToast("Saved to Watch Later");
    }
    setWatchLaterIds(newSet);
    localStorage.setItem('playnite_watch_later', JSON.stringify(Array.from(newSet)));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToSearchHistory = (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    const newHistory = [cleanQuery, ...searchHistory.filter(h => h.toLowerCase() !== cleanQuery.toLowerCase())].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('playnite_search_history', JSON.stringify(newHistory));
  };

  // Auth Handlers
  const handleAdminLogin = () => {
    setCurrentUser(DEMO_ADMIN);
    navigate(AppView.HOME);
    showToast("Logged in as Administrator");
  };

  const handleStandardLogin = () => {
    setCurrentUser({
      id: 'user1',
      username: 'PremiumUser',
      role: UserRole.USER,
      plan: 'premium',
      avatar: 'https://picsum.photos/seed/user1/100/100'
    });
    navigate(AppView.HOME);
    showToast("Welcome back! Premium features unlocked.");
  };

  const handleUltraLogin = () => {
    setCurrentUser(DEMO_BLUEBERRY_USER);
    navigate(AppView.HOME);
    showToast("Welcome to Blueberry Ultra.");
  };

  const handleGuestAccess = () => {
    setCurrentUser({
      id: 'guest',
      username: 'Guest',
      role: UserRole.GUEST,
      plan: 'free',
      avatar: undefined
    });
    setGuestWatchCount(0); 
    navigate(AppView.HOME);
    showToast("Browsing as Guest (Limited Access)");
  };

  // Responsive Sidebar Logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 100;
    const isRightSwipe = distance < -100;

    if (window.innerWidth < 1024) {
      if (isRightSwipe && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
      if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const handleVideoSelect = (video: Video) => {
    const isGuest = !currentUser || currentUser.role === UserRole.GUEST;
    const isPremium = video.category === 'Premium' || video.tags.includes('exclusive');

    if (isGuest) {
      if (isPremium) {
        showToast("🔒 Premium Content - Sign up to watch");
        return;
      }
      
      if (guestWatchCount >= GUEST_WATCH_LIMIT_DEMO) {
        showToast("Free limit reached. Create an account to watch more.");
        navigate(AppView.REGISTER);
        return;
      }

      setGuestWatchCount(prev => prev + 1);
      if (guestWatchCount === GUEST_WATCH_LIMIT_DEMO - 1) {
        showToast("Warning: You have 1 free video remaining.");
      }
    }

    setSelectedVideo(video);
    navigate(AppView.PLAYER);
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    navigate(AppView.MODEL_DETAIL);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      navigate(AppView.HOME);
      return;
    }

    setCurrentSearchQuery(query);
    addToSearchHistory(query);
    
    const lowerQuery = query.toLowerCase();
    const results = allVideos.filter(v => 
      v.title.toLowerCase().includes(lowerQuery) || 
      v.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      v.author.toLowerCase().includes(lowerQuery) ||
      v.category.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(results);
    navigate(AppView.SEARCH);

    try {
      const suggestions = await getSmartSearchSuggestions(query);
      console.log("Gemini Suggestions:", suggestions);
    } catch (e) {
      console.error("Search optimization failed", e);
    }
  };

  const renderVideoList = (videos: Video[]) => {
    const isGuest = !currentUser || currentUser.role === UserRole.GUEST;

    return (
      <>
        {videos.map(video => {
           // Logic for locking videos for guests
           const isPremium = video.category === 'Premium' || video.tags.includes('exclusive');
           const isLocked = isGuest && isPremium;

           return (
              <VideoCard 
                key={video.id} 
                video={video} 
                onClick={handleVideoSelect}
                isFavorite={favoriteIds.has(video.id)}
                isWatchLater={watchLaterIds.has(video.id)}
                onToggleFavorite={toggleFavorite}
                onToggleWatchLater={toggleWatchLater}
                onShowToast={showToast}
                isLocked={isLocked}
                isUltra={isUltra}
              />
           );
        })}
      </>
    );
  };

  // Age Gate
  if (!isAgeVerified) {
    return <WarningModal onEnter={() => setIsAgeVerified(true)} />;
  }

  // --- Render Helpers ---

  const renderContent = () => {
    const isGuest = !currentUser || currentUser.role === UserRole.GUEST;

    if (isLoadingVideos && [AppView.HOME, AppView.CATEGORY, AppView.SEARCH].includes(currentView)) {
      return (
         <div className="flex items-center justify-center h-[50vh]">
             <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
    }

    switch (currentView) {
      case AppView.LANDING:
        return (
           <LandingPage 
              onLogin={() => navigate(AppView.LOGIN)}
              onRegister={() => navigate(AppView.REGISTER)}
              onGuest={handleGuestAccess}
              onUltraAuth={handleUltraLogin}
           />
        );

      case AppView.HOME:
        return (
            <div className="p-4 md:p-6 max-w-[1800px] mx-auto w-full animate-in fade-in duration-500">
              {/* Guest Banner */}
              {isGuest && (
                 <div className="bg-gradient-to-r from-brand-900 to-black border border-brand-700 rounded-xl p-4 mb-8 flex justify-between items-center shadow-lg shadow-brand-900/30">
                     <div>
                         <h3 className="font-bold text-white">Welcome, Guest!</h3>
                         <p className="text-xs text-gray-300">
                            {guestWatchCount < GUEST_WATCH_LIMIT_DEMO 
                              ? `You can watch ${GUEST_WATCH_LIMIT_DEMO - guestWatchCount} more free videos.` 
                              : "You have reached your free limit."}
                            Sign up for unlimited access.
                         </p>
                     </div>
                     <button onClick={() => navigate(AppView.REGISTER)} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                        Join Free
                     </button>
                 </div>
              )}

              {/* Category Pills */}
               <div className="flex overflow-x-auto gap-3 mb-8 pb-2 no-scrollbar">
                 <button 
                    onClick={() => { setSelectedCategoryName('Trending'); navigate(AppView.CATEGORY); }}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}
                 >
                    <i className="fa-solid fa-fire mr-2"></i> Trending
                 </button>
                 <button 
                    onClick={() => { setSelectedCategoryName('Premium'); navigate(AppView.CATEGORY); }}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}
                 >
                    <i className="fa-solid fa-crown mr-2 text-yellow-500"></i> Premium
                 </button>
                 <button 
                    onClick={() => navigate(AppView.MODELS)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}
                 >
                    <i className="fa-solid fa-users mr-2"></i> Top Models
                 </button>
                 <button 
                    onClick={() => navigate(AppView.LIVE)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}
                 >
                    <i className="fa-solid fa-video mr-2 text-red-500"></i> Live Cams
                 </button>
                  <button 
                    onClick={() => navigate(AppView.SHORTS)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}
                 >
                    <i className="fa-solid fa-bolt mr-2"></i> Shorts
                 </button>
               </div>

              {/* Hero/Featured Section */}
              <div className={`mb-10 relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[3/1] group cursor-pointer shadow-2xl ${isUltra ? 'shadow-indigo-500/20 border-indigo-500/30' : 'shadow-brand-900/20 border-gray-800'} border`}>
                <img 
                  src="https://picsum.photos/seed/nightlife/1600/600" 
                  alt="Featured" 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex items-center p-6 md:p-16">
                  <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-4 duration-700 delay-100">
                      <span className={`${isUltra ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-brand-600 shadow-brand-500/50'} text-white text-[10px] md:text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                        {isUltra ? 'Blueberry Original' : 'PlayNite Original'}
                      </span>
                      <span className="text-gray-300 text-xs uppercase tracking-widest font-semibold">Season 4 Premiere</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-6xl font-bold leading-tight animate-in slide-in-from-left-4 duration-700 delay-200">
                      Velvet <span className={isUltra ? 'text-indigo-400' : 'text-brand-500'}>Room</span>
                    </h1>
                    
                    <p className="text-gray-200 text-sm md:text-lg line-clamp-2 md:line-clamp-none animate-in slide-in-from-left-4 duration-700 delay-300 max-w-lg">
                      Step inside the most exclusive club where the rules are made to be broken. A {isUltra ? 'Blueberry' : 'PlayNite'} visual masterpiece in 4K HDR.
                    </p>
                    
                    <div className="pt-4 animate-in slide-in-from-left-4 duration-700 delay-500 flex gap-4">
                      <button className={`bg-white text-black ${isUltra ? 'hover:bg-indigo-500' : 'hover:bg-brand-500'} hover:text-white px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-1`}>
                        <i className="fa-solid fa-play"></i> Watch Now
                      </button>
                      <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-6 py-3.5 rounded-full font-bold transition-all flex items-center gap-2">
                        <i className="fa-solid fa-plus"></i> My List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <i className={`fa-solid fa-fire ${isUltra ? 'text-cyan-400' : 'text-brand-500'}`}></i> Trending Now
                  </h2>
                  <button onClick={() => {setSelectedCategoryName('Trending'); navigate(AppView.CATEGORY)}} className={`text-sm ${isUltra ? 'text-cyan-400 hover:text-indigo-300' : 'text-brand-400 hover:text-white'} font-medium transition-colors`}>View All</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {renderVideoList(allVideos.filter(v => v.category === 'Trending'))}
                  {renderVideoList(allVideos.slice(0,3))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <i className="fa-solid fa-crown text-yellow-500"></i> Premium Collections
                  </h2>
                  <button onClick={() => {setSelectedCategoryName('Premium'); navigate(AppView.CATEGORY)}} className={`text-sm ${isUltra ? 'text-cyan-400 hover:text-indigo-300' : 'text-brand-400 hover:text-white'} font-medium transition-colors`}>View All</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {renderVideoList(allVideos.filter(v => v.category === 'Premium').concat(allVideos.slice(2,5)).slice(0, 4))}
                </div>
              </div>
            </div>
        );

      case AppView.PREMIUM:
        return (
          <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in duration-500">
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-yellow-900/30">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                    <i className="fa-solid fa-crown text-3xl text-black"></i>
                 </div>
                 <div>
                   <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">Premium Collection</h1>
                   <p className="text-yellow-100/60 text-sm mt-1">Exclusive 4K content, extended scenes, and VIP access.</p>
                 </div>
             </div>

             {/* Premium Banner */}
             <div className="mb-10 bg-gradient-to-r from-yellow-900/20 to-black border border-yellow-900/50 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center">
               <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Experience</h2>
                  <p className="text-gray-400 max-w-md">Get unlimited access to thousands of exclusive premium videos in 4K resolution without ads.</p>
               </div>
               <button onClick={() => navigate(AppView.PRICING)} className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                  View Plans
               </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
               {renderVideoList(allVideos.filter(v => v.category === 'Premium' || v.tags.includes('exclusive') || v.rating > 95))}
               {renderVideoList(allVideos.slice(0, 4))}
             </div>
          </div>
        );

      case AppView.MODELS:
        return (
          <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${isUltra ? 'from-indigo-600 to-cyan-600' : 'from-purple-600 to-brand-600'} flex items-center justify-center`}>
                 <i className="fa-solid fa-user-group text-xl text-white"></i>
              </div>
              <h1 className="text-3xl font-bold">Top Models & Stars</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {allModels.map(model => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  onClick={handleModelSelect}
                />
              ))}
            </div>
          </div>
        );
      
      case AppView.MODEL_DETAIL:
        return selectedModel ? (
          <ModelProfile 
            model={selectedModel}
            videos={allVideos.filter(v => Math.random() > 0.5)}
            onVideoSelect={handleVideoSelect}
            onBack={() => handleBack()}
            onToggleFavorite={toggleFavorite}
            onToggleWatchLater={toggleWatchLater}
            favoriteIds={favoriteIds}
            watchLaterIds={watchLaterIds}
            onShowToast={showToast}
            isUltra={isUltra}
          />
        ) : null;

      case AppView.FAVORITES:
        const favoritesList = allVideos.filter(v => favoriteIds.has(v.id));
        return (
           <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
             <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
               <i className={`fa-solid fa-heart ${isUltra ? 'text-indigo-500' : 'text-brand-500'}`}></i> My Favorites
             </h1>
             {favoritesList.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                 {renderVideoList(favoritesList)}
               </div>
             ) : (
                <EmptyView 
                  icon="fa-heart"
                  title="No Favorites Yet"
                  description="Save videos you love to easily find them later. Start exploring to build your collection."
                  actionLabel="Explore Now"
                  onAction={() => navigate(AppView.HOME)}
                  isUltra={isUltra}
                />
             )}
           </div>
        );

      case AppView.HISTORY:
        // For demo purposes, using a slice of allVideos. In real app, this would be a user specific list.
        const historyList = allVideos.slice(0, 4);
        const showEmptyHistory = false; // Toggle for testing

        return (
           <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
             <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
               <i className="fa-solid fa-clock-rotate-left text-blue-500"></i> Watch History
             </h1>
             {!showEmptyHistory ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                 {renderVideoList(historyList)}
               </div>
             ) : (
                <EmptyView 
                   icon="fa-clock-rotate-left"
                   title="No Watch History"
                   description="Videos you watch will appear here. Start watching to see your history."
                   actionLabel="Start Watching"
                   onAction={() => navigate(AppView.HOME)}
                   isUltra={isUltra}
                />
             )}
           </div>
        );
      
      case AppView.CATEGORY:
        const categoryVideos = allVideos.filter(v => v.category === selectedCategoryName);
        const hasContent = categoryVideos.length > 0;
        const isLiveCategory = selectedCategoryName === 'Live Cams';

        return (
          <div className="p-6 max-w-[1800px] mx-auto animate-in fade-in">
             <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                 <button 
                   onClick={handleBack}
                   className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center ${isUltra ? 'hover:bg-indigo-600' : 'hover:bg-brand-600'} transition-colors`}
                 >
                   <i className="fa-solid fa-arrow-left"></i>
                 </button>
                 <div>
                   <h1 className="text-2xl font-bold flex items-center gap-2">
                     {selectedCategoryName} 
                     {isLiveCategory && <span className="animate-pulse text-red-500 text-sm border border-red-900 bg-red-900/20 px-2 py-0.5 rounded">LIVE</span>}
                   </h1>
                   <p className="text-gray-400 text-sm">Browse our curated {selectedCategoryName.toLowerCase()} collection.</p>
                 </div>
             </div>
             
             {hasContent ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                   {renderVideoList(categoryVideos)}
                 </div>
             ) : (
                <EmptyView 
                   icon="fa-film"
                   title={`No ${selectedCategoryName} Videos`}
                   description="We couldn't find any videos in this category at the moment. Please check back later."
                   actionLabel="Browse All"
                   onAction={() => navigate(AppView.HOME)}
                   isUltra={isUltra}
                />
             )}
          </div>
        );

      case AppView.SEARCH:
        return (
            <div className="p-6 max-w-[1800px] mx-auto w-full animate-in fade-in">
               <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                 <button 
                   onClick={handleBack}
                   className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center ${isUltra ? 'hover:bg-indigo-600' : 'hover:bg-brand-600'} transition-colors`}
                 >
                   <i className="fa-solid fa-arrow-left"></i>
                 </button>
                 <div>
                   <h1 className="text-2xl font-bold">Search Results</h1>
                   <p className="text-gray-400 text-sm">Found {searchResults.length} results for "{currentSearchQuery}"</p>
                 </div>
               </div>

               {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                   {renderVideoList(searchResults)}
                 </div>
               ) : (
                 <EmptyView 
                    icon="fa-search"
                    title="No Results Found"
                    description={`We couldn't find any videos matching "${currentSearchQuery}". Try adjusting your search terms or browse our categories.`}
                    actionLabel="Browse Categories"
                    onAction={() => { setSelectedCategoryName('Trending'); navigate(AppView.CATEGORY); }}
                    isUltra={isUltra}
                 />
               )}
            </div>
        );

      case AppView.PLAYER:
        return selectedVideo ? (
            <div className="animate-in fade-in duration-300">
               <Player 
                 video={selectedVideo} 
                 currentUser={currentUser || {id: 'guest', username: 'Guest', role: UserRole.GUEST, plan: 'free'}}
                 onVideoSelect={handleVideoSelect}
                 isFavorite={favoriteIds.has(selectedVideo.id)}
                 onToggleFavorite={() => toggleFavorite(selectedVideo.id)}
                 isWatchLater={(id) => watchLaterIds.has(id)}
                 onToggleWatchLater={toggleWatchLater}
                 onShowToast={showToast}
                 setView={navigate}
                 isUltra={isUltra}
               />
            </div>
        ) : null;

      case AppView.ADMIN:
        return (
            <div className="animate-in fade-in duration-300">
              <AdminPanel />
            </div>
        );
      
      case AppView.UPLOAD:
        return (
            <div className="animate-in fade-in duration-300">
               <div className="p-8 max-w-4xl mx-auto text-center">
                   <div className="border-2 border-dashed border-gray-700 rounded-3xl p-16 bg-dark-card/50">
                      <i className="fa-solid fa-cloud-arrow-up text-6xl text-gray-600 mb-6"></i>
                      <h2 className="text-3xl font-bold text-white mb-4">Upload Content</h2>
                      <p className="text-gray-400 mb-8">Drag and drop video files to upload, or click to browse.</p>
                      <button className={`${isUltra ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-brand-600 hover:bg-brand-500'} text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg`}>
                         Select Files
                      </button>
                   </div>
               </div>
            </div>
        );
        
      case AppView.PROFILE:
        return currentUser ? <UserProfile
            user={currentUser}
            setView={navigate}
            onUpdateUser={(updates) => {
                setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
                showToast("Profile updated successfully");
            }}
        /> : null;
      
      case AppView.SETTINGS:
        return <SettingsPage user={currentUser} />;
      
      case AppView.SHORTS:
        return <ShortsFeed isUltra={isUltra} onBack={handleBack} />;
        
      case AppView.LOGIN:
        return <AuthPages view={currentView} setView={(view) => {
           if (view === AppView.HOME) {
               handleStandardLogin();
           } else {
               navigate(view);
           }
        }} 
        onUltraLogin={handleUltraLogin}
        onLoginSuccess={(userData) => {
            setCurrentUser({
                id: `user-${Math.floor(Math.random() * 1000)}`,
                username: userData.username || 'User',
                role: userData.role || UserRole.USER,
                plan: userData.plan || 'premium',
                avatar: `https://picsum.photos/seed/${userData.username}/100/100`
            });
            showToast(`Welcome, ${userData.username}!`);
        }}
        />;

      case AppView.REGISTER:
      case AppView.FORGOT_PASSWORD:
         return (
           <div className="relative">
             <AuthPages view={currentView} setView={(view) => {
                if(view === AppView.HOME) {
                   // Handled by onLoginSuccess, but if needed fallback
                   if (!currentUser) handleStandardLogin();
                } else {
                   navigate(view);
                }
             }} 
             onUltraLogin={handleUltraLogin}
             onLoginSuccess={(userData) => {
                setCurrentUser({
                    id: `user-${Math.floor(Math.random() * 1000)}`,
                    username: userData.username || 'User',
                    role: userData.role || UserRole.USER,
                    plan: userData.plan || 'free',
                    avatar: `https://picsum.photos/seed/${userData.username}/100/100`
                });
                showToast(`Welcome, ${userData.username}! Account created.`);
            }}
             />
           </div>
         );

      case AppView.DOWNLOADS:
        return <DownloadsPage onBack={handleBack} />;
        
      case AppView.PLAYLIST_DETAIL:
        return <PlaylistView onBack={handleBack} />;

      case AppView.LIVE:
        return <LivePage onBack={handleBack} />;

      case AppView.ANALYTICS:
        return <UltraAnalytics onBack={handleBack} />;
      
      case AppView.STUDIO:
        return <StudioPro onBack={handleBack} />;
      
      case AppView.VIP_SUPPORT:
        return <VipSupport onBack={handleBack} />;
      
      case AppView.PRICING:
        return (
          <PricingPage 
             currentPlan={currentUser?.plan}
             onSelectPlan={(plan) => {
                if (plan === 'blueberry') handleUltraLogin();
                else if (plan === 'premium') handleStandardLogin();
                else handleGuestAccess();
             }}
             onBack={handleBack}
          />
        );

      case AppView.COMMUNITY:
        return (
            <div className="p-6 max-w-5xl mx-auto animate-in fade-in">
               <h1 className="text-3xl font-bold text-white mb-8">Community Feed</h1>
               <div className="space-y-6">
                  {/* Create Post */}
                  <div className="bg-dark-card p-4 rounded-xl border border-gray-800 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                         <img src={currentUser?.avatar || "https://picsum.photos/seed/default/100/100"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                          <input type="text" placeholder="What's on your mind?" className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white mb-3" />
                          <div className="flex justify-between">
                             <div className="flex gap-2">
                                 <button className="text-gray-400 hover:text-white p-2"><i className="fa-solid fa-image"></i></button>
                                 <button className="text-gray-400 hover:text-white p-2"><i className="fa-solid fa-poll"></i></button>
                             </div>
                             <button className={`${isUltra ? 'bg-indigo-600' : 'bg-brand-600'} text-white px-6 py-1.5 rounded-full font-bold text-sm`}>Post</button>
                          </div>
                      </div>
                  </div>
                  
                  {/* Posts */}
                  {MOCK_POSTS.map(post => (
                      <div key={post.id} className="bg-dark-card p-6 rounded-xl border border-gray-800">
                          <div className="flex items-center gap-3 mb-4">
                              <img src={post.avatar} className="w-10 h-10 rounded-full" />
                              <div>
                                  <p className="font-bold text-white">{post.user}</p>
                                  <p className="text-xs text-gray-500">{post.time}</p>
                              </div>
                          </div>
                          <p className="text-gray-300 mb-4">{post.content}</p>
                          <div className="flex gap-6 text-gray-400 text-sm">
                              <button className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} flex items-center gap-2`}><i className="fa-regular fa-heart"></i> {post.likes}</button>
                              <button className="hover:text-white flex items-center gap-2"><i className="fa-regular fa-comment"></i> {post.comments}</button>
                              <button className="hover:text-white flex items-center gap-2"><i className="fa-solid fa-share"></i> Share</button>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
        );

      case AppView.HELP:
        return (
            <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">Help Center</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['Account Issues', 'Billing & Subscription', 'Video Playback', 'Privacy & Security', 'Creator Tools', 'Report Content'].map(topic => (
                        <div key={topic} className={`bg-dark-card p-6 rounded-xl border border-gray-800 ${isUltra ? 'hover:border-indigo-500' : 'hover:border-brand-500'} transition-colors cursor-pointer group`}>
                             <h3 className={`font-bold text-white text-lg mb-2 ${isUltra ? 'group-hover:text-indigo-400' : 'group-hover:text-brand-500'}`}>{topic}</h3>
                             <p className="text-gray-400 text-sm">Get help with {topic.toLowerCase()} related questions.</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Still need help?</p>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Contact Support</button>
                </div>
            </div>
        );

      case AppView.TERMS:
      case AppView.PRIVACY:
      case AppView.PARENTAL:
      case AppView.EXEMPTION:
      case AppView.DMCA:
        return <StaticPage type={currentView} />;
        
      default:
        return <ErrorView message="Page not found" onRetry={() => navigate(AppView.HOME)} />;
    }
  };

  // Hide Navbar/Sidebar on Landing Page
  const isLanding = currentView === AppView.LANDING;
  const isAuthPage = [AppView.LOGIN, AppView.REGISTER, AppView.FORGOT_PASSWORD].includes(currentView);
  const isShorts = currentView === AppView.SHORTS;
  const showNavAndSidebar = !isLanding && !isAuthPage && !isShorts;

  // Dynamic Background Class
  const appBackgroundClass = isUltra 
    ? "bg-[#020617]" // Deep Indigo Black
    : "bg-dark-bg"; // Default Black

  return (
    <div 
      className={`min-h-screen ${appBackgroundClass} text-white font-sans selection:bg-brand-500 selection:text-white flex flex-col transition-colors duration-700`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Ultra Glow Effect */}
      {isUltra && (
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/10 blur-[100px]"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900/10 blur-[100px]"></div>
        </div>
      )}

      {showNavAndSidebar && (
        <Navbar 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
          setView={navigate}
          currentUser={currentUser}
          canGoBack={viewHistory.length > 0}
          onBack={handleBack}
        />
      )}

      {showNavAndSidebar && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
          currentView={currentView}
          setView={navigate}
          setCategory={setSelectedCategoryName}
          currentUser={currentUser}
          searchHistory={searchHistory}
          onSearch={handleSearch}
        />
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 pt-0 relative z-10 ${
          showNavAndSidebar ? 'lg:ml-64' : ''
        }`}
      >
        <div className={`flex flex-col ${isShorts ? 'h-screen' : (isLanding ? 'h-auto' : 'min-h-[calc(100vh-4rem)]')}`}>
          
          {renderContent()}
          
          {/* Simple Footer - Hide on immersive screens */}
          {![AppView.PLAYER, AppView.MODEL_DETAIL, AppView.SHORTS, AppView.LOGIN, AppView.REGISTER, AppView.FORGOT_PASSWORD, AppView.LANDING, AppView.PRICING].includes(currentView) && (
            <footer className="border-t border-gray-900 mt-auto py-12 bg-black/30">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                   <div className={`w-8 h-8 ${isUltra ? 'bg-indigo-600' : 'bg-brand-600'} rounded-lg flex items-center justify-center text-white font-bold`}>
                     {isUltra ? <i className="fa-solid fa-atom"></i> : <i className="fa-solid fa-play"></i>}
                   </div>
                   <span className="text-xl font-bold text-white">{isUltra ? 'Blueberry' : 'PlayNite'}</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm text-gray-400">
                  <button onClick={() => {navigate(AppView.TERMS); window.scrollTo(0,0)}} className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors`}>Terms of Service</button>
                  <button onClick={() => {navigate(AppView.PRIVACY); window.scrollTo(0,0)}} className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors`}>Privacy Policy</button>
                  <button onClick={() => {navigate(AppView.PARENTAL); window.scrollTo(0,0)}} className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors`}>Parental Controls</button>
                  <button onClick={() => {navigate(AppView.EXEMPTION); window.scrollTo(0,0)}} className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors`}>2257 Exemption</button>
                  <button onClick={() => {navigate(AppView.DMCA); window.scrollTo(0,0)}} className={`${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors`}>Content Removal</button>
                </div>

                <p className="text-xs text-gray-600 mb-2">&copy; 2025 {isUltra ? 'Blueberry Ultra' : 'PlayNite Premium'} Entertainment. All rights reserved.</p>
                <p className="text-xs text-gray-700">Developed by {DEVELOPERS.join(', ')}</p>
              </div>
            </footer>
          )}
        </div>
      </main>
      
      {/* Global Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default App;
