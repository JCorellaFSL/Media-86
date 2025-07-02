import React from 'react';
import { MdClose, MdSettings, MdConstruction } from 'react-icons/md';

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MdSettings size={24} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close"
          >
            <MdClose size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <MdConstruction size={64} className="mx-auto text-blue-500 dark:text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We're working on a comprehensive settings system that will include:
            </p>
          </div>

          <div className="text-left space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Appearance & Theme customization</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Keyboard shortcut editor</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Image viewing preferences</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Slideshow & performance options</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>And much more...</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Check out <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">settings_cog_plan.md</code> for the complete roadmap
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 