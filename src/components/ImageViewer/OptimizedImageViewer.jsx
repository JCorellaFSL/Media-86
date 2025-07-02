import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MdImage, MdZoomIn, MdZoomOut, MdCenterFocusStrong } from "react-icons/md";
import { useImageCache } from '../../hooks/useImageCache';
import LoadingSpinner from '../LoadingSpinner';

const OptimizedImageViewer = ({ 
  currentImagePath, 
  currentImage,
  currentImageIndex,
  imageFiles,
  currentDirectory,
  imageKey,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);

  // Use image cache
  const imageCache = useImageCache(100); // Cache up to 100 images

  // Preload adjacent images
  useEffect(() => {
    if (currentImageIndex >= 0 && imageFiles.length > 0 && currentDirectory) {
      imageCache.preloadAdjacentImages(
        currentImageIndex, 
        imageFiles, 
        currentDirectory, 
        imageKey
      );
    }
  }, [currentImageIndex, imageFiles, currentDirectory, imageKey, imageCache]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setImageError(false);
  }, [currentImagePath]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (!imageLoaded) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, [imageLoaded]);

  // Mouse drag for panning
  const handleMouseDown = useCallback((e) => {
    if (zoom <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [zoom, position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  }, [zoom, position]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Image load handlers
  const handleImageLoad = useCallback((e) => {
    setImageLoaded(true);
    setImageError(false);
    
    const img = e.target;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // Memoized transform style
  const imageStyle = useMemo(() => ({
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
  }), [position.x, position.y, zoom, isDragging]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageLoaded) return;
      
      switch(e.key) {
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageLoaded, zoomIn, zoomOut, resetZoom]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!currentImagePath) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
            <MdImage className="text-gray-400" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Select an image to get started</h3>
            <p className="text-gray-400 mb-4">Use the sidebar to open an image file.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col bg-gray-900 relative overflow-hidden"
    >
      {/* Zoom controls */}
      {imageLoaded && (
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button
            onClick={zoomIn}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Zoom In (+)"
          >
            <MdZoomIn size={20} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Zoom Out (-)"
          >
            <MdZoomOut size={20} />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Reset Zoom (0)"
          >
            <MdCenterFocusStrong size={20} />
          </button>
        </div>
      )}

      {/* Image info overlay */}
      {imageLoaded && imageDimensions.width > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
          <div>{imageDimensions.width} × {imageDimensions.height}</div>
          <div className="text-xs text-gray-300 mt-1">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      )}

      {/* Main image container */}
      <div className="flex-1 flex items-center justify-center relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <LoadingSpinner size={40} className="mb-4" />
              <p className="text-gray-400">Loading image...</p>
            </div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <MdImage size={48} className="mx-auto mb-4" />
              <p>Failed to load image</p>
              <p className="text-sm mt-2">{currentImage}</p>
            </div>
          </div>
        )}

        <img
          ref={imageRef}
          src={currentImagePath}
          alt={currentImage}
          className={`max-w-full max-h-full object-contain select-none ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={imageStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          draggable={false}
        />
      </div>

      {/* Cache status (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/50 text-white px-2 py-1 rounded text-xs">
          Cache: {imageCache.cacheSize}/{imageCache.getCacheStats().maxSize}
          {imageCache.preloadingCount > 0 && (
            <span className="ml-2 text-blue-400">
              Preloading: {imageCache.preloadingCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedImageViewer; 