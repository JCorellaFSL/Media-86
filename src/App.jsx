import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getMatches } from "@tauri-apps/plugin-cli";
import toast, { Toaster } from "react-hot-toast";

// Context
import { AppProvider, useAppContext } from "./context/AppContext";

// Advanced Hooks
import { useImageNavigation } from "./hooks/useImageNavigation";
import { useFileSelection } from "./hooks/useFileSelection";
import { useLoadingStates } from "./hooks/useLoadingStates";
import { useDragDrop } from "./hooks/useDragDrop";
import { useTheme } from "./hooks/useTheme";
import { useAdvancedZoom } from "./hooks/useAdvancedZoom";
import { useSlideshow } from "./hooks/useSlideshow";
import { useCustomKeyboardShortcuts } from "./hooks/useCustomKeyboardShortcuts";

// Core Components (eagerly loaded)
import NavigationBar from "./components/Navigation/NavigationBar";
import NavigationFooter from "./components/Navigation/NavigationFooter";
import LoadingSpinner from "./components/LoadingSpinner";
import AdvancedToolbar from "./components/UI/AdvancedToolbar";

// Lazy-loaded Components (code splitting)
const OptimizedImageViewer = lazy(() => import("./components/ImageViewer/OptimizedImageViewer"));
const EnhancedSidebar = lazy(() => import("./components/Sidebar/EnhancedSidebar"));
const RenameModal = lazy(() => import("./components/Modals/RenameModal"));
const ImageComparison = lazy(() => import("./components/ImageViewer/ImageComparison"));

import "./App.css";

