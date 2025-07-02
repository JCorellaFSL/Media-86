import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ImageNavigationHook } from '../types';

export const useImageNavigation = (imageFiles: string[]): ImageNavigationHook => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Memoized derived values
  const currentImage = useMemo<string | null>(() => {
    return imageFiles.length > 0 && currentImageIndex >= 0 && currentImageIndex < imageFiles.length
      ? imageFiles[currentImageIndex]
      : null;
  }, [imageFiles, currentImageIndex]);

  const totalImages = useMemo<number>(() => imageFiles.length, [imageFiles.length]);
  
  const hasImages = useMemo<boolean>(() => imageFiles.length > 0, [imageFiles.length]);

  // Navigation functions
  const navigateNext = useCallback((): void => {
    if (imageFiles.length === 0) return;
    
    setCurrentImageIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= imageFiles.length ? 0 : nextIndex;
    });
  }, [imageFiles.length]);

  const navigatePrevious = useCallback((): void => {
    if (imageFiles.length === 0) return;
    
    setCurrentImageIndex(prevIndex => {
      const prevIdx = prevIndex - 1;
      return prevIdx < 0 ? imageFiles.length - 1 : prevIdx;
    });
  }, [imageFiles.length]);

  const selectImage = useCallback((index: number): void => {
    if (index >= 0 && index < imageFiles.length) {
      setCurrentImageIndex(index);
    }
  }, [imageFiles.length]);

  // Reset to first image when file list changes
  const resetToFirstImage = useCallback((): void => {
    if (imageFiles.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [imageFiles.length]);

  // Effect to handle file list changes
  useEffect(() => {
    if (imageFiles.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= imageFiles.length) {
      // If current index is out of bounds, reset to last valid index
      setCurrentImageIndex(imageFiles.length - 1);
    }
  }, [imageFiles.length, currentImageIndex]);

  return {
    currentImage,
    currentImageIndex,
    totalImages,
    hasImages,
    navigateNext,
    navigatePrevious,
    selectImage,
    setCurrentImageIndex,
  };
}; 