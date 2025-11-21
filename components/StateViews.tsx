
import React from 'react';

interface EmptyViewProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isUltra?: boolean;
}

export const EmptyView: React.FC<EmptyViewProps> = ({ icon, title, description, actionLabel, onAction, isUltra = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-300 w-full h-full min-h-[400px]">
      <div className={`w-24 h-24 ${isUltra ? 'bg-indigo-900/20 border border-indigo-500/30' : 'bg-gray-800/50 border border-gray-700/30'} rounded-full flex items-center justify-center mb-6`}>
        <i className={`fa-solid ${icon} text-4xl ${isUltra ? 'text-indigo-400' : 'text-gray-500'}`}></i>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className={`${isUltra ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-900/20'} text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg transform hover:-translate-y-1`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message = "Something went wrong while loading content.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-300 w-full h-full min-h-[400px]">
      <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-900/50 relative">
        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping opacity-20"></div>
        <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500"></i>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Error Occurred</h3>
      <p className="text-gray-400 max-w-md mb-8 text-sm">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold transition-all border border-gray-700 hover:border-gray-500"
        >
          <i className="fa-solid fa-rotate-right mr-2"></i> Try Again
        </button>
      )}
    </div>
  );
};
