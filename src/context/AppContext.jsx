import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentDirectory, setCurrentDirectory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState("Click a button to begin!");
  const [imageKey, setImageKey] = useState(Date.now()); // For cache-busting
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  const value = {
    // Directory and files
    currentDirectory,
    setCurrentDirectory,
    imageFiles,
    setImageFiles,
    
    // UI state
    message,
    setMessage,
    imageKey,
    setImageKey,
    viewMode,
    setViewMode,

    // Helper functions
    refreshImageKey: () => setImageKey(Date.now()),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 