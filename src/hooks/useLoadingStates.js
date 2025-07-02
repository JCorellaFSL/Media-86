import { useState, useCallback } from 'react';

export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    directory: false,
    image: false,
    rotation: false,
    rename: false,
    fileSelection: false,
  });

  const setLoading = useCallback((operation, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  const isLoading = useCallback((operation) => {
    return loadingStates[operation] || false;
  }, [loadingStates]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
}; 