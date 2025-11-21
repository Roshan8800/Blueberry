
import React from 'react';
import { AppView, User, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  currentView: AppView;
  setView: (view: AppView) => void;
  setCategory: (cat: string) => void;
  currentUser: User | null;
  searchHistory: string[];
  onSearch: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  closeSidebar, 
  currentView, 
  setView, 
  setCategory, 
  currentUser,
  searchHistory,
  onSearch
}) => {
  
  const isGuest = !currentUser || currentUser.role === UserRole.GUEST;
  const isUltra = currentUser?.plan === 'blueberry';

  // Theme Helpers
  const activeBg = isUltra ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-indigo-900/20' : 'bg-brand-600 shadow-brand-900/20';
  const hoverText = isUltra ? 'hover:text-cyan-400' : 'hover:text-white';
  const headerText = isUltra ? 'text-indigo-400' : 'text-brand-500';
  const borderColor = isUltra ? 'border-indigo-900/20' : 'border-brand-900/20';

  const handleCategoryClick = (categoryName: string) => {
    setCategory(categoryName);
    setView(AppView.CATEGORY);
    closeSidebar();
  };

  const handleViewChange = (view: AppView) => {
    setView(view);
    closeSidebar();
  };

  const handleHistoryClick = (query: string) => {
    onSearch(query);
    closeSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 lg:top-16 left-0 w-72 lg:w-64 h-full lg:h-[calc(100vh-4rem)] ${isUltra ? 'bg-[#020617] border-indigo-900/30' : 'bg-dark-surface border-brand-900/20'} border-r z-50 lg:z-30 transform transition-transform duration-300 overflow-y-auto no-scrollbar ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-800 mb-2">
           <span className={`text-xl font-bold ${headerText}`}>Menu</span>
           <button onClick={closeSidebar} className="text-gray-400 hover:text-white">
             <i className="fa-solid fa-times text-xl"></i>
           </button>
        </div>
        
        {/* Guest Limit Indicator */}
        {isGuest && (
           <div className="mx-4 mt-4 p-3 bg-brand-900/20 border border-brand-900/50 rounded-lg text-center">
              <p className="text-xs text-brand-200 font-bold mb-1">Guest Access</p>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                 <div className="bg-brand-500 h-1.5 rounded-full" style={{width: '2%'}}></div>
              </div>
              <p className="text-[10px] text-gray-400">Free Videos: <span className="text-white">Limited</span></p>
           </div>
        )}

        <div className="p-4 space-y-6">
          
          {/* Main Nav */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Browse</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleViewChange(AppView.HOME)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.HOME ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-home w-5 text-center"></i>
                  <span className="font-medium">Home</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleViewChange(AppView.SHORTS)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.SHORTS ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-bolt w-5 text-center"></i>
                  <span className="font-medium">Shorts</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleViewChange(AppView.LIVE)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.LIVE ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-video w-5 text-center"></i>
                  <span className="font-medium">Live Hub</span>
                </button>
              </li>
              {!isUltra && (
                <li>
                  <button 
                    onClick={() => handleViewChange(AppView.PREMIUM)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      currentView === AppView.PREMIUM 
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-900/20 font-bold' 
                      : 'text-yellow-500 hover:bg-yellow-900/20'
                    }`}
                  >
                    <i className="fa-solid fa-crown w-5 text-center"></i>
                    <span className="font-medium">Premium</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Library - Hide some items for Guest */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Library</h3>
            <ul className="space-y-1">
               <li>
                <button 
                   onClick={() => handleViewChange(AppView.FAVORITES)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.FAVORITES ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-heart w-5 text-center"></i>
                  <span className="font-medium">Favorites</span>
                </button>
              </li>
              <li>
                <button 
                   onClick={() => handleViewChange(AppView.HISTORY)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.HISTORY ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i>
                  <span className="font-medium">History</span>
                </button>
              </li>
              {!isGuest && (
                <li>
                  <button 
                    onClick={() => handleViewChange(AppView.DOWNLOADS)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === AppView.DOWNLOADS ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                    }`}
                  >
                    <i className="fa-solid fa-download w-5 text-center"></i>
                    <span className="font-medium">Downloads</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
             <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Searches</h3>
                <ul className="space-y-1">
                   {searchHistory.slice(0, 5).map((term, idx) => (
                      <li key={idx}>
                         <button 
                           onClick={() => handleHistoryClick(term)}
                           className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                         >
                            <i className="fa-solid fa-clock-rotate-left w-5 text-center text-xs"></i>
                            <span className="font-medium text-sm truncate">{term}</span>
                         </button>
                      </li>
                   ))}
                </ul>
             </div>
          )}

          {/* Ultra Exclusive Section */}
          {isUltra && (
             <div className="bg-indigo-900/10 rounded-xl p-2 border border-indigo-500/20">
              <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                <i className="fa-solid fa-gem"></i> Ultra Features
              </h3>
              <ul className="space-y-1">
                 <li>
                  <button 
                    onClick={() => handleViewChange(AppView.ANALYTICS)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === AppView.ANALYTICS ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-chart-pie w-5 text-center"></i>
                    <span className="font-medium">Analytics</span>
                  </button>
                </li>
                 <li>
                  <button 
                    onClick={() => handleViewChange(AppView.STUDIO)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      currentView === AppView.STUDIO ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles w-5 text-center group-hover:animate-pulse"></i>
                    <span className="font-medium">Studio Pro</span>
                  </button>
                </li>
                 <li>
                  <button 
                    onClick={() => handleViewChange(AppView.VIP_SUPPORT)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      currentView === AppView.VIP_SUPPORT ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-headset w-5 text-center"></i>
                    <span className="font-medium">VIP Support</span>
                  </button>
                </li>
              </ul>
             </div>
          )}

          {/* Community & Discovery */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Discover</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleViewChange(AppView.MODELS)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.MODELS ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-user-group w-5 text-center"></i>
                  <span className="font-medium">Models / Stars</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleViewChange(AppView.COMMUNITY)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentView === AppView.COMMUNITY ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                  }`}
                >
                  <i className="fa-solid fa-comments w-5 text-center"></i>
                  <span className="font-medium">Community</span>
                </button>
              </li>
              {!isGuest && (
                <li>
                  <button
                    onClick={() => handleViewChange(AppView.MESSAGES)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === AppView.MESSAGES ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                    }`}
                  >
                    <i className="fa-solid fa-envelope w-5 text-center"></i>
                    <span className="font-medium">Messages</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

           {/* Admin Section (Conditional) */}
           {currentUser?.role === UserRole.ADMIN && (
            <div>
              <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2 px-2">Administration</h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => handleViewChange(AppView.ADMIN)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === AppView.ADMIN ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                    }`}
                  >
                    <i className="fa-solid fa-gauge-high w-5 text-center"></i>
                    <span className="font-medium">Admin Panel</span>
                  </button>
                </li>
              </ul>
            </div>
           )}
           
           {/* Settings & Misc */}
           <div className="pt-2">
             <ul className="space-y-1">
               {!isGuest && (
                  <li>
                    <button 
                      onClick={() => handleViewChange(AppView.SETTINGS)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        currentView === AppView.SETTINGS ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                      }`}
                    >
                      <i className="fa-solid fa-gear w-5 text-center"></i>
                      <span className="font-medium">Settings</span>
                    </button>
                  </li>
               )}
                <li>
                  <button 
                    onClick={() => handleViewChange(AppView.HELP)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === AppView.HELP ? `${activeBg} text-white shadow-lg` : `text-gray-400 hover:bg-gray-800 ${hoverText}`
                    }`}
                  >
                    <i className="fa-solid fa-circle-question w-5 text-center"></i>
                    <span className="font-medium">Help Center</span>
                  </button>
                </li>
             </ul>
           </div>

           {/* Footer Info */}
           <div className="pt-6 mt-4 border-t border-gray-800/50">
             <div className="px-3 text-xs text-gray-600 space-y-2">
               <p className="font-medium text-gray-500">{isUltra ? 'Blueberry Ultra' : 'PlayNite Premium'}</p>
               <p>v3.1.0 (Ultra)</p>
             </div>
           </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
