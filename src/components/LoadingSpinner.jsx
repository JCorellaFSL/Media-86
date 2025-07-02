import React from 'react';

const LoadingSpinner = ({ size = 16, className = "" }) => (
  <div 
    className={`animate-spin rounded-full border-2 border-gray-300 border-t-white ${className}`} 
    style={{ width: size, height: size }} 
  />
);

export default LoadingSpinner; 