import React from 'react';
import { 
  MdSelectAll,
  MdViewList,
  MdViewModule,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
} from "react-icons/md";
import { convertFileSrc } from "@tauri-apps/api/core";

const FileList = ({
  imageFiles,
  currentImageIndex,
  onSelectImage,
  onToggleFileSelection,
  onSelectAllFiles,
  isFileSelected,
  selectedCount,
  isAllSelected,
  viewMode,
  onSetListView,
  onSetGridView,
  currentDirectory,
}) => {
  return (
    <div>
      <p className="text-sm text-gray-300 mb-2">Images found: {imageFiles.length}</p>
      
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onSelectAllFiles}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <MdSelectAll size={18} />
          <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
        </button>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={onSetListView} 
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            <MdViewList size={18} />
          </button>
          <button 
            onClick={onSetGridView} 
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            <MdViewModule size={18} />
          </button>
        </div>
      </div>
      
      {selectedCount > 0 && (
        <span className="text-sm text-blue-400 mb-2 block">{selectedCount} selected</span>
      )}

      {viewMode === 'list' && (
        <div className="max-h-64 overflow-y-auto">
          {imageFiles.map((file, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 text-xs py-2 px-3 rounded cursor-pointer transition-colors ${
                index === currentImageIndex 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => onSelectImage(index)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFileSelection(file);
                }}
                className="p-1"
              >
                {isFileSelected(file) ? (
                  <MdCheckBox size={16} className="text-blue-300" />
                ) : (
                  <MdCheckBoxOutlineBlank size={16} />
                )}
              </button>
              <div className="truncate flex-1">{file}</div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="max-h-64 overflow-y-auto grid grid-cols-3 gap-2">
          {imageFiles.map((file, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer rounded overflow-hidden border-2 ${
                index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => onSelectImage(index)}
            >
              <img
                src={`${convertFileSrc(currentDirectory + '/' + file)}`}
                alt={file}
                className="w-full h-20 object-cover"
              />
              <div
                className="absolute top-1 left-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFileSelection(file);
                }}
              >
                {isFileSelected(file) ? (
                  <MdCheckBox size={20} className="text-blue-500 bg-white/70 rounded" />
                ) : (
                  <MdCheckBoxOutlineBlank size={20} className="text-white bg-black/50 rounded group-hover:block hidden" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                <p className="text-white text-[10px] truncate">{file}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList; 