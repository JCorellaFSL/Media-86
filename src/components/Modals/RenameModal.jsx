import React, { useState, useCallback } from 'react';
import { MdClose } from "react-icons/md";
import LoadingSpinner from '../LoadingSpinner';

const RenameModal = ({
  isOpen,
  currentImage,
  selectedCount,
  totalImages,
  onClose,
  onExecuteRename,
  isRenameLoading,
}) => {
  const [renameMode, setRenameMode] = useState(selectedCount > 0 ? "selected" : "current");
  const [renamePattern, setRenamePattern] = useState("");
  const [renameStartString, setRenameStartString] = useState("1");
  const [renameStepSize, setRenameStepSize] = useState(1);

  const formatNumber = useCallback((number, padLength) => {
    return number.toString().padStart(padLength, '0');
  }, []);

  const generatePreview = useCallback(() => {
    if (!renamePattern.trim()) return [];

    const startNumber = parseInt(renameStartString, 10) || 0;
    const padLength = renameStartString.length;

    // Mock file names for preview based on mode
    let fileCount = 0;
    switch (renameMode) {
      case "current":
        fileCount = currentImage ? 1 : 0;
        break;
      case "selected":
        fileCount = selectedCount;
        break;
      case "all":
        fileCount = totalImages;
        break;
      default:
        fileCount = 0;
    }

    return Array.from({ length: Math.min(fileCount, 10) }, (_, index) => {
      const originalExtension = '.jpg'; // Mock extension for preview
      let newName = renamePattern;

      // Handle numbering
      const number = startNumber + (index * renameStepSize);
      if (renamePattern.includes('{n}')) {
        newName = newName.replace(/\{n\}/g, formatNumber(number, padLength));
      } else if (fileCount > 1) {
        newName += `_${formatNumber(number, padLength)}`;
      }

      // Handle extension
      if (!renamePattern.includes('{ext}')) {
        newName += originalExtension;
      } else {
        newName = newName.replace(/\{ext\}/g, originalExtension);
      }

      return [`file_${index + 1}.jpg`, newName];
    });
  }, [renameMode, renamePattern, renameStartString, renameStepSize, formatNumber, currentImage, selectedCount, totalImages]);

  const handleExecute = useCallback(() => {
    onExecuteRename({
      mode: renameMode,
      pattern: renamePattern,
      startString: renameStartString,
      stepSize: renameStepSize,
    });
  }, [renameMode, renamePattern, renameStartString, renameStepSize, onExecuteRename]);

  if (!isOpen) return null;

  const preview = generatePreview();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Batch Rename</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <MdClose size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Rename Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Rename Mode</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="renameMode" 
                  value="current" 
                  checked={renameMode === "current"} 
                  onChange={(e) => setRenameMode(e.target.value)} 
                  className="mr-3" 
                />
                Current image only ({currentImage || 'None'})
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="renameMode" 
                  value="selected" 
                  checked={renameMode === "selected"} 
                  onChange={(e) => setRenameMode(e.target.value)} 
                  className="mr-3" 
                  disabled={selectedCount === 0} 
                />
                <span className={`${selectedCount === 0 ? 'text-gray-500' : ''}`}>
                  Selected files ({selectedCount})
                </span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="renameMode" 
                  value="all" 
                  checked={renameMode === "all"} 
                  onChange={(e) => setRenameMode(e.target.value)} 
                  className="mr-3" 
                />
                All files ({totalImages})
              </label>
            </div>
          </div>

          {/* Rename Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Rename Pattern{' '}
              <span className="text-gray-500 text-xs ml-2">
                Use {'{n}'} for numbers, {'{ext}'} for extension
              </span>
            </label>
            <input 
              type="text" 
              value={renamePattern} 
              onChange={(e) => setRenamePattern(e.target.value)} 
              placeholder="e.g., Image_{n}{ext}" 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
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
              <input 
                type="number" 
                value={renameStepSize} 
                onChange={(e) => setRenameStepSize(parseInt(e.target.value) || 1)} 
                min="1" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          {/* Preview */}
          {renamePattern && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Preview</label>
              <div className="bg-gray-900 rounded-lg p-4 max-h-40 overflow-y-auto">
                {preview.map(([oldName, newName], index) => (
                  <div key={index} className="text-sm text-gray-300 py-1 font-mono">
                    <span className="text-gray-500">{oldName}</span>
                    <span className="mx-2 text-blue-400">→</span>
                    <span className="text-white">{newName}</span>
                  </div>
                ))}
                {preview.length === 10 && (
                  <div className="text-sm text-gray-500 pt-2">... and more</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 mt-auto">
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose} 
              disabled={isRenameLoading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleExecute} 
              disabled={!renamePattern.trim() || isRenameLoading} 
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              {isRenameLoading && <LoadingSpinner size={16} />}
              <span>Rename Files</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameModal; 