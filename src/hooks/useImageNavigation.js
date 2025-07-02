import { useState, useCallback } from 'react';

export const useImageNavigation = (imageFiles) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigateNext = useCallback(() => {
    if (imageFiles.length === 0) return;
    setCurrentImageIndex(prev => 
      prev === imageFiles.length - 1 ? 0 : prev + 1
    );
  }, [imageFiles.length]);

  const navigatePrevious = useCallback(() => {
    if (imageFiles.length === 0) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? imageFiles.length - 1 : prev - 1
    );
  }, [imageFiles.length]);

  const selectImage = useCallback((index) => {
    if (index >= 0 && index < imageFiles.length) {
      setCurrentImageIndex(index);
    }
  }, [imageFiles.length]);

  const currentImage = imageFiles[currentImageIndex] || null;

  return {
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
    navigateNext,
    navigatePrevious,
    selectImage,
    hasImages: imageFiles.length > 0,
    totalImages: imageFiles.length,
  };
}; 