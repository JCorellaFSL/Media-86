import { useState, useCallback, useEffect, useRef } from 'react';

// Default shortcuts configuration
const DEFAULT_SHORTCUTS = {
  // Navigation
  navigateNext: ['ArrowRight', 'Space', 'KeyD'],
  navigatePrevious: ['ArrowLeft', 'KeyA'],
  navigateFirst: ['Home'],
  navigateLast: ['End'],
  
  // Zoom controls
  zoomIn: ['Equal', 'NumpadAdd', 'KeyPlus'],
  zoomOut: ['Minus', 'NumpadSubtract'],
  resetZoom: ['Digit0', 'Numpad0'],
  actualSize: ['Digit1'],
  fitToWidth: ['Digit2'],
  fitToHeight: ['Digit3'],
  
  // File operations
  openFile: ['KeyO'],
  deleteFile: ['Delete'],
  renameFile: ['F2'],
  rotateLeft: ['KeyL'],
  rotateRight: ['KeyR'],
  
  // View controls
  toggleFullscreen: ['F11', 'KeyF'],
  toggleSidebar: ['Tab'],
  toggleViewMode: ['KeyV'],
  
  // Slideshow
  toggleSlideshow: ['KeyS'],
  pauseSlideshow: ['Escape'],
  
  // Application
  toggleTheme: ['KeyT'],
  showHelp: ['F1', 'Slash'],
  closeModal: ['Escape'],
};

// Action descriptions for UI
const ACTION_DESCRIPTIONS = {
  navigateNext: 'Next image',
  navigatePrevious: 'Previous image',
  navigateFirst: 'First image',
  navigateLast: 'Last image',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  resetZoom: 'Reset zoom',
  actualSize: 'Actual size',
  fitToWidth: 'Fit to width',
  fitToHeight: 'Fit to height',
  openFile: 'Open file',
  deleteFile: 'Delete file',
  renameFile: 'Rename file',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  toggleFullscreen: 'Toggle fullscreen',
  toggleSidebar: 'Toggle sidebar',
  toggleViewMode: 'Toggle view mode',
  toggleSlideshow: 'Toggle slideshow',
  pauseSlideshow: 'Pause slideshow',
  toggleTheme: 'Toggle theme',
  showHelp: 'Show help',
  closeModal: 'Close modal',
};

// Key display names for better UX
const KEY_DISPLAY_NAMES = {
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  Space: 'Space',
  Enter: 'Enter',
  Escape: 'Esc',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Del',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  Equal: '+',
  Minus: '-',
  Slash: '/',
  Backslash: '\\',
  NumpadAdd: 'Num +',
  NumpadSubtract: 'Num -',
  NumpadMultiply: 'Num *',
  NumpadDivide: 'Num /',
};

