import { useState, useCallback, useRef, useEffect } from 'react';

export const useSlideshow = (imageFiles, currentImageIndex, onNavigateNext, onNavigatePrevious) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [interval, setInterval] = useState(3000); // Default 3 seconds
  const [showControls, setShowControls] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(0);

  // Available intervals in milliseconds
  const availableIntervals = [
    { label: '1s', value: 1000 },
    { label: '2s', value: 2000 },
    { label: '3s', value: 3000 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
  ];

  // Update remaining time
  const updateRemainingTime = useCallback(() => {
    if (isPlaying && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, interval - elapsed);
      setRemainingTime(remaining);
      
      if (remaining > 0) {
        timeoutRef.current = setTimeout(updateRemainingTime, 100);
      }
    }
  }, [isPlaying, interval]);

  // Start slideshow
  const startSlideshow = useCallback(() => {
    if (imageFiles.length <= 1) return;
    
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    setRemainingTime(interval);
    updateRemainingTime();
    
    intervalRef.current = setInterval(() => {
      onNavigateNext();
      startTimeRef.current = Date.now();
      setRemainingTime(interval);
    }, interval);
  }, [imageFiles.length, interval, onNavigateNext, updateRemainingTime]);

  // Stop slideshow
  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
    setRemainingTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Toggle slideshow
  const toggleSlideshow = useCallback(() => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }, [isPlaying, startSlideshow, stopSlideshow]);

  // Change interval
  const changeInterval = useCallback((newInterval) => {
    setInterval(newInterval);
    
    // If playing, restart with new interval
    if (isPlaying) {
      stopSlideshow();
      // Use setTimeout to restart after state updates
      setTimeout(() => {
        startSlideshow();
      }, 50);
    }
  }, [isPlaying, stopSlideshow, startSlideshow]);

  // Manual navigation handlers that reset slideshow timer
  const handleNext = useCallback(() => {
    onNavigateNext();
    
    if (isPlaying) {
      // Reset timer
      startTimeRef.current = Date.now();
      setRemainingTime(interval);
      
      // Clear and restart interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          onNavigateNext();
          startTimeRef.current = Date.now();
          setRemainingTime(interval);
        }, interval);
      }
    }
  }, [onNavigateNext, isPlaying, interval]);

  const handlePrevious = useCallback(() => {
    onNavigatePrevious();
    
    if (isPlaying) {
      // Reset timer  
      startTimeRef.current = Date.now();
      setRemainingTime(interval);
      
      // Clear and restart interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          onNavigateNext();
          startTimeRef.current = Date.now();
          setRemainingTime(interval);
        }, interval);
      }
    }
  }, [onNavigatePrevious, isPlaying, interval, onNavigateNext]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (!isPlaying || interval === 0) return 0;
    return Math.max(0, Math.min(100, ((interval - remainingTime) / interval) * 100));
  }, [isPlaying, interval, remainingTime]);

  // Format time display
  const formatTime = useCallback((ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  }, []);

  // Get current interval label
  const getCurrentIntervalLabel = useCallback(() => {
    const found = availableIntervals.find(item => item.value === interval);
    return found ? found.label : `${interval / 1000}s`;
  }, [interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Stop slideshow when reaching end (optional behavior)
  useEffect(() => {
    if (isPlaying && imageFiles.length > 0 && currentImageIndex === imageFiles.length - 1) {
      // Option: stop at end or continue from beginning
      // Currently continues from beginning (default behavior)
    }
  }, [isPlaying, imageFiles.length, currentImageIndex]);

  // Keyboard shortcuts for slideshow
  const handleKeyPress = useCallback((e) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        toggleSlideshow();
        break;
      case 'ArrowRight':
        if (isPlaying) {
          e.preventDefault();
          handleNext();
        }
        break;
      case 'ArrowLeft':
        if (isPlaying) {
          e.preventDefault();
          handlePrevious();
        }
        break;
      case 'Escape':
        if (isPlaying) {
          e.preventDefault();
          stopSlideshow();
        }
        break;
    }
  }, [toggleSlideshow, handleNext, handlePrevious, stopSlideshow, isPlaying]);

  // Auto-hide controls timer
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000); // Hide after 3 seconds of inactivity
    }
  }, [isPlaying]);

  // Mouse move handler to show controls
  const handleMouseMove = useCallback(() => {
    if (isPlaying) {
      showControlsTemporarily();
    }
  }, [isPlaying, showControlsTemporarily]);

  return {
    // State
    isPlaying,
    interval,
    showControls,
    remainingTime,
    controlsVisible: controlsVisible && showControls,
    
    // Controls
    startSlideshow,
    stopSlideshow,
    toggleSlideshow,
    changeInterval,
    toggleControls,
    
    // Navigation with slideshow awareness
    handleNext,
    handlePrevious,
    
    // Event handlers
    handleKeyPress,
    handleMouseMove,
    showControlsTemporarily,
    
    // Utilities
    getProgress,
    formatTime,
    getCurrentIntervalLabel,
    availableIntervals,
    
    // Status
    canPlay: imageFiles.length > 1,
    hasImages: imageFiles.length > 0,
    isLastImage: currentImageIndex === imageFiles.length - 1,
    isFirstImage: currentImageIndex === 0,
  };
}; 