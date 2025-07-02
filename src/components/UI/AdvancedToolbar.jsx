import React, { useState } from 'react';
import { 
  MdPlayArrow, 
  MdPause, 
  MdZoomIn, 
  MdZoomOut, 
  MdCrop32,
  MdCropFree,
  MdCompareArrows,
  MdSettings,
  MdHelp,
  MdFullscreen,
  MdFullscreenExit,
  MdViewSidebar,
  MdTimer
} from 'react-icons/md';
import ThemeToggle from './ThemeToggle';

const AdvancedToolbar = ({
  // Slideshow props
  slideshow,
  
  // Zoom props
  zoom,
  
  // View state
  isFullscreen,
  onToggleFullscreen,
  showSidebar,
  onToggleSidebar,
  
  // Comparison mode
  onToggleComparison,
  comparisonActive,
  
  // Settings
  onShowSettings,
  onShowHelp,
  
  // Current image info
  currentImage,
  imageFiles,
  currentImageIndex,
}) => {
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [showSlideshowSettings, setShowSlideshowSettings] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section - File operations */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded transition-colors ${
              showSidebar 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle sidebar"
          >
            <MdViewSidebar size={20} />
          </button>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          {/* Comparison mode toggle */}
          <button
            onClick={onToggleComparison}
            disabled={imageFiles.length < 2}
            className={`p-2 rounded transition-colors disabled:opacity-50 ${
              comparisonActive
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Compare images side-by-side"
          >
            <MdCompareArrows size={20} />
          </button>
        </div>

        {/* Center section - Playback controls */}
        <div className="flex items-center space-x-1">
          {/* Slideshow controls */}
          {slideshow?.canPlay && (
            <>
              <button
                onClick={slideshow.toggleSlideshow}
                className={`p-2 rounded transition-colors ${
                  slideshow.isPlaying
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                }`}
                title={slideshow.isPlaying ? "Pause slideshow" : "Start slideshow"}
              >
                {slideshow.isPlaying ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
              </button>
              
              {/* Slideshow settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSlideshowSettings(!showSlideshowSettings)}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Slideshow settings"
                >
                  <MdTimer size={16} />
                </button>
                
                {showSlideshowSettings && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                    {slideshow.availableIntervals.map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => {
                          slideshow.changeInterval(value);
                          setShowSlideshowSettings(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          slideshow.interval === value 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Progress indicator */}
              {slideshow.isPlaying && (
                <div className="flex items-center space-x-2 px-2">
                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                      style={{ width: `${slideshow.getProgress()}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[24px]">
                    {slideshow.formatTime(slideshow.remainingTime)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right section - View controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="relative">
            <button
              onClick={() => setShowZoomControls(!showZoomControls)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Zoom: ${zoom?.getZoomPercentage()}%`}
            >
              <span className="text-sm font-medium">
                {zoom?.getZoomPercentage()}%
              </span>
            </button>
            
            {showZoomControls && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                <button
                  onClick={() => {
                    zoom?.zoomIn();
                    setShowZoomControls(false);
                  }}
                  disabled={!zoom?.canZoomIn}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <MdZoomIn size={16} />
                  <span>Zoom in</span>
                </button>
                
                <button
                  onClick={() => {
                    zoom?.zoomOut();
                    setShowZoomControls(false);
                  }}
                  disabled={!zoom?.canZoomOut}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <MdZoomOut size={16} />
                  <span>Zoom out</span>
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                
                <button
                  onClick={() => {
                    zoom?.resetZoom();
                    setShowZoomControls(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MdCropFree size={16} />
                  <span>Fit to window</span>
                </button>
                
                <button
                  onClick={() => {
                    zoom?.setActualSize();
                    setShowZoomControls(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MdCrop32 size={16} />
                  <span>Actual size</span>
                </button>
                
                <button
                  onClick={() => {
                    zoom?.fitToWidth();
                    setShowZoomControls(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Fit to width
                </button>
                
                <button
                  onClick={() => {
                    zoom?.fitToHeight();
                    setShowZoomControls(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Fit to height
                </button>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
          </button>
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          {/* Settings */}
          <button
            onClick={onShowSettings}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <MdSettings size={20} />
          </button>
          
          {/* Help */}
          <button
            onClick={onShowHelp}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Help"
          >
            <MdHelp size={20} />
          </button>
        </div>
      </div>
      
      {/* Current image info */}
      {currentImage && (
        <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <span className="font-medium">{currentImage}</span>
            {imageFiles && imageFiles.length > 0 && (
              <span className="ml-2">
                ({currentImageIndex + 1} of {imageFiles.length})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedToolbar; 