
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] bg-brand-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-brand-900/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <i className="fa-solid fa-check-circle"></i>
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

export default Toast;
