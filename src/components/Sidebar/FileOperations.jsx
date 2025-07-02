import React from 'react';
import { MdImage, MdDescription } from "react-icons/md";
import LoadingSpinner from '../LoadingSpinner';

const FileOperations = ({
  onSelectImageFile,
  onSelectDocumentFile,
  isFileSelectionLoading,
  isDirectoryLoading,
  message,
}) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Open</label>
        <div className="flex">
          <button
            onClick={onSelectImageFile}
            disabled={isFileSelectionLoading || isDirectoryLoading}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-l-md flex items-center justify-center space-x-2 transition-colors"
          >
            {isFileSelectionLoading ? <LoadingSpinner size={18} /> : <MdImage size={18} />}
            <span>Image</span>
          </button>
          <button
            onClick={onSelectDocumentFile}
            disabled={isFileSelectionLoading}
            className="w-1/2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-r-md flex items-center justify-center space-x-2 transition-colors border-l border-gray-500"
          >
            {isFileSelectionLoading ? <LoadingSpinner size={18} /> : <MdDescription size={18} />}
            <span>MD/PDF</span>
          </button>
        </div>
      </div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
};

export default FileOperations; 