import { useState, useCallback } from 'react';

export const useFileSelection = (imageFiles) => {
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  const toggleFileSelection = useCallback((filename) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  }, [selectedFiles]);

  const selectAllFiles = useCallback(() => {
    if (selectedFiles.size === imageFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(imageFiles));
    }
  }, [selectedFiles.size, imageFiles]);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const isFileSelected = useCallback((filename) => {
    return selectedFiles.has(filename);
  }, [selectedFiles]);

  const selectedCount = selectedFiles.size;
  const isAllSelected = selectedCount === imageFiles.length && imageFiles.length > 0;
  const hasSelection = selectedCount > 0;

  return {
    selectedFiles,
    setSelectedFiles,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    isFileSelected,
    selectedCount,
    isAllSelected,
    hasSelection,
  };
}; 