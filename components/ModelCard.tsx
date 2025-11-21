
import React from 'react';
import { Model } from '../types';

interface ModelCardProps {
  model: Model;
  onClick?: (model: Model) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  return (
    <div 
      onClick={() => onClick?.(model)}
      className="flex flex-col items-center group cursor-pointer bg-dark-card/50 p-4 rounded-xl hover:bg-dark-card transition-colors border border-transparent hover:border-gray-800 relative"
    >
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-brand-500 to-purple-600 mb-3 group-hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all duration-300">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-dark-bg relative">
          <img src={model.thumbnail} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors flex items-center justify-center gap-2">
           {model.name}
           {model.rank <= 3 && <i className="fa-solid fa-crown text-yellow-500 text-xs"></i>}
        </h3>
        <span className="text-gray-500 text-xs font-medium">{model.videoCount} Videos</span>
      </div>
      
      <button 
        className="mt-3 text-xs bg-gray-800 hover:bg-brand-600 text-white px-4 py-1.5 rounded-full transition-all group-hover:shadow-lg shadow-black/50"
      >
         View Profile
      </button>
    </div>
  );
};

export default ModelCard;
