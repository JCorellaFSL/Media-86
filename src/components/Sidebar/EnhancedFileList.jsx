import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MdSelectAll,
  MdViewList,
  MdViewModule,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdImage,
} from "react-icons/md";
import { invoke } from "@tauri-apps/api/core";
import LoadingSpinner from '../LoadingSpinner';

const EnhancedFileList = ({
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
  const [thumbnails, setThumbnails] = useState(new Map());
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [thumbnailCache, setThumbnailCache] = useState(new Map());

  // Generate thumbnails for grid view
  const generateThumbnails = useCallback(async (files) => {
    if (files.length === 0 || !currentDirectory) return;

    setLoadingThumbnails(true);
    
    try {
      console.log('Generating thumbnails for files:', files);
      console.log('Current directory:', currentDirectory);
      
      // Generate thumbnails using Rust backend
      const thumbnailData = await invoke('generate_thumbnails_batch', {
        directory: currentDirectory,
        filenames: files,
        maxSize: 150
      });

      console.log('Received thumbnail data:', thumbnailData);

      // Process thumbnail data
      const newThumbnails = new Map();

      thumbnailData.forEach(data => {
        const thumbnailUrl = `data:image/jpeg;base64,${data.thumbnail}`;
        const thumbData = {
          url: thumbnailUrl,
          width: data.width,
          height: data.height,
          fileSize: data.file_size || data.fileSize // Handle both naming conventions
        };
        newThumbnails.set(data.filename, thumbData);
        console.log('Created thumbnail for:', data.filename, thumbData);
      });

      setThumbnails(newThumbnails);
      setThumbnailCache(newThumbnails);
      
    } catch (error) {
      console.error('Failed to generate thumbnails:', error);
    } finally {
      setLoadingThumbnails(false);
    }
  }, [currentDirectory]);

  // Generate thumbnails when switching to grid view or when files change
  useEffect(() => {
    if (viewMode === 'grid' && imageFiles.length > 0) {
      generateThumbnails(imageFiles);
    }
  }, [viewMode, imageFiles, generateThumbnails]);

  // Memoized file size formatter
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Memoized thumbnail component
  const ThumbnailImage = React.memo(({ file, index, thumbnail }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <div
        className={`relative group cursor-pointer rounded overflow-hidden border-2 transition-all duration-200 ${
          index === currentImageIndex 
            ? 'border-blue-500 ring-2 ring-blue-300' 
            : 'border-transparent hover:border-gray-500'
        }`}
        onClick={() => onSelectImage(index)}
      >
        {thumbnail && !imageError ? (
          <>
            <img
              src={thumbnail.url}
              alt={file}
              className={`w-full h-20 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <LoadingSpinner size={16} />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-20 bg-gray-700 flex items-center justify-center">
            <MdImage size={24} className="text-gray-400" />
          </div>
        )}
        
        {/* Selection checkbox */}
        <div
          className="absolute top-1 left-1 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFileSelection(file);
          }}
        >
          {isFileSelected(file) ? (
            <MdCheckBox size={20} className="text-blue-500 bg-white/90 rounded shadow" />
          ) : (
            <MdCheckBoxOutlineBlank 
              size={20} 
              className="text-white bg-black/60 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          )}
        </div>

        {/* File info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-[10px] truncate font-medium">{file}</p>
          {thumbnail && (
            <div className="flex justify-between text-[9px] text-gray-300 mt-1">
              <span>{thumbnail.width}×{thumbnail.height}</span>
              <span>{formatFileSize(thumbnail.fileSize)}</span>
            </div>
          )}
        </div>

        {/* Current image indicator */}
        {index === currentImageIndex && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
        )}
      </div>
    );
  });

  return (
    <div>
      <p className="text-sm text-gray-300 mb-2">
        Images found: {imageFiles.length}
        {loadingThumbnails && viewMode === 'grid' && (
          <span className="ml-2 text-blue-400">
            <LoadingSpinner size={12} className="inline mr-1" />
            Generating thumbnails...
          </span>
        )}
      </p>
      
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
            className={`p-1 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <MdViewList size={18} />
          </button>
          <button 
            onClick={onSetGridView} 
            className={`p-1 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
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
              key={`${file}-${index}`}
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
              {index === currentImageIndex && (
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {imageFiles.map((file, index) => (
              <ThumbnailImage
                key={`${file}-${index}`}
                file={file}
                index={index}
                thumbnail={thumbnails.get(file)}
              />
            ))}
          </div>
          
          {loadingThumbnails && (
            <div className="flex items-center justify-center py-4 text-gray-400">
              <LoadingSpinner size={20} className="mr-2" />
              <span className="text-sm">Processing thumbnails...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedFileList; 