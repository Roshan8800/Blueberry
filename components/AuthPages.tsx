
import React, { useState } from 'react';
import { AppView } from '../types';

interface AuthPagesProps {
  view: AppView;
  setView: (view: AppView) => void;
  onUltraLogin?: () => void; // New prop for demo
}

const AuthPages: React.FC<AuthPagesProps> = ({ view, setView, onUltraLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    setView(AppView.HOME);
  };

  const renderContent = () => {
    if (view === AppView.LOGIN) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Enter your credentials to access your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input type="password" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setView(AppView.FORGOT_PASSWORD)} className="text-xs text-brand-400 hover:text-brand-300">Forgot Password?</button>
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all">
              Sign In
            </button>
            
            {/* Ultra Demo Button */}
            {onUltraLogin && (
                <button type="button" onClick={onUltraLogin} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all mt-4 border border-indigo-400/30">
                   <i className="fa-solid fa-atom mr-2"></i> Demo: Sign in as Ultra
                </button>
            )}
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <button onClick={() => setView(AppView.REGISTER)} className="text-white font-bold hover:underline">Sign Up</button>
          </div>
        </>
      );
    }

    if (view === AppView.REGISTER) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">Join the premium experience today.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
              <input type="text" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input type="password" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all">
              Register
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <button onClick={() => setView(AppView.LOGIN)} className="text-white font-bold hover:underline">Log In</button>
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="text-3xl font-bold text-white mb-2">Recovery</h2>
        <p className="text-gray-400 mb-8">Enter your email to reset your password.</p>
        <form onSubmit={(e) => {e.preventDefault(); setView(AppView.LOGIN)}} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input type="email" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">
            Send Reset Link
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setView(AppView.LOGIN)} className="text-sm text-gray-400 hover:text-white">Back to Login</button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black">
        <img src="https://picsum.photos/seed/bg/1920/1080" className="w-full h-full object-cover opacity-20 blur-xl" />
      </div>
      
      <div className="relative z-10 bg-dark-card/90 backdrop-blur-xl border border-gray-800 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
         <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-900/50">
                P
            </div>
         </div>
         {renderContent()}
      </div>
    </div>
  );
};

export default AuthPages;
