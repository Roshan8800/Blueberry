
import React, { useState, useEffect } from 'react';
import { APP_NAME, ULTRA_NAME } from '../constants';
import { AppView, User, UserRole, Notification } from '../types';
import { fetchNotifications, markNotificationAsRead } from '../services/firebase';

interface NavbarProps {
  toggleSidebar: () => void;
  onSearch: (query: string) => void;
  isSidebarOpen: boolean;
  setView: (view: AppView) => void;
  currentUser: User | null;
  canGoBack?: boolean;
  onBack?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, onSearch, isSidebarOpen, setView, currentUser, canGoBack, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsMobileSearchOpen(false);
    }
  };

  const isGuest = !currentUser || currentUser.role === UserRole.GUEST;
  const isUltra = currentUser?.plan === 'blueberry';

  useEffect(() => {
    if (currentUser && !isGuest) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const result = await fetchNotifications(currentUser.id);
    if (result.success) {
      setNotifications(result.data || []);
      setUnreadCount(result.data?.filter(n => !n.read).length || 0);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowNotifications(false);

    // Navigate based on notification type
    if (notification.type === 'message') {
      setView(AppView.MESSAGES);
    } else if (notification.postId) {
      setView(AppView.COMMUNITY);
    }
  };

  // Theme variables
  const logoGradient = isUltra ? 'from-indigo-600 via-purple-600 to-cyan-500' : 'from-brand-600 to-brand-400';
  const shadowColor = isUltra ? 'shadow-indigo-500/50' : 'shadow-brand-500/30';
  const brandTextHover = isUltra ? 'group-hover:text-indigo-300' : 'group-hover:text-brand-100';
  const focusBorder = isUltra ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-brand-500 focus:ring-brand-500';
  const buttonIconHover = isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-400';

  return (
    <nav className={`sticky top-0 z-40 w-full ${isUltra ? 'bg-[#020617]/90 border-indigo-900/30' : 'bg-dark-surface/90 border-white/5'} backdrop-blur-xl border-b h-16 flex items-center px-4 justify-between shadow-2xl shadow-black/50 transition-colors duration-500`}>
      {/* Left Section: Logo & Toggle */}
      <div className={`flex items-center gap-4 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        <button 
          onClick={toggleSidebar}
          className={`text-gray-300 ${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors text-xl p-2 focus:outline-none active:scale-95`}
        >
          <i className={`fa-solid ${isSidebarOpen ? 'fa-outdent' : 'fa-bars'}`}></i>
        </button>
        
        {/* Back Button */}
        {canGoBack && (
           <button 
             onClick={onBack}
             className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white ${isUltra ? 'hover:bg-indigo-600' : 'hover:bg-brand-600'} transition-colors`}
             aria-label="Go Back"
           >
              <i className="fa-solid fa-arrow-left"></i>
           </button>
        )}
        
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView(AppView.HOME)}>
          <div className={`w-8 h-8 bg-gradient-to-tr ${logoGradient} rounded-lg flex items-center justify-center text-white shadow-lg ${shadowColor} group-hover:shadow-lg transition-all`}>
            {isUltra ? <i className="fa-solid fa-atom text-xs animate-spin-slow"></i> : <i className="fa-solid fa-play text-xs"></i>}
          </div>
          <span className={`text-xl font-bold tracking-tight text-white ${brandTextHover} transition-colors hidden sm:block`}>
            {isUltra ? ULTRA_NAME : APP_NAME}
          </span>
          {isUltra && <span className="hidden sm:block text-[9px] font-bold bg-white/10 border border-white/20 px-1.5 py-0.5 rounded uppercase tracking-widest text-indigo-200">Ultra</span>}
        </div>
      </div>

      {/* Center Section: Search Bar (Desktop) */}
      <form onSubmit={handleSearchSubmit} className={`hidden md:flex flex-1 max-w-md mx-4 relative group`}>
        <button 
          type="submit"
          className={`absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 group-focus-within:${isUltra ? 'text-indigo-400' : 'text-brand-500'} transition-colors ${buttonIconHover} cursor-pointer`}
        >
          <i className="fa-solid fa-search"></i>
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-black/20 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black/50 ${focusBorder} focus:ring-1 sm:text-sm transition-all`}
          placeholder={isUltra ? "Search global blueberry index..." : "Search videos, models, categories..."}
        />
      </form>

      {/* Mobile Search Bar (Overlay) */}
      {isMobileSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="flex md:hidden flex-1 items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="text-gray-400 p-2">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 ${focusBorder}`}
            placeholder="Search..."
          />
          <button type="submit" className={`${isUltra ? 'text-indigo-400' : 'text-brand-500'} p-2`}>
            <i className="fa-solid fa-search"></i>
          </button>
        </form>
      )}

      {/* Right Section: Actions */}
      <div className={`flex items-center gap-3 md:gap-5 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className={`text-gray-400 ${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors md:hidden`}
        >
          <i className="fa-solid fa-search text-lg"></i>
        </button>
        
        {/* Plan Badge */}
        {isUltra ? (
           <div className="hidden sm:flex items-center gap-2 bg-indigo-900/30 border border-indigo-500/30 px-3 py-1 rounded-full">
              <i className="fa-solid fa-gem text-cyan-400 text-xs"></i>
              <span className="text-xs font-bold text-indigo-100">ULTRA</span>
           </div>
        ) : (
          <button 
            className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-1"
            onClick={() => setView(AppView.PREMIUM)}
          >
            <i className="fa-solid fa-crown"></i>
            <span className="hidden sm:inline">PREMIUM</span>
          </button>
        )}

        {isGuest ? (
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-md">Guest Mode</span>
            <button 
              onClick={() => setView(AppView.LOGIN)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand-900/20"
            >
               <i className="fa-regular fa-user"></i>
               <span>Sign In</span>
            </button>
          </div>
        ) : (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative text-gray-400 ${isUltra ? 'hover:text-indigo-400' : 'hover:text-brand-500'} transition-colors p-2`}
              >
                <i className="fa-solid fa-bell text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-gray-800 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-bold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.slice(0, 10).map(notification => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-gray-800/50 ${
                          !notification.read ? 'bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">
                              <span className="font-bold text-white">{notification.fromUsername}</span>
                              {notification.type === 'like' && ' liked your post'}
                              {notification.type === 'comment' && ' commented on your post'}
                              {notification.type === 'follow' && ' started following you'}
                              {notification.type === 'message' && ' sent you a message'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="p-8 text-center">
                        <i className="fa-solid fa-bell-slash text-3xl text-gray-600 mb-4"></i>
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 10 && (
                    <div className="p-3 border-t border-gray-800 text-center">
                      <button className="text-sm text-gray-400 hover:text-white">View All</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setView(AppView.PROFILE)}
            >
               <div className={`w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-600 ${isUltra ? 'group-hover:border-indigo-500' : 'group-hover:border-brand-500'} transition-colors overflow-hidden`}>
                 <img src={currentUser?.avatar || "https://picsum.photos/seed/default/100/100"} alt="Profile" className="w-full h-full object-cover" />
               </div>
               <i className="fa-solid fa-chevron-down text-gray-500 text-xs group-hover:text-white transition-colors hidden sm:block"></i>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
