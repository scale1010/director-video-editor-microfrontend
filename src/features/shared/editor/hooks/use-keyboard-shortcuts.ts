import { useEffect } from "react";
import useLayoutStore from "../store/use-layout-store";

export const useKeyboardShortcuts = () => {
  const { 
    setIsRightDrawerOpen, 
    isRightDrawerOpen, 
    setRightDrawerContent 
  } = useLayoutStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes drawer
      if (e.key === 'Escape') {
        setIsRightDrawerOpen(false);
      }

      // Ctrl+P toggles properties drawer
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (isRightDrawerOpen) {
          setIsRightDrawerOpen(false);
        } else {
          setRightDrawerContent('properties');
          setIsRightDrawerOpen(true);
        }
      }

      // Ctrl+Shift+P opens properties drawer
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setRightDrawerContent('properties');
        setIsRightDrawerOpen(true);
      }

      // Ctrl+Shift+C opens controls drawer
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setRightDrawerContent('controls');
        setIsRightDrawerOpen(true);
      }

      // Ctrl+Shift+S opens settings drawer
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setRightDrawerContent('settings');
        setIsRightDrawerOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRightDrawerOpen, setIsRightDrawerOpen, setRightDrawerContent]);
};
