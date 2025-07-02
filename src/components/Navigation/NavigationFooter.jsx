import React from 'react';
import { 
  MdChevronLeft, 
  MdChevronRight,
  MdRotateLeft,
  MdRotateRight,
} from "react-icons/md";
import LoadingSpinner from '../LoadingSpinner';

const NavigationFooter = ({ 
  currentImageIndex,
  totalImages,
  onNavigatePrevious,
  onNavigateNext,
  onRotateLeft,
  onRotateRight,
  isRotationLoading,
  hasMultipleImages,
}) => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigatePrevious}
            disabled={!hasMultipleImages}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronLeft size={18} />
          </button>
          <button
            onClick={onRotateLeft}
            disabled={isRotationLoading}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRotationLoading ? <LoadingSpinner size={18} /> : <MdRotateLeft size={18} />}
          </button>
          <button
            onClick={onRotateRight}
            disabled={isRotationLoading}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRotationLoading ? <LoadingSpinner size={18} /> : <MdRotateRight size={18} />}
          </button>
          <button
            onClick={onNavigateNext}
            disabled={!hasMultipleImages}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronRight size={18} />
          </button>
          <span className="text-sm text-gray-400 pl-2">
            Use ← → arrow keys or spacebar to navigate
          </span>
        </div>
        <span className="text-sm font-mono text-gray-300">
          {currentImageIndex + 1} / {totalImages}
        </span>
      </div>
    </footer>
  );
};

export default NavigationFooter; 