export const useCustomKeyboardShortcuts = (actions = {}) => {
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);
  const [isRecording, setIsRecording] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const actionsRef = useRef(actions);
  
  // Update actions ref when actions change
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Load shortcuts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('media86-shortcuts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setShortcuts({ ...DEFAULT_SHORTCUTS, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load shortcuts:', error);
    }
  }, []);

  // Save shortcuts to localStorage
  const saveShortcuts = useCallback((newShortcuts) => {
    try {
      localStorage.setItem('media86-shortcuts', JSON.stringify(newShortcuts));
    } catch (error) {
      console.warn('Failed to save shortcuts:', error);
    }
  }, []);

  // Convert key code to readable string
  const getKeyDisplayName = useCallback((key) => {
    // Handle special key codes
    if (key.startsWith('Key')) {
      return key.replace('Key', '');
    }
    if (key.startsWith('Digit')) {
      return key.replace('Digit', '');
    }
    
    return KEY_DISPLAY_NAMES[key] || key;
  }, []);

  // Format shortcut keys for display
  const formatShortcut = useCallback((keys) => {
    return keys.map(getKeyDisplayName).join(' or ');
  }, [getKeyDisplayName]);

  // Check if a key combination is already in use
  const isKeyInUse = useCallback((key, excludeAction = null) => {
    return Object.entries(shortcuts).some(([action, keys]) => {
      return action !== excludeAction && keys.includes(key);
    });
  }, [shortcuts]);

  // Update shortcut for an action
  const updateShortcut = useCallback((action, newKeys) => {
    const newShortcuts = {
      ...shortcuts,
      [action]: Array.isArray(newKeys) ? newKeys : [newKeys],
    };
    setShortcuts(newShortcuts);
    saveShortcuts(newShortcuts);
  }, [shortcuts, saveShortcuts]);

  // Add key to existing shortcut
  const addKeyToShortcut = useCallback((action, key) => {
    const currentKeys = shortcuts[action] || [];
    if (!currentKeys.includes(key)) {
      updateShortcut(action, [...currentKeys, key]);
    }
  }, [shortcuts, updateShortcut]);

  // Remove key from shortcut
  const removeKeyFromShortcut = useCallback((action, key) => {
    const currentKeys = shortcuts[action] || [];
    const newKeys = currentKeys.filter(k => k !== key);
    updateShortcut(action, newKeys);
  }, [shortcuts, updateShortcut]);

  // Reset shortcuts to defaults
  const resetShortcuts = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS);
    saveShortcuts(DEFAULT_SHORTCUTS);
  }, [saveShortcuts]);

  // Reset specific shortcut to default
  const resetShortcut = useCallback((action) => {
    const defaultKeys = DEFAULT_SHORTCUTS[action];
    if (defaultKeys) {
      updateShortcut(action, defaultKeys);
    }
  }, [updateShortcut]);

  // Start recording new shortcut
  const startRecording = useCallback((action) => {
    setIsRecording(action);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(null);
  }, []);

  // Handle key press during recording
  const handleRecordingKeyPress = useCallback((e) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const key = e.code;
    
    // Skip modifier keys alone
    if (['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(key)) {
      return;
    }
    
    // Check if key is already in use
    if (isKeyInUse(key, isRecording)) {
      // Could show a warning here
      console.warn(`Key ${key} is already in use`);
    }
    
    updateShortcut(isRecording, [key]);
    setIsRecording(null);
  }, [isRecording, isKeyInUse, updateShortcut]);

  // Main keyboard event handler
  const handleKeyPress = useCallback((e) => {
    // Skip if recording
    if (isRecording) {
      handleRecordingKeyPress(e);
      return;
    }
    
    // Skip if typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    
    const key = e.code;
    const actions = actionsRef.current;
    
    // Find matching action
    for (const [action, keys] of Object.entries(shortcuts)) {
      if (keys.includes(key) && actions[action]) {
        e.preventDefault();
        e.stopPropagation();
        actions[action]();
        break;
      }
    }
    
    // Special case for help toggle
    if (shortcuts.showHelp?.includes(key)) {
      e.preventDefault();
      setShowHelp(prev => !prev);
    }
  }, [isRecording, handleRecordingKeyPress, shortcuts]);

  // Get all shortcuts for display
  const getAllShortcuts = useCallback(() => {
    return Object.entries(shortcuts).map(([action, keys]) => ({
      action,
      keys,
      description: ACTION_DESCRIPTIONS[action] || action,
      formattedKeys: formatShortcut(keys),
    }));
  }, [shortcuts, formatShortcut]);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback(() => {
    const categories = {
      navigation: ['navigateNext', 'navigatePrevious', 'navigateFirst', 'navigateLast'],
      zoom: ['zoomIn', 'zoomOut', 'resetZoom', 'actualSize', 'fitToWidth', 'fitToHeight'],
      file: ['openFile', 'deleteFile', 'renameFile', 'rotateLeft', 'rotateRight'],
      view: ['toggleFullscreen', 'toggleSidebar', 'toggleViewMode'],
      slideshow: ['toggleSlideshow', 'pauseSlideshow'],
      application: ['toggleTheme', 'showHelp', 'closeModal'],
    };
    
    const result = {};
    
    Object.entries(categories).forEach(([category, actions]) => {
      result[category] = actions.map(action => ({
        action,
        keys: shortcuts[action] || [],
        description: ACTION_DESCRIPTIONS[action] || action,
        formattedKeys: formatShortcut(shortcuts[action] || []),
      }));
    });
    
    return result;
  }, [shortcuts, formatShortcut]);

  // Toggle help visibility
  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  // Export shortcuts for backup
  const exportShortcuts = useCallback(() => {
    return JSON.stringify(shortcuts, null, 2);
  }, [shortcuts]);

  // Import shortcuts from backup
  const importShortcuts = useCallback((shortcutsJson) => {
    try {
      const imported = JSON.parse(shortcutsJson);
      setShortcuts({ ...DEFAULT_SHORTCUTS, ...imported });
      saveShortcuts(imported);
      return true;
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
      return false;
    }
  }, [saveShortcuts]);

  return {
    // State
    shortcuts,
    isRecording,
    showHelp,
    
    // Controls
    updateShortcut,
    addKeyToShortcut,
    removeKeyFromShortcut,
    resetShortcuts,
    resetShortcut,
    startRecording,
    stopRecording,
    toggleHelp,
    
    // Event handlers
    handleKeyPress,
    handleRecordingKeyPress,
    
    // Utilities
    getKeyDisplayName,
    formatShortcut,
    isKeyInUse,
    getAllShortcuts,
    getShortcutsByCategory,
    exportShortcuts,
    importShortcuts,
    
    // Constants
    ACTION_DESCRIPTIONS,
    DEFAULT_SHORTCUTS,
  };
}; 