
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
import UploadPage from './components/UploadPage';
import LandingPage from './components/LandingPage';
import UltraAnalytics from './components/UltraAnalytics';
import StudioPro from './components/StudioPro';
import VipSupport from './components/VipSupport';
import PricingPage from './components/PricingPage';
import BillingPage from './components/BillingPage';
import HelpPage from './components/HelpPage';
import SearchResults from './components/SearchResults';
import Recommendations from './components/Recommendations';
import Community from './components/Community';
import { EmptyView, ErrorView } from './components/StateViews';
import { DEMO_ADMIN, DEVELOPERS, MOCK_MODELS, MOCK_POSTS, DEMO_BLUEBERRY_USER } from './constants';
import { Video, AppView, User, Model, UserRole } from './types';
import { getSmartSearchSuggestions } from './services/geminiService';
import { analytics, logEvent, fetchVideos, auth, onAuthStateChanged, fetchModels, seedDatabaseIfEmpty } from './services/firebase';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  
  // --- Global Navigation History ---
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const historyIndexRef = useRef<number>(0);

  // --- Data State ---
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // --- Fetch Data from Firestore ---
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Seed database if empty
      const seedResult = await seedDatabaseIfEmpty();
      if (!seedResult.success) {
        console.warn("Database seeding failed:", seedResult.error);
      }

      const [videosResult, modelsResult] = await Promise.all([fetchVideos(), fetchModels()]);
      const errors: string[] = [];
      if (!videosResult.success) {
        errors.push(`Videos: ${videosResult.error}`);
      } else {
        setAllVideos(videosResult.data || []);
      }
      if (!modelsResult.success) {
        errors.push(`Models: ${modelsResult.error}`);
      } else {
        setAllModels(modelsResult.data || []);
      }
      if (errors.length > 0) {
        setError(`Failed to load some content: ${errors.join('; ')}`);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("We had trouble loading content. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
        // setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Browser History Sync ---
  useEffect(() => {
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

        if (newIndex < currentIndex) {
          const delta = currentIndex - newIndex;
          setViewHistory(prev => prev.slice(0, -delta));
        } else if (newIndex > currentIndex) {
          setViewHistory(prev => [...prev, currentView]);
        }

        historyIndexRef.current = newIndex;
        setCurrentView(event.state.view);
      } else {
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
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(newView);
    const newIndex = historyIndexRef.current + 1;
    historyIndexRef.current = newIndex;
    window.history.pushState({ view: newView, index: newIndex }, '', `?view=${newView}`);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (viewHistory.length === 0) {
        if (currentUser && currentView !== AppView.HOME) navigate(AppView.HOME);
        else if (!currentUser && currentView !== AppView.LANDING) navigate(AppView.LANDING);
        return;
    }
    window.history.back();
  };

  // Load Persisted Data
  useEffect(() => {
    const savedHistory = localStorage.getItem('playnite_search_history');
    if (savedHistory) try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}

    const savedFavs = localStorage.getItem('playnite_favorites');
    if (savedFavs) try { setFavoriteIds(new Set(JSON.parse(savedFavs))); } catch(e) {}

    const savedWatchLater = localStorage.getItem('playnite_watch_later');
    if (savedWatchLater) try { setWatchLaterIds(new Set(JSON.parse(savedWatchLater))); } catch(e) {}
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
    setCurrentUser({ id: 'user1', username: 'PremiumUser', role: UserRole.USER, plan: 'premium', avatar: 'https://picsum.photos/seed/user1/100/100' });
    navigate(AppView.HOME);
    showToast("Welcome back! Premium features unlocked.");
  };

  const handleUltraLogin = () => {
    setCurrentUser(DEMO_BLUEBERRY_USER);
    navigate(AppView.HOME);
    showToast("Welcome to Blueberry Ultra.");
  };

  const handleGuestAccess = () => {
    setCurrentUser({ id: 'guest', username: 'Guest', role: UserRole.GUEST, plan: 'free', avatar: undefined });
    setGuestWatchCount(0); 
    navigate(AppView.HOME);
    showToast("Browsing as Guest (Limited Access)");
  };

  // Responsive Sidebar Logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndRef.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (window.innerWidth < 1024) {
      if (distance < -100 && !isSidebarOpen) setIsSidebarOpen(true);
      if (distance > 100 && isSidebarOpen) setIsSidebarOpen(false);
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

  const getTrendingVideos = (videos: Video[]) => {
    return [...videos].sort((a, b) => {
      const aViews = parseInt(a.views.replace(/,/g, ''));
      const bViews = parseInt(b.views.replace(/,/g, ''));
      const aScore = aViews + (a.likes || 0) * 10 - (a.dislikes || 0) * 5;
      const bScore = bViews + (b.likes || 0) * 10 - (b.dislikes || 0) * 5;
      return bScore - aScore;
    });
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

  if (!isAgeVerified) {
    return <WarningModal onEnter={() => setIsAgeVerified(true)} />;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]">
             <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
       );

    }
    if (error) {
      return <ErrorView message={error} onRetry={loadData} />;
    }

    switch (currentView) {
      case AppView.LANDING:
        return <LandingPage onLogin={() => navigate(AppView.LOGIN)} onRegister={() => navigate(AppView.REGISTER)} onGuest={handleGuestAccess} onUltraAuth={handleUltraLogin} videos={allVideos} onVideoSelect={handleVideoSelect} />;

      case AppView.SEARCH:
        return <SearchResults
          videos={searchResults}
          query={currentSearchQuery}
          onVideoSelect={handleVideoSelect}
          currentUser={currentUser}
          favoriteIds={favoriteIds}
          watchLaterIds={watchLaterIds}
          onToggleFavorite={toggleFavorite}
          onToggleWatchLater={toggleWatchLater}
          onShowToast={showToast}
          isUltra={isUltra}
        />;

      case AppView.SHORTS:
        return <ShortsFeed isUltra={isUltra} onBack={() => navigate(AppView.HOME)} />;

      case AppView.COMMUNITY:
        return <Community currentUser={currentUser} setView={navigate} isUltra={isUltra} />;

      case AppView.CATEGORY:
        let categoryVideos = allVideos;
        if (selectedCategoryName === 'Trending') {
          categoryVideos = getTrendingVideos(allVideos);
        } else if (selectedCategoryName === 'New Arrivals') {
          categoryVideos = [...allVideos].sort((a, b) => parseInt(b.id) - parseInt(a.id));
        } else if (selectedCategoryName === 'Top Rated') {
          categoryVideos = [...allVideos].sort((a, b) => b.rating - a.rating);
        } else {
          categoryVideos = allVideos.filter(v => v.category === selectedCategoryName);
        }
        return (
          <div className="p-4 md:p-6 max-w-[1800px] mx-auto w-full animate-in fade-in duration-500">
            <div className="mb-6">
              <button onClick={() => navigate(AppView.HOME)} className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> Back to Home
              </button>
              <h1 className="text-2xl font-bold text-white">{selectedCategoryName}</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {renderVideoList(categoryVideos)}
            </div>
          </div>
        );

      case AppView.HOME:
        if (allVideos.length === 0) {
            return <EmptyView icon="fa-film" title="No Videos Found" description="It looks like there are no videos available right now. Try uploading some content!" actionLabel="Upload a Video" onAction={() => navigate(AppView.UPLOAD)} isUltra={isUltra} />
        }
        return (
            <div className="p-4 md:p-6 max-w-[1800px] mx-auto w-full animate-in fade-in duration-500">
              {currentUser?.role === UserRole.GUEST && (
                  <div className="bg-gradient-to-r from-brand-900 to-black border border-brand-700 rounded-xl p-4 mb-8 flex justify-between items-center shadow-lg shadow-brand-900/30">
                      <div>
                          <h3 className="font-bold text-white">Welcome, Guest!</h3>
                          <p className="text-xs text-gray-300">
                             {guestWatchCount < GUEST_WATCH_LIMIT_DEMO ? `You can watch ${GUEST_WATCH_LIMIT_DEMO - guestWatchCount} more free videos.` : "You have reached your free limit."}
                             Sign up for unlimited access.
                          </p>
                      </div>
                      <button onClick={() => navigate(AppView.REGISTER)} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">Join Free</button>
                  </div>
               )}
                <div className="flex overflow-x-auto gap-3 mb-8 pb-2 no-scrollbar">
                  <button onClick={() => { setSelectedCategoryName('Trending'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-fire mr-2"></i> Trending</button>
                  <button onClick={() => { setSelectedCategoryName('Premium'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-crown mr-2"></i> Premium</button>
                  <button onClick={() => { setSelectedCategoryName('New Arrivals'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-clock mr-2"></i> New Arrivals</button>
                  <button onClick={() => { setSelectedCategoryName('Top Rated'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-star mr-2"></i> Top Rated</button>
                  <button onClick={() => { setSelectedCategoryName('Live Cams'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-video mr-2"></i> Live Cams</button>
                  <button onClick={() => { setSelectedCategoryName('VR Experience'); navigate(AppView.CATEGORY); }} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isUltra ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30' : 'bg-white/10 hover:bg-white text-white border border-white/10 hover:text-black'}`}><i className="fa-solid fa-vr-cardboard mr-2"></i> VR Experience</button>
                </div>
                <Recommendations
                  allVideos={allVideos}
                  currentUser={currentUser}
                  favoriteIds={favoriteIds}
                  watchLaterIds={watchLaterIds}
                  onToggleFavorite={toggleFavorite}
                  onToggleWatchLater={toggleWatchLater}
                  onShowToast={showToast}
                  onVideoSelect={handleVideoSelect}
                  isUltra={isUltra}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {renderVideoList(allVideos)}
                </div>
              </div>
            );

     case AppView.LIVE:
       return <LivePage onBack={handleBack} currentUser={currentUser} onShowToast={showToast} />;

     case AppView.UPLOAD:
       return <UploadPage onBack={handleBack} setView={navigate} />;
   }
  };

  const isImmersiveView = [AppView.PLAYER, AppView.MODEL_DETAIL, AppView.SHORTS, AppView.LOGIN, AppView.REGISTER, AppView.FORGOT_PASSWORD, AppView.LANDING, AppView.PRICING].includes(currentView);
  const showNavAndSidebar = !isImmersiveView;

  return (
    <div 
      className={`min-h-screen ${isUltra ? "bg-[#020617]" : "bg-dark-bg"} text-white font-sans selection:bg-brand-500 selection:text-white flex flex-col transition-colors duration-700`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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

      <main className={`flex-1 transition-all duration-300 pt-0 relative z-10 ${showNavAndSidebar ? 'lg:ml-64' : ''}`}>
        <div className={`flex flex-col h-full`}>
          {renderContent()}
          {!isImmersiveView && (
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
      
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;
