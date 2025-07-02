import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ 
  navigateNext, 
  navigatePrevious, 
  hasImages 
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!hasImages) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowRight':
        case ' ': // Spacebar
          event.preventDefault(); // Prevent page scroll
          navigateNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasImages, navigateNext, navigatePrevious]);
}; 