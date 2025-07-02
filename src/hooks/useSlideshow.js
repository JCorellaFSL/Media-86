import { useState, useCallback, useRef, useEffect } from 'react';

export const useSlideshow = (imageFiles, currentImageIndex, onNavigateNext, onNavigatePrevious) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(3000); // Fixed naming conflict
  const [showControls, setShowControls] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(0);
  const onNavigateNextRef = useRef(onNavigateNext);
  onNavigateNextRef.current = onNavigateNext;

  // Available intervals in milliseconds
  const availableIntervals = [
    { label: '1s', value: 1000 },
    { label: '2s', value: 2000 },
    { label: '3s', value: 3000 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
  ];

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Update remaining time
  const updateRemainingTime = useCallback(() => {
    if (!isPlaying || !startTimeRef.current) {
      return;
    }
    
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, slideshowInterval - elapsed);
    setRemainingTime(remaining);

    // Continue updating while playing
    if (isPlaying && remaining > 0) {
      timeoutRef.current = setTimeout(updateRemainingTime, 100);
    }
  }, [isPlaying, slideshowInterval]);

  // Start timer for current image
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setRemainingTime(slideshowInterval);
    updateRemainingTime();
  }, [slideshowInterval, updateRemainingTime]);

  // Setup slideshow interval
  useEffect(() => {
    if (!isPlaying || imageFiles.length <= 1) {
      clearAllTimers();
      setRemainingTime(0);
      return;
    }

    // Start timer for current image
    startTimer();

    // Set up automatic navigation
    intervalRef.current = setInterval(() => {
      onNavigateNextRef.current();
      startTimer();
    }, slideshowInterval);

    return clearAllTimers;
  }, [isPlaying, slideshowInterval, imageFiles.length, startTimer, clearAllTimers]);

  // Control functions
  const startSlideshow = useCallback(() => {
    if (imageFiles.length > 1) {
      setIsPlaying(true);
    }
  }, [imageFiles.length]);

  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggleSlideshow = useCallback(() => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }, [isPlaying, startSlideshow, stopSlideshow]);

  const changeInterval = useCallback((newInterval) => {
    if (newInterval !== slideshowInterval) {
      setSlideshowInterval(newInterval);
    }
  }, [slideshowInterval]);

  // Manual navigation with slideshow reset
  const handleNext = useCallback(() => {
    onNavigateNext();
    if (isPlaying) {
      clearAllTimers();
      startTimer();
      intervalRef.current = setInterval(() => {
        onNavigateNextRef.current();
        startTimer();
      }, slideshowInterval);
    }
  }, [onNavigateNext, isPlaying, slideshowInterval, clearAllTimers, startTimer]);

  const handlePrevious = useCallback(() => {
    onNavigatePrevious();
    if (isPlaying) {
      clearAllTimers();
      startTimer();
      intervalRef.current = setInterval(() => {
        onNavigateNextRef.current();
        startTimer();
      }, slideshowInterval);
    }
  }, [onNavigatePrevious, isPlaying, slideshowInterval, clearAllTimers, startTimer]);

  // Utility functions
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const getProgress = useCallback(() => {
    if (!isPlaying || slideshowInterval === 0) return 0;
    const progress = Math.max(0, Math.min(100, ((slideshowInterval - remainingTime) / slideshowInterval) * 100));
    return isNaN(progress) ? 0 : progress;
  }, [isPlaying, slideshowInterval, remainingTime]);

  const formatTime = useCallback((ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  }, []);

  const getCurrentIntervalLabel = useCallback(() => {
    const found = availableIntervals.find(item => item.value === slideshowInterval);
    return found ? found.label : `${slideshowInterval / 1000}s`;
  }, [slideshowInterval]);

  // Keyboard shortcuts
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

  // Auto-hide controls
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
      }, 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    if (isPlaying) {
      showControlsTemporarily();
    }
  }, [isPlaying, showControlsTemporarily]);

  // Auto-hide controls effect
  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily();
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setControlsVisible(true);
      document.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControlsTemporarily, handleMouseMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [clearAllTimers]);

  return {
    // State
    isPlaying,
    interval: slideshowInterval, // Keep interface consistent
    showControls,
    remainingTime,
    controlsVisible: controlsVisible && showControls,
    
    // Controls
    startSlideshow,
    stopSlideshow,
    toggleSlideshow,
    changeInterval,
    toggleControls,
    
    // Navigation
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