import { useState, useCallback, useRef, useEffect } from 'react';

export const useAdvancedZoom = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoomMode, setZoomMode] = useState('auto'); // auto, fitWidth, fitHeight, actualSize, custom
  
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef(null);

  // Zoom constraints
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10;
  const ZOOM_STEP = 0.1;

  // Calculate fit-to-width zoom
  const calculateFitToWidth = useCallback(() => {
    if (!imageNaturalSize.width || !containerSize.width) return 1;
    return Math.min(containerSize.width / imageNaturalSize.width, MAX_ZOOM);
  }, [imageNaturalSize.width, containerSize.width]);

  // Calculate fit-to-height zoom
  const calculateFitToHeight = useCallback(() => {
    if (!imageNaturalSize.height || !containerSize.height) return 1;
    return Math.min(containerSize.height / imageNaturalSize.height, MAX_ZOOM);
  }, [imageNaturalSize.height, containerSize.height]);

  // Calculate auto-fit zoom (fit entire image in container)
  const calculateAutoFit = useCallback(() => {
    if (!imageNaturalSize.width || !imageNaturalSize.height || !containerSize.width || !containerSize.height) return 1;
    
    const widthRatio = containerSize.width / imageNaturalSize.width;
    const heightRatio = containerSize.height / imageNaturalSize.height;
    
    return Math.min(widthRatio, heightRatio, MAX_ZOOM);
  }, [imageNaturalSize, containerSize]);

  // Apply zoom mode
  const applyZoomMode = useCallback((mode) => {
    let newZoom = 1;
    
    switch (mode) {
      case 'fitWidth':
        newZoom = calculateFitToWidth();
        break;
      case 'fitHeight':
        newZoom = calculateFitToHeight();
        break;
      case 'actualSize':
        newZoom = 1;
        break;
      case 'auto':
        newZoom = calculateAutoFit();
        break;
      default:
        return; // Keep current zoom for custom mode
    }

    setZoom(newZoom);
    setZoomMode(mode);
    
    // Reset pan when changing zoom modes
    if (mode !== 'custom') {
      setPan({ x: 0, y: 0 });
    }
  }, [calculateFitToWidth, calculateFitToHeight, calculateAutoFit]);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate zoom point relative to image center
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));
    
    if (newZoom !== zoom) {
      // Adjust pan to zoom toward mouse position
      const zoomChange = newZoom / zoom;
      const newPanX = pan.x - (mouseX * (zoomChange - 1));
      const newPanY = pan.y - (mouseY * (zoomChange - 1));
      
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
      setZoomMode('custom');
    }
  }, [zoom, pan]);

  // Handle mouse/touch pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    
    e.preventDefault();
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
    
    e.preventDefault();
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
    setZoom(newZoom);
    setZoomMode('custom');
  }, [zoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
    setZoom(newZoom);
    setZoomMode('custom');
  }, [zoom]);

  const resetZoom = useCallback(() => {
    applyZoomMode('auto');
  }, [applyZoomMode]);

  const setActualSize = useCallback(() => {
    applyZoomMode('actualSize');
  }, [applyZoomMode]);

  const fitToWidth = useCallback(() => {
    applyZoomMode('fitWidth');
  }, [applyZoomMode]);

  const fitToHeight = useCallback(() => {
    applyZoomMode('fitHeight');
  }, [applyZoomMode]);

  // Update image natural size when image loads
  const handleImageLoad = useCallback((img) => {
    setImageNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }, []);

  // Update container size
  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  // Auto-fit when image or container size changes
  useEffect(() => {
    if (zoomMode === 'auto' && imageNaturalSize.width && imageNaturalSize.height && containerSize.width && containerSize.height) {
      const autoZoom = calculateAutoFit();
      setZoom(autoZoom);
      setPan({ x: 0, y: 0 });
    }
  }, [imageNaturalSize, containerSize, zoomMode, calculateAutoFit]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate transform style
  const getTransformStyle = useCallback(() => {
    return {
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: 'center center',
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    };
  }, [pan, zoom, isDragging]);

  // Get zoom percentage
  const getZoomPercentage = useCallback(() => {
    return Math.round(zoom * 100);
  }, [zoom]);

  // Check if image fits in container
  const doesImageFit = useCallback(() => {
    if (!imageNaturalSize.width || !imageNaturalSize.height || !containerSize.width || !containerSize.height) {
      return true;
    }
    
    const scaledWidth = imageNaturalSize.width * zoom;
    const scaledHeight = imageNaturalSize.height * zoom;
    
    return scaledWidth <= containerSize.width && scaledHeight <= containerSize.height;
  }, [imageNaturalSize, containerSize, zoom]);

  return {
    // State
    zoom,
    pan,
    zoomMode,
    isDragging,
    imageNaturalSize,
    containerSize,
    
    // Refs
    containerRef,
    
    // Event handlers
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleImageLoad,
    updateContainerSize,
    
    // Zoom controls
    zoomIn,
    zoomOut,
    resetZoom,
    setActualSize,
    fitToWidth,
    fitToHeight,
    
    // Utilities
    getTransformStyle,
    getZoomPercentage,
    doesImageFit,
    applyZoomMode,
    
    // Constants
    MIN_ZOOM,
    MAX_ZOOM,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
  };
}; 