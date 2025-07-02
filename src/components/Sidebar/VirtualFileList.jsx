import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FixedSizeList as List, FixedSizeGrid as Grid } from 'react-window';
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

const VirtualFileList = ({
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
  const [containerDimensions, setContainerDimensions] = useState({ width: 300, height: 400 });

  // Constants for virtual scrolling
  const LIST_ITEM_HEIGHT = 40;
  const GRID_ITEM_HEIGHT = 100;
  const GRID_ITEM_WIDTH = 90;
  const GRID_COLUMNS = Math.floor(containerDimensions.width / GRID_ITEM_WIDTH);

  // Batch thumbnail generation for visible items
  const generateThumbnailsBatch = useCallback(async (files, startIndex = 0, batchSize = 20) => {
    if (files.length === 0 || !currentDirectory) return;

    const batch = files.slice(startIndex, startIndex + batchSize);
    const uncachedFiles = batch.filter(file => !thumbnailCache.has(file));
    
    if (uncachedFiles.length === 0) return;

    try {
      const thumbnailData = await invoke('generate_thumbnails_batch', {
        directory: currentDirectory,
        filenames: uncachedFiles,
        maxSize: 80 // Smaller thumbnails for better performance
      });

      const newThumbnails = new Map(thumbnails);
      const newCache = new Map(thumbnailCache);

      thumbnailData.forEach(data => {
        const thumbnailUrl = `data:image/jpeg;base64,${data.thumbnail}`;
        const thumbData = {
          url: thumbnailUrl,
          width: data.width,
          height: data.height,
          fileSize: data.file_size
        };
        newThumbnails.set(data.filename, thumbData);
        newCache.set(data.filename, thumbData);
      });

      setThumbnails(newThumbnails);
      setThumbnailCache(newCache);
      
    } catch (error) {
      console.error('Failed to generate thumbnail batch:', error);
    }
  }, [currentDirectory, thumbnails, thumbnailCache]);

  // Progressive thumbnail loading for grid view
  useEffect(() => {
    if (viewMode === 'grid' && imageFiles.length > 0) {
      setLoadingThumbnails(true);
      
      // Load thumbnails in batches
      const loadThumbnailsProgressively = async () => {
        const batchSize = 20;
        for (let i = 0; i < imageFiles.length; i += batchSize) {
          await generateThumbnailsBatch(imageFiles, i, batchSize);
          // Small delay between batches to keep UI responsive
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        setLoadingThumbnails(false);
      };

      loadThumbnailsProgressively();
    }
  }, [viewMode, imageFiles, generateThumbnailsBatch]);

  // Memoized file size formatter
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // List view item renderer
  const ListItem = React.memo(({ index, style }) => {
    const file = imageFiles[index];
    if (!file) return null;

    return (
      <div style={style}>
        <div 
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
            className="p-1 flex-shrink-0"
          >
            {isFileSelected(file) ? (
              <MdCheckBox size={16} className="text-blue-300" />
            ) : (
              <MdCheckBoxOutlineBlank size={16} />
            )}
          </button>
          <div className="truncate flex-1">{file}</div>
          {index === currentImageIndex && (
            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
          )}
        </div>
      </div>
    );
  });

  // Grid view item renderer
  const GridItem = React.memo(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * GRID_COLUMNS + columnIndex;
    const file = imageFiles[index];
    
    if (!file) {
      return <div style={style}></div>;
    }

    const thumbnail = thumbnails.get(file);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <div style={style}>
        <div className="p-1">
          <div
            className={`relative group cursor-pointer rounded overflow-hidden border-2 transition-all duration-200 ${
              index === currentImageIndex 
                ? 'border-blue-500 ring-1 ring-blue-300' 
                : 'border-transparent hover:border-gray-500'
            }`}
            onClick={() => onSelectImage(index)}
          >
            {thumbnail && !imageError ? (
              <>
                <img
                  src={thumbnail.url}
                  alt={file}
                  className={`w-full h-16 object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <LoadingSpinner size={12} />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-16 bg-gray-700 flex items-center justify-center">
                <MdImage size={20} className="text-gray-400" />
              </div>
            )}
            
            {/* Selection checkbox */}
            <div
              className="absolute top-0.5 left-0.5 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFileSelection(file);
              }}
            >
              {isFileSelected(file) ? (
                <MdCheckBox size={16} className="text-blue-500 bg-white/90 rounded shadow" />
              ) : (
                <MdCheckBoxOutlineBlank 
                  size={16} 
                  className="text-white bg-black/60 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity" 
                />
              )}
            </div>

            {/* File name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <p className="text-white text-[9px] truncate font-medium">{file}</p>
            </div>

            {/* Current image indicator */}
            {index === currentImageIndex && (
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white shadow"></div>
            )}
          </div>
        </div>
      </div>
    );
  });

  // Calculate grid dimensions
  const gridRowCount = Math.ceil(imageFiles.length / GRID_COLUMNS);

  // Get container ref for measuring dimensions
  const containerRef = useCallback((node) => {
    if (node) {
      const updateDimensions = () => {
        const rect = node.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: Math.min(rect.height, 400) // Max height
        });
      };
      
      updateDimensions();
      
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(node);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Auto-scroll to current image
  const listRef = React.useRef();
  const gridRef = React.useRef();

  useEffect(() => {
    if (currentImageIndex >= 0) {
      if (viewMode === 'list' && listRef.current) {
        listRef.current.scrollToItem(currentImageIndex, 'smart');
      } else if (viewMode === 'grid' && gridRef.current) {
        const row = Math.floor(currentImageIndex / GRID_COLUMNS);
        gridRef.current.scrollToItem({ rowIndex: row, columnIndex: 0, align: 'smart' });
      }
    }
  }, [currentImageIndex, viewMode, GRID_COLUMNS]);

  return (
    <div>
      <p className="text-sm text-gray-300 mb-2">
        Images found: {imageFiles.length}
        {loadingThumbnails && viewMode === 'grid' && (
          <span className="ml-2 text-blue-400">
            <LoadingSpinner size={12} className="inline mr-1" />
            Loading thumbnails...
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

      {imageFiles.length > 0 && (
        <div ref={containerRef} className="border border-gray-700 rounded">
          {viewMode === 'list' ? (
            <List
              ref={listRef}
              height={Math.min(containerDimensions.height, 320)}
              itemCount={imageFiles.length}
              itemSize={LIST_ITEM_HEIGHT}
              overscanCount={5}
              className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {ListItem}
            </List>
          ) : (
            <Grid
              ref={gridRef}
              columnCount={GRID_COLUMNS}
              columnWidth={GRID_ITEM_WIDTH}
              height={Math.min(containerDimensions.height, 320)}
              rowCount={gridRowCount}
              rowHeight={GRID_ITEM_HEIGHT}
              overscanRowCount={2}
              overscanColumnCount={1}
              className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {GridItem}
            </Grid>
          )}
        </div>
      )}

      {imageFiles.length > 1000 && (
        <p className="text-xs text-gray-500 mt-2">
          Virtual scrolling active - efficiently rendering {imageFiles.length} items
        </p>
      )}
    </div>
  );
};

export default VirtualFileList; 