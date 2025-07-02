import React from 'react';
import { MdImage } from "react-icons/md";

const ImageViewer = ({ currentImagePath, currentImage }) => {
  if (!currentImagePath) {
    return (
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
    );
  }

  return (
    <div className="image-container w-full h-full flex items-center justify-center p-2 md:p-4">
      <img
        key={currentImagePath}
        src={currentImagePath}
        alt={currentImage}
        className="max-w-full max-h-full object-contain shadow-2xl"
      />
    </div>
  );
};

export default ImageViewer; 