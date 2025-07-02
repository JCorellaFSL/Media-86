import React from 'react';
import { MdDriveFileRenameOutline } from "react-icons/md";
import LoadingSpinner from '../LoadingSpinner';

const NavigationBar = ({ 
  currentImage,
  currentImageIndex,
  totalImages,
  onRename,
  isRenameLoading,
  isDirectoryLoading,
}) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/icon.png" alt="Media-86 Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-white">Media-86</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Utility Buttons */}
          {currentImage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onRename}
                disabled={isRenameLoading || isDirectoryLoading}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Batch Rename Utility"
              >
                {isRenameLoading ? <LoadingSpinner size={16} /> : <MdDriveFileRenameOutline size={16} />}
                <span>Rename</span>
              </button>
            </div>
          )}

          {currentImage && (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 font-medium">{currentImage}</span>
              <span className="text-sm text-gray-400">
                {currentImageIndex + 1} / {totalImages}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar; 