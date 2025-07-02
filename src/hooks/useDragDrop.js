import { useState, useCallback, useRef } from 'react';

export const useDragDrop = (onFileDrop, onDirectoryDrop) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFileCount, setDraggedFileCount] = useState(0);
  const dragCounter = useRef(0);

  // Supported image file extensions
  const supportedExtensions = new Set([
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'
  ]);

  const isImageFile = useCallback((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension && supportedExtensions.has(extension);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const fileCount = Array.from(e.dataTransfer.items).filter(item => 
        item.kind === 'file'
      ).length;
      
      setDraggedFileCount(fileCount);
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragOver(false);
      setDraggedFileCount(0);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDraggedFileCount(0);
    dragCounter.current = 0;

    const { files, items } = e.dataTransfer;

    // Handle directory drops (Chrome/Edge)
    if (items && items.length > 0) {
      const item = items[0];
      
      // Check if it's a directory
      if (item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory) {
        const entry = item.webkitGetAsEntry();
        const directoryPath = await getDirectoryPath(entry);
        if (directoryPath && onDirectoryDrop) {
          onDirectoryDrop(directoryPath);
          return;
        }
      }
    }

    // Handle file drops
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(isImageFile);
      
      if (imageFiles.length > 0) {
        // For single image file, load it directly
        if (imageFiles.length === 1 && onFileDrop) {
          const file = imageFiles[0];
          const filePath = file.path || file.name;
          onFileDrop(filePath);
        }
        // For multiple files, we could potentially create a temporary directory
        // or handle them differently based on requirements
        else if (imageFiles.length > 1) {
          console.log(`Dropped ${imageFiles.length} image files - multiple file handling not yet implemented`);
          // Could be extended to handle multiple files
        }
      }
    }
  }, [isImageFile, onFileDrop, onDirectoryDrop]);

  // Helper function to get directory path from FileSystemDirectoryEntry
  const getDirectoryPath = async (directoryEntry) => {
    // This is a simplified approach - in a real app, you might need
    // to use the File System Access API or handle this differently
    return directoryEntry.fullPath;
  };

  // Create drag handlers object
  const dragHandlers = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return {
    isDragOver,
    draggedFileCount,
    dragHandlers,
    isImageFile,
  };
}; 