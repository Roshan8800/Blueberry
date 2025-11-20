
import React, { useState } from 'react';
import { APP_NAME, ULTRA_NAME } from '../constants';
import { AppView, User, UserRole } from '../types';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsMobileSearchOpen(false);
    }
  };

  const isGuest = !currentUser || currentUser.role === UserRole.GUEST;
  const isUltra = currentUser?.plan === 'blueberry';

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
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView(AppView.PROFILE)}
          >
             <div className={`w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-600 ${isUltra ? 'group-hover:border-indigo-500' : 'group-hover:border-brand-500'} transition-colors overflow-hidden`}>
               <img src={currentUser?.avatar || "https://picsum.photos/seed/default/100/100"} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <i className="fa-solid fa-chevron-down text-gray-500 text-xs group-hover:text-white transition-colors hidden sm:block"></i>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
