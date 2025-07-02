import { useState, useCallback, useRef, useEffect } from 'react';

// Advanced LRU Cache with priority scoring
class AdvancedLRUCache {
  constructor(maxSize = 50, maxMemoryMB = 100) {
    this.maxSize = maxSize;
    this.maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
    this.memoryUsage = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  calculateImageSize(width, height, channels = 4) {
    // Estimate memory usage: width * height * channels (RGBA)
    return width * height * channels;
  }

  calculatePriority(key) {
    const accessCount = this.accessCount.get(key) || 0;
    const lastAccess = this.lastAccess.get(key) || 0;
    const recency = Date.now() - lastAccess;
    
    // Priority formula: frequency / recency (higher is better)
    return accessCount / Math.max(recency / 1000 / 60, 1); // Minutes since last access
  }

  evictLeastPriority() {
    if (this.cache.size === 0) return;

    let lowestPriority = Infinity;
    let evictKey = null;

    for (const key of this.cache.keys()) {
      const priority = this.calculatePriority(key);
      if (priority < lowestPriority) {
        lowestPriority = priority;
        evictKey = key;
      }
    }

    if (evictKey) {
      const item = this.cache.get(evictKey);
      this.memoryUsage -= item.memorySize || 0;
      this.cache.delete(evictKey);
      this.accessCount.delete(evictKey);
      this.lastAccess.delete(evictKey);
    }
  }

  set(key, value) {
    const memorySize = this.calculateImageSize(value.width || 0, value.height || 0);
    
    // Evict items if we're over limits
    while ((this.cache.size >= this.maxSize || this.memoryUsage + memorySize > this.maxMemoryBytes) 
           && this.cache.size > 0) {
      this.evictLeastPriority();
    }

    const item = {
      ...value,
      memorySize,
      timestamp: Date.now()
    };

    this.cache.set(key, item);
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    this.memoryUsage += memorySize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      this.hitCount++;
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
      this.lastAccess.set(key, Date.now());
      return item;
    } else {
      this.missCount++;
      return null;
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      this.memoryUsage -= item.memorySize || 0;
      this.cache.delete(key);
      this.accessCount.delete(key);
      this.lastAccess.delete(key);
      return true;
    }
    return false;
  }

  clear() {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
    this.memoryUsage = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsageMB: Math.round(this.memoryUsage / 1024 / 1024 * 100) / 100,
      maxMemoryMB: this.maxMemoryBytes / 1024 / 1024,
      hitRate: totalRequests > 0 ? Math.round(this.hitCount / totalRequests * 100) : 0,
      hitCount: this.hitCount,
      missCount: this.missCount,
    };
  }
}

