import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { 
  MdImage, 
  MdMovie,
  MdChevronLeft, 
  MdChevronRight,
  MdAutoFixHigh,
  MdDriveFileRenameOutline,
  MdClose,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdSelectAll,
  MdRotateLeft,
  MdRotateRight
} from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Click a button to test functionality");
  const [currentDirectory, setCurrentDirectory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageKey, setImageKey] = useState(Date.now()); // For cache-busting

  // Batch rename states
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [renameMode, setRenameMode] = useState("current"); // "current", "selected", "all"
  const [renamePattern, setRenamePattern] = useState("");
  const [renameStartString, setRenameStartString] = useState("1");
  const [renameStepSize, setRenameStepSize] = useState(1);
  const [renameResults, setRenameResults] = useState([]);
  const [showUpscaleOptions, setShowUpscaleOptions] = useState(false);

  const currentImage = imageFiles[currentImageIndex];
  const currentImagePath = currentImage 
    ? `${convertFileSrc(currentDirectory + '/' + currentImage)}?v=${imageKey}`
    : null;

  const navigatePrevious = () => {
    if (imageFiles.length === 0) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? imageFiles.length - 1 : prev - 1
    );
  };

  const navigateNext = () => {
    if (imageFiles.length === 0) return;
    setCurrentImageIndex(prev => 
      prev === imageFiles.length - 1 ? 0 : prev + 1
    );
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleUpscale = async (scale) => {
    if (!currentImage) return;

    const toastId = toast.loading(`Upscaling to ${scale}x...`);
    setShowUpscaleOptions(false);

    try {
      const newFilename = await invoke("upscale_image", {
        directory: currentDirectory,
        filename: currentImage,
        scale: scale,
      });

      toast.success(`Created ${newFilename}`, { id: toastId });
      
      // Refresh the directory to see the new file
      await loadDirectory(currentDirectory);

    } catch (err) {
      toast.error(`Error upscaling image: ${err}`, { id: toastId });
    }
  };

  const handleRotate = async (degrees) => {
    if (!currentImage) return;

    try {
      await invoke("rotate_image", {
        directory: currentDirectory,
        filename: currentImage,
        degrees: degrees,
      });
      // Update the key to force a re-render and bust the cache
      setImageKey(Date.now());
      toast.success(`Image rotated ${degrees > 0 ? 'right' : 'left'}`);
    } catch (err) {
      toast.error(`Error rotating image: ${err}`);
    }
  };

  const selectVideoFile = async () => {
    toast("Video support is coming soon!", { icon: "🎥" });
  };

  const loadDirectory = async (path) => {
    if (!path) return;
    
    try {
      const files = await invoke("get_image_files", { path });
      setImageFiles(files);
      setCurrentDirectory(path);
      
      if (files.length === 0) {
        toast("No images found in this directory", { icon: "⚠️" });
      }
    } catch (err) {
      toast.error(`Error loading directory: ${err}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (imageFiles.length === 0) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
        case ' ': // Spacebar
          event.preventDefault(); // Prevent page scroll
          navigateNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageFiles.length]);

  const selectImageFile = async () => {
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
        // Extract directory from the selected file
        const filePath = selectedFile.replace(/\\/g, '/');
        const fileName = filePath.split('/').pop();
        const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        setCurrentDirectory(directoryPath);
        setMessage(`Selected file: ${fileName}`);
        toast.success(`Opened ${fileName}`);
        
        // Load directory files
        try {
          const files = await invoke("get_image_files", { path: directoryPath });
          setImageFiles(files);
          
          // Find and set the selected file as current
          const fileIndex = files.findIndex(img => img === fileName);
          if (fileIndex !== -1) {
            setCurrentImageIndex(fileIndex);
          } else {
            setCurrentImageIndex(0);
          }
          
          toast.success(`Found ${files.length} image${files.length !== 1 ? 's' : ''} in directory`);
        } catch (err) {
          toast.error(`Error loading directory: ${err}`);
        }
      }
    } catch (err) {
      console.error("Failed to open file dialog:", err);
      if (!err.toString().includes("cancelled")) {
        toast.error(`Error opening file dialog: ${err.toString()}`);
      }
    }
  };

  const handleBatchRename = () => {
    if (imageFiles.length === 0) return;
    setShowRenameModal(true);
    
    // Set default mode based on selections
    if (selectedFiles.size > 0) {
      setRenameMode("selected");
    } else {
      setRenameMode("current");
    }
  };

  const toggleFileSelection = (filename) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === imageFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(imageFiles));
    }
  };

  const formatNumber = (number, padLength) => {
    return number.toString().padStart(padLength, '0');
  };

  const generateNewFilenames = () => {
    let filesToRename = [];
    switch (renameMode) {
      case "current":
        if (currentImage) filesToRename = [currentImage];
        break;
      case "selected":
        filesToRename = Array.from(selectedFiles);
        break;
      case "all":
        filesToRename = [...imageFiles];
        break;
      default:
        return [];
    }

    if (!renamePattern.trim()) {
      return filesToRename.map(file => [file, file]);
    }

    const startNumber = parseInt(renameStartString, 10) || 0;
    const padLength = renameStartString.length;

    return filesToRename.map((file, index) => {
      const originalExtension = '.' + file.split('.').pop();
      let newName = renamePattern;

      // Handle numbering
      const number = startNumber + (index * renameStepSize);
      if (renamePattern.includes('{n}')) {
        newName = newName.replace(/\{n\}/g, formatNumber(number, padLength));
      } else if (filesToRename.length > 1) {
        newName += `_${formatNumber(number, padLength)}`;
      }

      // Handle extension
      if (!renamePattern.includes('{ext}')) {
        newName += originalExtension;
      } else {
        newName = newName.replace(/\{ext\}/g, originalExtension);
      }
      
      return [file, newName];
    });
  };

  const executeRename = async () => {
    const mappings = generateNewFilenames();
    if (mappings.length === 0) {
      toast.error("No files to rename");
      return;
    }

    try {
      await invoke("rename_files", {
        directory: currentDirectory,
        fileMappings: mappings
      });
      
      toast.success(`Successfully renamed ${mappings.length} file(s)`);
      
      // Refresh the directory to show new names
      const oldSelected = new Set(selectedFiles);
      
      await loadDirectory(currentDirectory);
      
      // Try to restore selection state
      const newNames = new Map(mappings.map(([oldName, newName]) => [oldName, newName]));
      const newSelectedFiles = new Set();
      oldSelected.forEach(oldFile => {
        if (newNames.has(oldFile)) {
          newSelectedFiles.add(newNames.get(oldFile));
        }
      });
      setSelectedFiles(newSelectedFiles);
      
    } catch (err) {
      toast.error(`Error renaming files: ${err}`);
    } finally {
      closeRenameModal();
    }
  };

  const closeRenameModal = () => {
    setShowRenameModal(false);
    setRenamePattern("");
    setRenameStartString("1");
    setRenameStepSize(1);
    setRenameResults([]);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MdImage className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-semibold text-white">Media-86</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Utility Buttons */}
            {currentImage && (
              <div className="flex items-center space-x-2">
                {/* <div className="relative">
                  <button
                    onClick={() => setShowUpscaleOptions(!showUpscaleOptions)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdAutoFixHigh size={16} />
                    <span>Upscale</span>
                  </button>
                  {showUpscaleOptions && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-32 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10"
                      onMouseLeave={() => setShowUpscaleOptions(false)}
                    >
                      <button onClick={() => handleUpscale(2)} className="w-full text-left px-4 py-2 hover:bg-gray-600 rounded-t-lg">2x Upscale</button>
                      <button onClick={() => handleUpscale(4)} className="w-full text-left px-4 py-2 hover:bg-gray-600 rounded-b-lg">4x Upscale</button>
                    </div>
                  )}
                </div> */}
                
                <button
                  onClick={handleBatchRename}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Batch Rename Utility"
                >
                  <MdDriveFileRenameOutline size={16} />
                  <span>Rename</span>
                </button>
              </div>
            )}

            {currentImage && (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 font-medium">{currentImage}</span>
                <span className="text-sm text-gray-400">
                  {currentImageIndex + 1} / {imageFiles.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Open</label>
              <div className="flex">
                <button
                  onClick={selectImageFile}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-l-md flex items-center justify-center space-x-2 transition-colors"
                >
                  <MdImage size={18} />
                  <span>Image</span>
                </button>
                <button
                  onClick={selectVideoFile}
                  className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-r-md flex items-center justify-center space-x-2 transition-colors border-l border-gray-500"
                >
                  <MdMovie size={18} />
                  <span>Video</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6">
              <p className="text-gray-400 mb-4">{message}</p>
              {currentDirectory && (
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Current Folder</p>
                  <p className="text-sm text-gray-200 break-all">{currentDirectory}</p>
                </div>
              )}
              {imageFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-300 mb-2">Images found: {imageFiles.length}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={selectAllFiles}
                      className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <MdSelectAll size={18} />
                      <span>{selectedFiles.size === imageFiles.length ? 'Deselect All' : 'Select All'}</span>
                    </button>
                    {selectedFiles.size > 0 && (
                      <span className="text-sm text-blue-400">{selectedFiles.size} selected</span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {imageFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center space-x-3 text-xs py-2 px-3 rounded cursor-pointer transition-colors ${
                          index === currentImageIndex 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                        onClick={() => selectImage(index)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file);
                          }}
                          className="p-1"
                        >
                          {selectedFiles.has(file) ? (
                            <MdCheckBox size={16} className="text-blue-300" />
                          ) : (
                            <MdCheckBoxOutlineBlank size={16} />
                          )}
                        </button>
                        <div className="truncate flex-1">{file}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content - Image Display */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-auto">
            {currentImagePath ? (
              <div className="image-container w-full h-full flex items-center justify-center p-4 md:p-8">
                <img
                  key={currentImagePath}
                  src={currentImagePath}
                  alt={currentImage}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                    <MdImage className="text-gray-400" size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">Select an image to get started</h3>
                    <p className="text-gray-400 mb-4">Use the sidebar to open an image file.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          {currentImagePath && (
            <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={navigatePrevious}
                    disabled={imageFiles.length <= 1}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handleRotate(-90)}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdRotateLeft size={18} />
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdRotateRight size={18} />
                  </button>
                  <button
                    onClick={navigateNext}
                    disabled={imageFiles.length <= 1}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MdChevronRight size={18} />
                  </button>
                  <span className="text-sm text-gray-400 pl-2">
                    Use ← → arrow keys or spacebar to navigate
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-300">
                  {currentImageIndex + 1} / {imageFiles.length}
                </span>
              </div>
            </footer>
          )}
        </main>
      </div>

      {/* Batch Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Batch Rename</h2>
                <button onClick={closeRenameModal} className="text-gray-400 hover:text-white transition-colors">
                  <MdClose size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Rename Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Rename Mode</label>
                <div className="space-y-2">
                  <label className="flex items-center"><input type="radio" name="renameMode" value="current" checked={renameMode === "current"} onChange={(e) => setRenameMode(e.target.value)} className="mr-3" /> Current image only ({currentImage || 'None'})</label>
                  <label className="flex items-center"><input type="radio" name="renameMode" value="selected" checked={renameMode === "selected"} onChange={(e) => setRenameMode(e.target.value)} className="mr-3" disabled={selectedFiles.size === 0} /> <span className={`${selectedFiles.size === 0 ? 'text-gray-500' : ''}`}>Selected files ({selectedFiles.size})</span></label>
                  <label className="flex items-center"><input type="radio" name="renameMode" value="all" checked={renameMode === "all"} onChange={(e) => setRenameMode(e.target.value)} className="mr-3" /> All files ({imageFiles.length})</label>
                </div>
              </div>

              {/* Rename Pattern */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Rename Pattern <span className="text-gray-500 text-xs ml-2">Use {'{n}'} for numbers, {'{ext}'} for extension</span></label>
                <input type="text" value={renamePattern} onChange={(e) => setRenamePattern(e.target.value)} placeholder="e.g., Image_{n}{ext}" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Start Number, Step */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Start Number</label>
                  <input 
                    type="text" 
                    value={renameStartString} 
                    onChange={(e) => setRenameStartString(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Step Size</label>
                  <input type="number" value={renameStepSize} onChange={(e) => setRenameStepSize(parseInt(e.target.value) || 1)} min="1" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Preview */}
              {renamePattern && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Preview</label>
                  <div className="bg-gray-900 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {generateNewFilenames().slice(0, 10).map(([oldName, newName], index) => (
                      <div key={index} className="text-sm text-gray-300 py-1 font-mono"><span className="text-gray-500">{oldName}</span><span className="mx-2 text-blue-400">→</span><span className="text-white">{newName}</span></div>
                    ))}
                    {generateNewFilenames().length > 10 && <div className="text-sm text-gray-500 pt-2">... and {generateNewFilenames().length - 10} more</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 mt-auto">
              <div className="flex justify-end space-x-3">
                <button onClick={closeRenameModal} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={executeRename} disabled={!renamePattern.trim()} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors">Rename Files</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
