
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsPageProps {
  user: User | null;
}

type SettingsTab = 'ACCOUNT' | 'PLAYER' | 'PRIVACY' | 'NOTIFICATIONS';

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ACCOUNT');

  // Initialize settings from localStorage or defaults
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('settings_autoplay') !== 'false');
  const [highQuality, setHighQuality] = useState(() => localStorage.getItem('settings_hq') !== 'false');
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem('settings_emails') !== 'false');
  const [historyPaused, setHistoryPaused] = useState(() => localStorage.getItem('settings_history_pause') === 'true');

  // Helper to update setting and persist
  const updateSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
      setter(value);
      localStorage.setItem(key, String(value));
  };

  const handleClearHistory = (type: 'watch' | 'search') => {
      if(type === 'watch') {
          // In a real app this would call an API or clear the history state in App.tsx via a prop/context
          localStorage.removeItem('playnite_watch_history'); // Hypothetical storage key
          alert("Watch History Cleared (Local Storage)");
      } else {
          localStorage.removeItem('playnite_search_history');
          alert("Search History Cleared");
      }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ACCOUNT':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
              <div className="flex items-start gap-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 group-hover:border-brand-500 transition-colors">
                    <img src={user?.avatar || "https://picsum.photos/seed/user/200/200"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                    <i className="fa-solid fa-camera text-white"></i>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                    <input type="text" defaultValue={user?.username} className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                    <input type="email" defaultValue="user@example.com" className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 outline-none" />
                  </div>
                  <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-500 transition-colors">Save Changes</button>
                </div>
              </div>
            </div>

            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Membership</h3>
              <div className="flex justify-between items-center bg-gradient-to-r from-yellow-900/20 to-transparent p-4 rounded-lg border border-yellow-900/30">
                <div>
                  <p className="text-yellow-500 font-bold flex items-center gap-2"><i className="fa-solid fa-crown"></i> Premium Plan</p>
                  <p className="text-xs text-gray-400 mt-1">Next billing date: February 25, 2025</p>
                </div>
                <button className="text-sm text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700">Manage</button>
              </div>
            </div>
          </div>
        );
      
      case 'PLAYER':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Playback Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Autoplay Next Video</p>
                    <p className="text-xs text-gray-500">Automatically play the next recommended video.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${autoplay ? 'bg-brand-600' : 'bg-gray-700'}`}
                    onClick={() => updateSetting('settings_autoplay', !autoplay, setAutoplay)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoplay ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Default to HD/4K</p>
                    <p className="text-xs text-gray-500">Always play highest available quality.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${highQuality ? 'bg-brand-600' : 'bg-gray-700'}`}
                    onClick={() => updateSetting('settings_hq', !highQuality, setHighQuality)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${highQuality ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'PRIVACY':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Privacy & History</h3>
               <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg mb-4">
                  <div>
                    <p className="text-sm font-medium text-white">Pause Watch History</p>
                    <p className="text-xs text-gray-500">Videos you watch won't be added to history.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${historyPaused ? 'bg-brand-600' : 'bg-gray-700'}`}
                    onClick={() => updateSetting('settings_history_pause', !historyPaused, setHistoryPaused)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${historyPaused ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button onClick={() => handleClearHistory('watch')} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-2">
                    <i className="fa-solid fa-trash"></i> Clear Watch History
                  </button>
                </div>
                 <div className="pt-4">
                  <button onClick={() => handleClearHistory('search')} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-2">
                    <i className="fa-solid fa-trash"></i> Clear Search History
                  </button>
                </div>
            </div>
          </div>
        );

      case 'NOTIFICATIONS':
        return (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Email Preferences</h3>
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Marketing Emails</p>
                    <p className="text-xs text-gray-500">Receive updates about new features and promos.</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${emailNotifs ? 'bg-brand-600' : 'bg-gray-700'}`}
                    onClick={() => updateSetting('settings_emails', !emailNotifs, setEmailNotifs)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <i className="fa-solid fa-gear text-gray-400"></i> Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {[
              { id: 'ACCOUNT', label: 'Account', icon: 'fa-user' },
              { id: 'PLAYER', label: 'Player', icon: 'fa-play-circle' },
              { id: 'PRIVACY', label: 'Privacy', icon: 'fa-shield-halved' },
              { id: 'NOTIFICATIONS', label: 'Notifications', icon: 'fa-bell' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${tab.icon} w-5 text-center`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