export const useAdvancedImageCache = (maxCacheSize = 50, maxMemoryMB = 100) => {
  const [preloadingImages, setPreloadingImages] = useState(new Set());
  const [cacheStats, setCacheStats] = useState({});
  const cacheRef = useRef(new AdvancedLRUCache(maxCacheSize, maxMemoryMB));
  const loadingRef = useRef(new Set());
  const preloadQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = () => {
      setCacheStats(cacheRef.current.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Persist cache to localStorage (metadata only, not images)
  const persistCacheMetadata = useCallback(() => {
    try {
      const metadata = {
        accessCount: Array.from(cacheRef.current.accessCount.entries()),
        lastAccess: Array.from(cacheRef.current.lastAccess.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem('media86_cache_metadata', JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to persist cache metadata:', error);
    }
  }, []);

  // Restore cache metadata from localStorage
  const restoreCacheMetadata = useCallback(() => {
    try {
      const metadata = JSON.parse(localStorage.getItem('media86_cache_metadata') || '{}');
      if (metadata.accessCount) {
        cacheRef.current.accessCount = new Map(metadata.accessCount);
      }
      if (metadata.lastAccess) {
        cacheRef.current.lastAccess = new Map(metadata.lastAccess);
      }
    } catch (error) {
      console.warn('Failed to restore cache metadata:', error);
    }
  }, []);

  // Initialize cache metadata on mount
  useEffect(() => {
    restoreCacheMetadata();
    
    // Persist metadata when page unloads
    const handleBeforeUnload = () => {
      persistCacheMetadata();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [restoreCacheMetadata, persistCacheMetadata]);

  const getCachedImage = useCallback((imagePath) => {
    return cacheRef.current.get(imagePath);
  }, []);

  const isCached = useCallback((imagePath) => {
    return cacheRef.current.has(imagePath);
  }, []);

  const isPreloading = useCallback((imagePath) => {
    return loadingRef.current.has(imagePath);
  }, []);

  // Process preload queue with rate limiting
  const processPreloadQueue = useCallback(async () => {
    if (isProcessingQueue.current || preloadQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    while (preloadQueue.current.length > 0) {
      const { imagePath, priority } = preloadQueue.current.shift();
      
      if (!isCached(imagePath) && !isPreloading(imagePath)) {
        try {
          await preloadImageInternal(imagePath);
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn('Failed to preload image:', imagePath, error);
        }
      }
    }

    isProcessingQueue.current = false;
  }, []);

  const preloadImageInternal = useCallback((imagePath) => {
    if (!imagePath || isCached(imagePath) || isPreloading(imagePath)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      loadingRef.current.add(imagePath);
      setPreloadingImages(prev => new Set([...prev, imagePath]));

      const img = new Image();
      
      img.onload = () => {
        cacheRef.current.set(imagePath, {
          src: imagePath,
          width: img.naturalWidth,
          height: img.naturalHeight,
          loaded: true,
          timestamp: Date.now()
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
  }, [isCached, isPreloading]);

  const preloadImage = useCallback((imagePath, priority = 1) => {
    // Add to queue with priority
    preloadQueue.current.push({ imagePath, priority });
    
    // Sort queue by priority (higher priority first)
    preloadQueue.current.sort((a, b) => b.priority - a.priority);
    
    // Process queue
    processPreloadQueue();
  }, [processPreloadQueue]);

  const preloadAdjacentImages = useCallback(async (currentIndex, imageFiles, currentDirectory, imageKey) => {
    if (!imageFiles || imageFiles.length === 0) return;

    const { convertFileSrc } = await import("@tauri-apps/api/core");
    
    // Define preload strategy with priorities
    const preloadStrategy = [
      { offset: 0, priority: 10 }, // Current image (highest priority)
      { offset: 1, priority: 8 },  // Next image
      { offset: -1, priority: 8 }, // Previous image
      { offset: 2, priority: 6 },  // Next +1
      { offset: -2, priority: 6 }, // Previous -1
      { offset: 3, priority: 4 },  // Next +2
      { offset: -3, priority: 4 }, // Previous -2
    ];

    preloadStrategy.forEach(({ offset, priority }) => {
      let index = currentIndex + offset;
      
      // Handle wrap-around
      if (index >= imageFiles.length) {
        index = index % imageFiles.length;
      } else if (index < 0) {
        index = imageFiles.length + index;
      }
      
      if (index >= 0 && index < imageFiles.length) {
        const imagePath = `${convertFileSrc(currentDirectory + '/' + imageFiles[index])}?v=${imageKey}`;
        preloadImage(imagePath, priority);
      }
    });
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setPreloadingImages(new Set());
    loadingRef.current.clear();
    preloadQueue.current = [];
    setCacheStats(cacheRef.current.getStats());
  }, []);

  const optimizeCache = useCallback(() => {
    // Force eviction of least priority items to free memory
    const currentStats = cacheRef.current.getStats();
    if (currentStats.memoryUsageMB > currentStats.maxMemoryMB * 0.8) {
      // Evict 20% of cache when 80% full
      const evictCount = Math.floor(cacheRef.current.cache.size * 0.2);
      for (let i = 0; i < evictCount; i++) {
        cacheRef.current.evictLeastPriority();
      }
      setCacheStats(cacheRef.current.getStats());
    }
  }, []);

  // Monitor memory usage and optimize cache
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache();
    }, 30000); // Optimize every 30 seconds

    return () => clearInterval(interval);
  }, [optimizeCache]);

  return {
    getCachedImage,
    isCached,
    isPreloading,
    preloadImage,
    preloadAdjacentImages,
    clearCache,
    optimizeCache,
    cacheStats,
    cacheSize: cacheStats.size || 0,
    preloadingCount: preloadingImages.size,
    memoryUsage: cacheStats.memoryUsageMB || 0,
    hitRate: cacheStats.hitRate || 0,
  };
}; 