import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const DirectoryInfo = ({ currentDirectory, isDirectoryLoading }) => {
  if (isDirectoryLoading) {
    return (
      <div className="mb-4 p-3 bg-gray-700 rounded-lg flex items-center space-x-3">
        <LoadingSpinner size={20} />
        <div>
          <p className="text-xs text-gray-400 mb-1">Loading Directory</p>
          <p className="text-sm text-gray-200">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!currentDirectory) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
      <p className="text-xs text-gray-400 mb-1">Current Folder</p>
      <p className="text-sm text-gray-200 break-all">{currentDirectory}</p>
    </div>
  );
};

export default DirectoryInfo; 