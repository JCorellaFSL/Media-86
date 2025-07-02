import { useState, useCallback, useRef, useEffect } from 'react';

export const useImageCache = (maxCacheSize = 50) => {
  const [cache, setCache] = useState(new Map());
  const [preloadingImages, setPreloadingImages] = useState(new Set());
  const cacheRef = useRef(cache);
  const loadingRef = useRef(new Set());

  // Update ref when cache changes
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const getCachedImage = useCallback((imagePath) => {
    return cacheRef.current.get(imagePath);
  }, []);

  const isCached = useCallback((imagePath) => {
    return cacheRef.current.has(imagePath);
  }, []);

  const isPreloading = useCallback((imagePath) => {
    return loadingRef.current.has(imagePath);
  }, []);

  const preloadImage = useCallback((imagePath) => {
    if (!imagePath || isCached(imagePath) || isPreloading(imagePath)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      loadingRef.current.add(imagePath);
      setPreloadingImages(prev => new Set([...prev, imagePath]));

      const img = new Image();
      
      img.onload = () => {
        // Implement LRU cache eviction
        setCache(prevCache => {
          const newCache = new Map(prevCache);
          
          // Remove oldest entries if cache is full
          if (newCache.size >= maxCacheSize) {
            const oldestKey = newCache.keys().next().value;
            newCache.delete(oldestKey);
          }
          
          newCache.set(imagePath, {
            src: imagePath,
            width: img.naturalWidth,
            height: img.naturalHeight,
            loaded: true,
            timestamp: Date.now()
          });
          
          return newCache;
        });

        loadingRef.current.delete(imagePath);
        setPreloadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imagePath);
          return newSet;
        });
        
        resolve(img);
      };

      img.onerror = (error) => {
        loadingRef.current.delete(imagePath);
        setPreloadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imagePath);
          return newSet;
        });
        reject(error);
      };

      img.src = imagePath;
    });
  }, [isCached, isPreloading, maxCacheSize]);

  const preloadAdjacentImages = useCallback(async (currentIndex, imageFiles, currentDirectory, imageKey) => {
    if (!imageFiles || imageFiles.length === 0) return;

    const { convertFileSrc } = await import("@tauri-apps/api/core");
    
    // Preload current, next, and previous images
    const indicesToPreload = [
      currentIndex, // Current image (highest priority)
      currentIndex + 1 < imageFiles.length ? currentIndex + 1 : 0, // Next image
      currentIndex - 1 >= 0 ? currentIndex - 1 : imageFiles.length - 1, // Previous image
    ];

    const preloadPromises = indicesToPreload.map(index => {
      if (index < 0 || index >= imageFiles.length) return Promise.resolve();
      
      const imagePath = `${convertFileSrc(currentDirectory + '/' + imageFiles[index])}?v=${imageKey}`;
      return preloadImage(imagePath).catch(err => {
        console.warn(`Failed to preload image at index ${index}:`, err);
      });
    });

    try {
      await Promise.all(preloadPromises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setPreloadingImages(new Set());
    loadingRef.current.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      maxSize: maxCacheSize,
      preloading: preloadingImages.size,
      usage: Math.round((cacheRef.current.size / maxCacheSize) * 100)
    };
  }, [maxCacheSize, preloadingImages.size]);

  return {
    getCachedImage,
    isCached,
    isPreloading,
    preloadImage,
    preloadAdjacentImages,
    clearCache,
    getCacheStats,
    cacheSize: cache.size,
    preloadingCount: preloadingImages.size,
  };
}; 