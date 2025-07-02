import React from 'react';
import { MdDarkMode, MdLightMode, MdSettingsBrightness } from 'react-icons/md';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { theme, resolvedTheme, setLightTheme, setDarkTheme, setSystemTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <MdSettingsBrightness size={20} />;
    }
    return resolvedTheme === 'dark' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />;
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light theme';
      case 'dark': return 'Dark theme';
      case 'system': return 'System theme';
      default: return 'Toggle theme';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Simple toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
        title={getThemeLabel()}
      >
        <div className="transition-transform duration-200">
          {getThemeIcon()}
        </div>
      </button>
      
      {/* Dropdown for advanced theme selection */}
      <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
          <button
            onClick={setLightTheme}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <MdLightMode size={16} />
            <span>Light</span>
          </button>
          
          <button
            onClick={setDarkTheme}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <MdDarkMode size={16} />
            <span>Dark</span>
          </button>
          
          <button
            onClick={setSystemTheme}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <MdSettingsBrightness size={16} />
            <span>System</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact version for tight spaces
export const CompactThemeToggle = ({ className = '' }) => {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 rounded-md transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 ${className}`}
      title="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <MdLightMode size={16} /> : <MdDarkMode size={16} />}
    </button>
  );
};

export default ThemeToggle; 