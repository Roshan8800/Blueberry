import React from 'react';

interface WarningModalProps {
  onEnter: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-brand-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.6)] animate-pulse">
          <i className="fa-solid fa-exclamation text-4xl"></i>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          AGE VERIFICATION
        </h1>
        
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <p className="text-gray-300 mb-4">
            This website contains age-restricted materials including nudity and explicit depictions of sexual activity. 
          </p>
          <p className="text-gray-300 font-semibold">
            By entering, you affirm that you are at least 18 years of age or the age of majority in the jurisdiction you are accessing the website from.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onEnter}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold text-lg tracking-wide transition-all shadow-lg shadow-brand-900/40 hover:shadow-brand-500/20"
          >
            I AM 18 OR OLDER - ENTER
          </button>
          <a 
            href="https://www.google.com" 
            className="block w-full bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white py-3 rounded-xl font-semibold transition-colors"
          >
            EXIT
          </a>
        </div>
        
        <p className="text-xs text-gray-600">
          Parents: Please consider using filtering software to restrict access to this site.
        </p>
      </div>
    </div>
  );
};

export default WarningModal;