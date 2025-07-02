import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MdClose, MdSwapHoriz, MdSync, MdSyncDisabled } from 'react-icons/md';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useAdvancedZoom } from '../../hooks/useAdvancedZoom';

const ImageComparison = ({ 
  leftImage, 
  rightImage, 
  onClose, 
  currentDirectory,
  imageKey 
}) => {
  const [syncZoom, setSyncZoom] = useState(true);
  const [leftImageLoaded, setLeftImageLoaded] = useState(false);
  const [rightImageLoaded, setRightImageLoaded] = useState(false);
  
  // Separate zoom controls for each image
  const leftZoom = useAdvancedZoom();
  const rightZoom = useAdvancedZoom();
  
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);

  // Convert file paths
  const getImagePath = useCallback((filename) => {
    if (!filename || !currentDirectory) return null;
    return `${convertFileSrc(currentDirectory + '/' + filename)}?v=${imageKey}`;
  }, [currentDirectory, imageKey]);

  const leftImagePath = getImagePath(leftImage);
  const rightImagePath = getImagePath(rightImage);

  // Sync zoom and pan when enabled
  useEffect(() => {
    if (syncZoom && leftZoom.zoom !== rightZoom.zoom) {
      rightZoom.applyZoomMode('custom');
      // Note: This is a simplified sync - in a full implementation,
      // you'd want to create a more sophisticated sync mechanism
    }
  }, [syncZoom, leftZoom.zoom, rightZoom.zoom, rightZoom]);

  // Handle image loading
  const handleLeftImageLoad = useCallback((e) => {
    setLeftImageLoaded(true);
    leftZoom.handleImageLoad(e.target);
    leftZoom.updateContainerSize();
  }, [leftZoom]);

  const handleRightImageLoad = useCallback((e) => {
    setRightImageLoaded(true);
    rightZoom.handleImageLoad(e.target);
    rightZoom.updateContainerSize();
  }, [rightZoom]);

  // Swap images
  const swapImages = useCallback(() => {
    // This would be handled by parent component
    // For now, just show the concept
    console.log('Swap images functionality would be implemented here');
  }, []);

  // Toggle sync
  const toggleSync = useCallback(() => {
    setSyncZoom(prev => !prev);
  }, []);

  // Sync both images to same zoom level
  const syncBothImages = useCallback(() => {
    if (leftZoom.zoom !== rightZoom.zoom) {
      rightZoom.applyZoomMode('custom');
      // Apply left zoom state to right
      // This is simplified - full implementation would sync all zoom properties
    }
  }, [leftZoom.zoom, rightZoom]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      leftZoom.updateContainerSize();
      rightZoom.updateContainerSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftZoom, rightZoom]);

  // Keyboard shortcuts for comparison mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 's':
        case 'S':
          toggleSync();
          break;
        case 'Tab':
          e.preventDefault();
          swapImages();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose, toggleSync, swapImages]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">Image Comparison</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{leftImage}</span>
            <MdSwapHoriz size={16} />
            <span>{rightImage}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sync toggle */}
          <button
            onClick={toggleSync}
            className={`p-2 rounded transition-colors ${
              syncZoom 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={syncZoom ? 'Disable sync' : 'Enable sync'}
          >
            {syncZoom ? <MdSync size={20} /> : <MdSyncDisabled size={20} />}
          </button>
          
          {/* Swap button */}
          <button
            onClick={swapImages}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Swap images (Tab)"
          >
            <MdSwapHoriz size={20} />
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Close comparison (Esc)"
          >
            <MdClose size={20} />
          </button>
        </div>
      </div>

      {/* Comparison area */}
      <div className="flex-1 flex">
        {/* Left image */}
        <div className="flex-1 relative border-r border-gray-700">
          <div className="absolute inset-0 overflow-hidden bg-gray-800">
            <div
              ref={leftZoom.containerRef}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              onWheel={leftZoom.handleWheel}
              onMouseDown={leftZoom.handleMouseDown}
              onTouchStart={leftZoom.handleTouchStart}
              onTouchMove={leftZoom.handleTouchMove}
              onTouchEnd={leftZoom.handleTouchEnd}
            >
              {leftImagePath ? (
                <img
                  ref={leftImageRef}
                  src={leftImagePath}
                  alt={leftImage}
                  style={leftZoom.getTransformStyle()}
                  className="max-w-none select-none"
                  onLoad={handleLeftImageLoad}
                  onError={() => setLeftImageLoaded(false)}
                />
              ) : (
                <div className="text-gray-500">No image selected</div>
              )}
            </div>
          </div>
          
          {/* Left image info */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            <div>{leftImage}</div>
            <div className="text-xs text-gray-300">
              {leftZoom.getZoomPercentage()}% • {leftZoom.zoomMode}
            </div>
          </div>
          
          {/* Left zoom controls */}
          <div className="absolute top-4 left-4 flex flex-col space-y-1 bg-black bg-opacity-75 rounded p-2">
            <button
              onClick={leftZoom.zoomIn}
              disabled={!leftZoom.canZoomIn}
              className="p-1 text-white hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              +
            </button>
            <button
              onClick={leftZoom.zoomOut}
              disabled={!leftZoom.canZoomOut}
              className="p-1 text-white hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              -
            </button>
            <button
              onClick={leftZoom.resetZoom}
              className="p-1 text-white hover:bg-gray-700 text-xs"
            >
              Fit
            </button>
            <button
              onClick={leftZoom.setActualSize}
              className="p-1 text-white hover:bg-gray-700 text-xs"
            >
              1:1
            </button>
          </div>
        </div>

        {/* Right image */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-hidden bg-gray-800">
            <div
              ref={rightZoom.containerRef}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              onWheel={rightZoom.handleWheel}
              onMouseDown={rightZoom.handleMouseDown}
              onTouchStart={rightZoom.handleTouchStart}
              onTouchMove={rightZoom.handleTouchMove}
              onTouchEnd={rightZoom.handleTouchEnd}
            >
              {rightImagePath ? (
                <img
                  ref={rightImageRef}
                  src={rightImagePath}
                  alt={rightImage}
                  style={rightZoom.getTransformStyle()}
                  className="max-w-none select-none"
                  onLoad={handleRightImageLoad}
                  onError={() => setRightImageLoaded(false)}
                />
              ) : (
                <div className="text-gray-500">No image selected</div>
              )}
            </div>
          </div>
          
          {/* Right image info */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            <div>{rightImage}</div>
            <div className="text-xs text-gray-300">
              {rightZoom.getZoomPercentage()}% • {rightZoom.zoomMode}
            </div>
          </div>
          
          {/* Right zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-1 bg-black bg-opacity-75 rounded p-2">
            <button
              onClick={rightZoom.zoomIn}
              disabled={!rightZoom.canZoomIn}
              className="p-1 text-white hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              +
            </button>
            <button
              onClick={rightZoom.zoomOut}
              disabled={!rightZoom.canZoomOut}
              className="p-1 text-white hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              -
            </button>
            <button
              onClick={rightZoom.resetZoom}
              className="p-1 text-white hover:bg-gray-700 text-xs"
            >
              Fit
            </button>
            <button
              onClick={rightZoom.setActualSize}
              className="p-1 text-white hover:bg-gray-700 text-xs"
            >
              1:1
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 p-2 text-center text-sm text-gray-400 border-t border-gray-700">
        <span className="mr-4">Scroll to zoom</span>
        <span className="mr-4">Drag to pan</span>
        <span className="mr-4">Tab to swap</span>
        <span className="mr-4">S to toggle sync</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};

export default ImageComparison; 