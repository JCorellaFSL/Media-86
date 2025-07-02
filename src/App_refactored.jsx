import React, { useState, useEffect, useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getMatches } from "@tauri-apps/plugin-cli";
import toast, { Toaster } from "react-hot-toast";

// Context
import { AppProvider, useAppContext } from "./context/AppContext";

// Hooks
import { useImageNavigation } from "./hooks/useImageNavigation";
import { useFileSelection } from "./hooks/useFileSelection";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLoadingStates } from "./hooks/useLoadingStates";

// Components
import NavigationBar from "./components/Navigation/NavigationBar";
import NavigationFooter from "./components/Navigation/NavigationFooter";
import Sidebar from "./components/Sidebar/Sidebar";
import ImageViewer from "./components/ImageViewer/ImageViewer";
import RenameModal from "./components/Modals/RenameModal";

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

  // Modal states
  const [showRenameModal, setShowRenameModal] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    navigateNext: imageNavigation.navigateNext,
    navigatePrevious: imageNavigation.navigatePrevious,
    hasImages: imageNavigation.hasImages,
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
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Toaster position="top-right" />
      
      <NavigationBar
        currentImage={imageNavigation.currentImage}
        currentImageIndex={imageNavigation.currentImageIndex}
        totalImages={imageNavigation.totalImages}
        onRename={handleBatchRename}
        isRenameLoading={loadingStates.rename}
        isDirectoryLoading={loadingStates.directory}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
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

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-auto">
            <ImageViewer
              currentImagePath={currentImagePath}
              currentImage={imageNavigation.currentImage}
            />
          </div>

          {currentImagePath && (
            <NavigationFooter
              currentImageIndex={imageNavigation.currentImageIndex}
              totalImages={imageNavigation.totalImages}
              onNavigatePrevious={imageNavigation.navigatePrevious}
              onNavigateNext={imageNavigation.navigateNext}
              onRotateLeft={() => handleRotate(-90)}
              onRotateRight={() => handleRotate(90)}
              isRotationLoading={loadingStates.rotation}
              hasMultipleImages={imageNavigation.totalImages > 1}
            />
          )}
        </main>
      </div>

      <RenameModal
        isOpen={showRenameModal}
        currentImage={imageNavigation.currentImage}
        selectedCount={fileSelection.selectedCount}
        totalImages={imageNavigation.totalImages}
        onClose={closeRenameModal}
        onExecuteRename={executeRename}
        isRenameLoading={loadingStates.rename}
      />
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