function AppContent() {
  const {
    currentDirectory,
    setCurrentDirectory,
    imageFiles,
    setImageFiles,
    message,
    setMessage,
    imageKey,
    refreshImageKey,
    viewMode,
    setViewMode,
  } = useAppContext();

  // Custom hooks
  const imageNavigation = useImageNavigation(imageFiles);
  const fileSelection = useFileSelection(imageFiles);
  const { loadingStates, setLoading } = useLoadingStates();
  const theme = useTheme();
  const zoom = useAdvancedZoom();

  // Advanced UI states
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comparisonActive, setComparisonActive] = useState(false);
  const [comparisonImages, setComparisonImages] = useState({ left: null, right: null });
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Slideshow functionality
  const slideshow = useSlideshow(
    imageFiles,
    imageNavigation.currentImageIndex,
    imageNavigation.navigateNext,
    imageNavigation.navigatePrevious
  );

  // Advanced keyboard shortcuts
  const keyboardShortcuts = useCustomKeyboardShortcuts({
    navigateNext: imageNavigation.navigateNext,
    navigatePrevious: imageNavigation.navigatePrevious,
    navigateFirst: () => imageNavigation.setCurrentImageIndex(0),
    navigateLast: () => imageNavigation.setCurrentImageIndex(imageFiles.length - 1),
    zoomIn: zoom.zoomIn,
    zoomOut: zoom.zoomOut,
    resetZoom: zoom.resetZoom,
    actualSize: zoom.setActualSize,
    fitToWidth: zoom.fitToWidth,
    fitToHeight: zoom.fitToHeight,
    toggleFullscreen: () => setIsFullscreen(prev => !prev),
    toggleSidebar: () => setShowSidebar(prev => !prev),
    toggleSlideshow: slideshow.toggleSlideshow,
    pauseSlideshow: slideshow.stopSlideshow,
    toggleTheme: theme.toggleTheme,
    showHelp: () => setShowHelp(prev => !prev),
    closeModal: () => {
      setShowRenameModal(false);
      setShowSettings(false);
      setShowHelp(false);
      if (comparisonActive) setComparisonActive(false);
    },
  });

  // Memoized current image path
  const currentImagePath = useMemo(() => {
    return imageNavigation.currentImage 
      ? `${convertFileSrc(currentDirectory + '/' + imageNavigation.currentImage)}?v=${imageKey}`
      : null;
  }, [currentDirectory, imageNavigation.currentImage, imageKey]);

  // Directory and file operations
  const loadDirectory = useCallback(async (path) => {
    if (!path) return;
    
    setLoading('directory', true);
    const toastId = toast.loading("Loading directory...");
    
    try {
      const files = await invoke("get_image_files", { path });
      setImageFiles(files);
      setCurrentDirectory(path);
      
      if (files.length === 0) {
        toast("No images found in this directory", { icon: "⚠️", id: toastId });
      } else {
        toast.success(`Found ${files.length} image${files.length !== 1 ? 's' : ''}`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Error loading directory: ${err}`, { id: toastId });
    } finally {
      setLoading('directory', false);
    }
  }, [setImageFiles, setCurrentDirectory, setLoading]);

  const loadFileAndDirectory = useCallback(async (filePath) => {
    setLoading('directory', true);
    const toastId = toast.loading("Loading file and directory...");
    
    try {
      // Extract directory from the selected file
      const path = filePath.replace(/\\/g, '/');
      const fileName = path.split('/').pop();
      const directoryPath = path.substring(0, path.lastIndexOf('/'));
      
      setCurrentDirectory(directoryPath);
      setMessage(`Viewing files in:`);
      
      // Load directory files
      const files = await invoke("get_image_files", { path: directoryPath });
      setImageFiles(files);
      
      // Find and set the selected file as current
      const fileIndex = files.findIndex(img => img === fileName);
      if (fileIndex !== -1) {
        imageNavigation.setCurrentImageIndex(fileIndex);
      } else {
        imageNavigation.setCurrentImageIndex(0);
      }
      
      toast.success(`Opened ${fileName} - Found ${files.length} image${files.length !== 1 ? 's' : ''}`, { id: toastId });
    } catch (err) {
      toast.error(`Error loading file: ${err}`, { id: toastId });
      console.error("Failed to load file and directory:", err);
    } finally {
      setLoading('directory', false);
    }
  }, [setCurrentDirectory, setMessage, setImageFiles, imageNavigation, setLoading]);

  const selectImageFile = useCallback(async () => {
    setLoading('fileSelection', true);
    
    try {
      const selectedFile = await open({
        multiple: false,
        filters: [
          {
            name: 'Images',
            extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico']
          }
        ],
        title: "Select an image file"
      });
      
      if (selectedFile) {
        await loadFileAndDirectory(selectedFile);
      }
    } catch (err) {
      console.error("Failed to open file dialog:", err);
      if (!err.toString().includes("cancelled")) {
        toast.error(`Error opening file dialog: ${err.toString()}`);
      }
    } finally {
      setLoading('fileSelection', false);
    }
  }, [loadFileAndDirectory, setLoading]);

  const selectDocumentFile = useCallback(async () => {
    setLoading('fileSelection', true);
    
    try {
      const selectedFile = await open({
        multiple: false,
        filters: [
          {
            name: 'Documents',
            extensions: ['md', 'pdf', 'txt', 'doc', 'docx']
          }
        ],
        title: "Select a document file"
      });
      
      if (selectedFile) {
        const fileName = selectedFile.split(/[\\/]/).pop();
        toast.success(`Selected document: ${fileName}`);
        toast("Document viewer coming soon!", { icon: "📄" });
      }
    } catch (err) {
      console.error("Failed to open document dialog:", err);
      if (!err.toString().includes("cancelled")) {
        toast.error(`Error opening document dialog: ${err.toString()}`);
      }
    } finally {
      setLoading('fileSelection', false);
    }
  }, [setLoading]);

  // Image operations
  const handleRotate = useCallback(async (degrees) => {
    if (!imageNavigation.currentImage) return;

    setLoading('rotation', true);
    const toastId = toast.loading(`Rotating image...`);

    try {
      await invoke("rotate_image", {
        directory: currentDirectory,
        filename: imageNavigation.currentImage,
        degrees: degrees,
      });
      refreshImageKey();
      toast.success(`Image rotated ${degrees > 0 ? 'right' : 'left'}`, { id: toastId });
    } catch (err) {
      toast.error(`Error rotating image: ${err}`, { id: toastId });
    } finally {
      setLoading('rotation', false);
    }
  }, [imageNavigation.currentImage, currentDirectory, refreshImageKey, setLoading]);

  // Rename operations
  const handleBatchRename = useCallback(() => {
    if (imageFiles.length === 0) return;
    setShowRenameModal(true);
  }, [imageFiles.length]);

  const executeRename = useCallback(async (renameConfig) => {
    setLoading('rename', true);
    
    try {
      // Build file mappings based on rename config
      let filesToRename = [];
      switch (renameConfig.mode) {
        case "current":
          if (imageNavigation.currentImage) filesToRename = [imageNavigation.currentImage];
          break;
        case "selected":
          filesToRename = Array.from(fileSelection.selectedFiles);
          break;
        case "all":
          filesToRename = [...imageFiles];
          break;
        default:
          return;
      }

      if (!renameConfig.pattern.trim()) {
        toast.error("No rename pattern provided");
        return;
      }

      const startNumber = parseInt(renameConfig.startString, 10) || 0;
      const padLength = renameConfig.startString.length;

      const mappings = filesToRename.map((file, index) => {
        const originalExtension = '.' + file.split('.').pop();
        let newName = renameConfig.pattern;

        // Handle numbering
        const number = startNumber + (index * renameConfig.stepSize);
        if (renameConfig.pattern.includes('{n}')) {
          newName = newName.replace(/\{n\}/g, number.toString().padStart(padLength, '0'));
        } else if (filesToRename.length > 1) {
          newName += `_${number.toString().padStart(padLength, '0')}`;
        }

        // Handle extension
        if (!renameConfig.pattern.includes('{ext}')) {
          newName += originalExtension;
        } else {
          newName = newName.replace(/\{ext\}/g, originalExtension);
        }

        return [file, newName];
      });

      const toastId = toast.loading(`Renaming ${mappings.length} file(s)...`);

      await invoke("rename_files", {
        directory: currentDirectory,
        fileMappings: mappings
      });
      
      toast.success(`Successfully renamed ${mappings.length} file(s)`, { id: toastId });
      
      // Refresh the directory
      await loadDirectory(currentDirectory);
      
      // Clear selection after rename
      fileSelection.clearSelection();
      
    } catch (err) {
      toast.error(`Error renaming files: ${err}`);
    } finally {
      setLoading('rename', false);
      setShowRenameModal(false);
    }
  }, [imageNavigation.currentImage, fileSelection, imageFiles, currentDirectory, setLoading, loadDirectory]);

  const closeRenameModal = useCallback(() => {
    setShowRenameModal(false);
  }, []);

  // View mode setters
  const setListView = useCallback(() => setViewMode('list'), [setViewMode]);
  const setGridView = useCallback(() => setViewMode('grid'), [setViewMode]);

  // Advanced UI handlers
  const handleToggleComparison = useCallback(() => {
    if (!comparisonActive && imageFiles.length >= 2) {
      // Start comparison with current image and next image
      const currentIndex = imageNavigation.currentImageIndex;
      const nextIndex = (currentIndex + 1) % imageFiles.length;
      
      setComparisonImages({
        left: imageFiles[currentIndex],
        right: imageFiles[nextIndex]
      });
      setComparisonActive(true);
    } else {
      setComparisonActive(false);
    }
  }, [comparisonActive, imageFiles, imageNavigation.currentImageIndex]);

  const handleCloseComparison = useCallback(() => {
    setComparisonActive(false);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    // In a real implementation, you'd use the Fullscreen API here
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const handleShowSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  // Update zoom when image changes
  useEffect(() => {
    if (imageNavigation.currentImage && zoom.containerRef.current) {
      zoom.updateContainerSize();
    }
  }, [imageNavigation.currentImage, zoom]);

  // Drag & Drop functionality (after functions are defined)
  const { isDragOver, draggedFileCount, dragHandlers } = useDragDrop(
    loadFileAndDirectory, // Handle file drops
    loadDirectory // Handle directory drops
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      keyboardShortcuts.handleKeyPress(e);
      slideshow.handleKeyPress(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcuts, slideshow]);

  // CLI and events setup
  useEffect(() => {
    const handleStartupArgs = async () => {
      try {
        const matches = await getMatches();
        if (matches.args && matches.args.file && matches.args.file.value) {
          const filePath = matches.args.file.value;
          if (typeof filePath === 'string') {
            await loadFileAndDirectory(filePath);
          }
        }
      } catch (err) {
        console.log("No startup arguments or error getting CLI matches:", err);
      }
    };

    handleStartupArgs();
  }, [loadFileAndDirectory]);

  useEffect(() => {
    const setupEventListener = async () => {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen('open-file', (event) => {
        const filePath = event.payload;
        if (typeof filePath === 'string') {
          loadFileAndDirectory(filePath);
        }
      });
      
      return unlisten;
    };

    let unlisten;
    setupEventListener().then(fn => unlisten = fn);

    return () => {
      if (unlisten) unlisten();
    };
  }, [loadFileAndDirectory]);

  return (
    <div 
      className={`h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative transition-colors duration-200 ${
        isDragOver ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
      } ${isFullscreen ? 'fullscreen' : ''}`}
      {...dragHandlers}
    >
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        }}
      />
      
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-900 bg-opacity-80 z-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-blue-400">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-bold mb-2">Drop files here</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {draggedFileCount > 1 
                ? `Drop ${draggedFileCount} files to load them`
                : 'Drop an image file or folder to load images'
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Advanced Toolbar */}
      <AdvancedToolbar
        slideshow={slideshow}
        zoom={zoom}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        showSidebar={showSidebar}
        onToggleSidebar={handleToggleSidebar}
        onToggleComparison={handleToggleComparison}
        comparisonActive={comparisonActive}
        onShowSettings={handleShowSettings}
        onShowHelp={handleShowHelp}
        currentImage={imageNavigation.currentImage}
        imageFiles={imageFiles}
        currentImageIndex={imageNavigation.currentImageIndex}
      />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Suspense fallback={
            <div className="w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <LoadingSpinner size={24} />
            </div>
          }>
            <EnhancedSidebar
              onSelectImageFile={selectImageFile}
              onSelectDocumentFile={selectDocumentFile}
              isFileSelectionLoading={loadingStates.fileSelection}
              isDirectoryLoading={loadingStates.directory}
              message={message}
              currentDirectory={currentDirectory}
              imageFiles={imageFiles}
              currentImageIndex={imageNavigation.currentImageIndex}
              onSelectImage={imageNavigation.selectImage}
              onToggleFileSelection={fileSelection.toggleFileSelection}
              onSelectAllFiles={fileSelection.selectAllFiles}
              isFileSelected={fileSelection.isFileSelected}
              selectedCount={fileSelection.selectedCount}
              isAllSelected={fileSelection.isAllSelected}
              viewMode={viewMode}
              onSetListView={setListView}
              onSetGridView={setGridView}
            />
          </Suspense>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-auto">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size={40} className="mb-4" />
                  <p className="text-gray-400">Loading image viewer...</p>
                </div>
              </div>
            }>
              <OptimizedImageViewer
                currentImagePath={currentImagePath}
                currentImage={imageNavigation.currentImage}
                currentImageIndex={imageNavigation.currentImageIndex}
                imageFiles={imageFiles}
                currentDirectory={currentDirectory}
                imageKey={imageKey}
                zoom={zoom}
                slideshow={slideshow}
              />
            </Suspense>
          </div>

          {currentImagePath && !comparisonActive && (
            <NavigationFooter
              currentImageIndex={imageNavigation.currentImageIndex}
              totalImages={imageNavigation.totalImages}
              onNavigatePrevious={slideshow.isPlaying ? slideshow.handlePrevious : imageNavigation.navigatePrevious}
              onNavigateNext={slideshow.isPlaying ? slideshow.handleNext : imageNavigation.navigateNext}
              onRotateLeft={() => handleRotate(-90)}
              onRotateRight={() => handleRotate(90)}
              isRotationLoading={loadingStates.rotation}
              hasMultipleImages={imageNavigation.totalImages > 1}
            />
          )}
        </main>
      </div>

      {/* Image Comparison Mode */}
      {comparisonActive && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        }>
          <ImageComparison
            leftImage={comparisonImages.left}
            rightImage={comparisonImages.right}
            onClose={handleCloseComparison}
            currentDirectory={currentDirectory}
            imageKey={imageKey}
          />
        </Suspense>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <RenameModal
          isOpen={showRenameModal}
          currentImage={imageNavigation.currentImage}
          selectedCount={fileSelection.selectedCount}
          totalImages={imageNavigation.totalImages}
          onClose={closeRenameModal}
          onExecuteRename={executeRename}
          isRenameLoading={loadingStates.rename}
        />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App; 