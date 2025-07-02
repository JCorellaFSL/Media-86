import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  // Get system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default fallback
  }, []);

  // Resolve theme based on setting
  const resolveTheme = useCallback((themeValue) => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  }, [getSystemTheme]);

  // Apply theme to document
  const applyTheme = useCallback((themeValue) => {
    const resolved = resolveTheme(themeValue);
    setResolvedTheme(resolved);
    
    // Update document class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolved === 'dark' ? '#111827' : '#ffffff');
      }
    }
  }, [resolveTheme]);

  // Initialize theme from localStorage or system
  useEffect(() => {
    const savedTheme = localStorage.getItem('media86-theme');
    const initialTheme = savedTheme || 'system';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (theme === 'system') {
          applyTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  // Theme setters
  const setLightTheme = useCallback(() => {
    setTheme('light');
    localStorage.setItem('media86-theme', 'light');
    applyTheme('light');
  }, [applyTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
    localStorage.setItem('media86-theme', 'dark');
    applyTheme('dark');
  }, [applyTheme]);

  const setSystemTheme = useCallback(() => {
    setTheme('system');
    localStorage.setItem('media86-theme', 'system');
    applyTheme('system');
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('media86-theme', newTheme);
    applyTheme(newTheme);
  }, [resolvedTheme, applyTheme]);

  // Get theme colors for dynamic styling
  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    
    return {
      background: {
        primary: isDark ? '#111827' : '#ffffff',
        secondary: isDark ? '#1f2937' : '#f9fafb',
        tertiary: isDark ? '#374151' : '#f3f4f6',
      },
      text: {
        primary: isDark ? '#ffffff' : '#111827',
        secondary: isDark ? '#d1d5db' : '#374151',
        tertiary: isDark ? '#9ca3af' : '#6b7280',
      },
      border: {
        primary: isDark ? '#374151' : '#e5e7eb',
        secondary: isDark ? '#4b5563' : '#d1d5db',
      },
      accent: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }
    };
  }, [resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    toggleTheme,
    getThemeColors,
  };
}; 