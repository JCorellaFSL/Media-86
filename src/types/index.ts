// Core application types
export interface ImageFile {
  name: string;
  path: string;
  size?: number;
  lastModified?: Date;
  extension?: string;
}

export interface ThumbnailData {
  filename: string;
  thumbnail: string; // Base64 encoded thumbnail
  url?: string;
  width: number;
  height: number;
  file_size: number;
  timestamp?: number;
}

export interface CacheItem {
  src: string;
  width: number;
  height: number;
  loaded: boolean;
  timestamp: number;
  memorySize?: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  memoryUsageMB?: number;
  maxMemoryMB?: number;
  hitRate?: number;
  hitCount?: number;
  missCount?: number;
  usage?: number;
}

// View modes
export type ViewMode = 'list' | 'grid';

// Loading states
export interface LoadingStates {
  directory: boolean;
  image: boolean;
  rotation: boolean;
  rename: boolean;
  fileSelection: boolean;
  thumbnails: boolean;
}

// Drag and drop types
export interface DragDropHandlers {
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export interface DragDropState {
  isDragOver: boolean;
  draggedFileCount: number;
  dragHandlers: DragDropHandlers;
  isImageFile: (file: File) => boolean;
}

// App context types
export interface AppContextType {
  currentDirectory: string;
  setCurrentDirectory: (path: string) => void;
  imageFiles: string[];
  setImageFiles: (files: string[]) => void;
  message: string;
  setMessage: (message: string) => void;
  imageKey: number;
  refreshImageKey: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

// Image navigation types
export interface ImageNavigationHook {
  currentImage: string | null;
  currentImageIndex: number;
  totalImages: number;
  hasImages: boolean;
  navigateNext: () => void;
  navigatePrevious: () => void;
  selectImage: (index: number) => void;
  setCurrentImageIndex: (index: number) => void;
}

// File selection types
export interface FileSelectionHook {
  selectedFiles: Set<string>;
  selectedCount: number;
  isAllSelected: boolean;
  toggleFileSelection: (filename: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  isFileSelected: (filename: string) => boolean;
}

// Advanced cache types
export interface AdvancedCacheHook {
  getCachedImage: (imagePath: string) => CacheItem | null;
  isCached: (imagePath: string) => boolean;
  isPreloading: (imagePath: string) => boolean;
  preloadImage: (imagePath: string, priority?: number) => void;
  preloadAdjacentImages: (
    currentIndex: number,
    imageFiles: string[],
    currentDirectory: string,
    imageKey: number
  ) => Promise<void>;
  clearCache: () => void;
  optimizeCache: () => void;
  cacheStats: CacheStats;
  cacheSize: number;
  preloadingCount: number;
  memoryUsage: number;
  hitRate: number;
}

// Component prop types
export interface NavigationBarProps {
  currentImage: string | null;
  currentImageIndex: number;
  totalImages: number;
  onRename: () => void;
  isRenameLoading: boolean;
  isDirectoryLoading: boolean;
}

export interface NavigationFooterProps {
  currentImageIndex: number;
  totalImages: number;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  isRotationLoading: boolean;
}

export interface ImageViewerProps {
  currentImagePath: string | null;
  currentImage: string | null;
  currentImageIndex: number;
  imageFiles: string[];
  currentDirectory: string;
  imageKey: number;
}

export interface SidebarProps {
  onSelectImageFile: () => void;
  onSelectDocumentFile: () => void;
  isFileSelectionLoading: boolean;
  isDirectoryLoading: boolean;
  message: string;
  currentDirectory: string;
  imageFiles: string[];
  currentImageIndex: number;
  onSelectImage: (index: number) => void;
  onToggleFileSelection: (filename: string) => void;
  onSelectAllFiles: () => void;
  isFileSelected: (filename: string) => boolean;
  selectedCount: number;
  isAllSelected: boolean;
  viewMode: ViewMode;
  onSetListView: () => void;
  onSetGridView: () => void;
}

export interface FileListProps {
  imageFiles: string[];
  currentImageIndex: number;
  onSelectImage: (index: number) => void;
  onToggleFileSelection: (filename: string) => void;
  onSelectAllFiles: () => void;
  isFileSelected: (filename: string) => boolean;
  selectedCount: number;
  isAllSelected: boolean;
  viewMode: ViewMode;
  onSetListView: () => void;
  onSetGridView: () => void;
  currentDirectory: string;
}

// Rename modal types
export interface RenameConfig {
  mode: 'current' | 'selected' | 'all';
  pattern: string;
  startString: string;
  stepSize: number;
}

export interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (config: RenameConfig) => void;
  isLoading: boolean;
  fileCount: number;
  selectedCount: number;
  currentFileName?: string;
}

// Keyboard shortcuts types
export interface KeyboardShortcutsConfig {
  navigateNext: () => void;
  navigatePrevious: () => void;
  hasImages: boolean;
}

// Utility types
export type FileExtension = 'jpg' | 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp' | 'svg' | 'tiff' | 'ico';

export interface FileInfo {
  name: string;
  path: string;
  extension: FileExtension;
  size: number;
  isImage: boolean;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: string;
} 