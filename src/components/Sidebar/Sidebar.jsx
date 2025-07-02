import React from 'react';
import FileOperations from './FileOperations';
import DirectoryInfo from './DirectoryInfo';
import FileList from './FileList';

const Sidebar = ({
  // File operations props
  onSelectImageFile,
  onSelectDocumentFile,
  isFileSelectionLoading,
  isDirectoryLoading,
  message,
  
  // Directory info props
  currentDirectory,
  
  // File list props
  imageFiles,
  currentImageIndex,
  onSelectImage,
  onToggleFileSelection,
  onSelectAllFiles,
  isFileSelected,
  selectedCount,
  isAllSelected,
  viewMode,
  onSetListView,
  onSetGridView,
}) => {
  return (
    <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      <FileOperations
        onSelectImageFile={onSelectImageFile}
        onSelectDocumentFile={onSelectDocumentFile}
        isFileSelectionLoading={isFileSelectionLoading}
        isDirectoryLoading={isDirectoryLoading}
        message={message}
      />
      
      <div className="flex-1 p-4 overflow-y-auto">
        <DirectoryInfo
          currentDirectory={currentDirectory}
          isDirectoryLoading={isDirectoryLoading}
        />
        
        {imageFiles.length > 0 && !isDirectoryLoading && (
          <FileList
            imageFiles={imageFiles}
            currentImageIndex={currentImageIndex}
            onSelectImage={onSelectImage}
            onToggleFileSelection={onToggleFileSelection}
            onSelectAllFiles={onSelectAllFiles}
            isFileSelected={isFileSelected}
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            viewMode={viewMode}
            onSetListView={onSetListView}
            onSetGridView={onSetGridView}
            currentDirectory={currentDirectory}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 