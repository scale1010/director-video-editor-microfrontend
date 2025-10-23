import { useEffect, useRef } from 'react';
import StateManager from '@designcombo/state';

interface AutosaveOptions {
  debounceDelay?: number;
  periodicInterval?: number;
  enableLocalStorage?: boolean;
  enableBackend?: boolean;
}

export const useAutosave = (
  stateManager: StateManager,
  options: AutosaveOptions = {}
) => {
  const {
    debounceDelay = 2000,
    periodicInterval = 30000,
    enableLocalStorage = true,
    enableBackend = false
  } = options;

  const debounceRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const saveToLocalStorage = () => {
    if (enableLocalStorage) {
      try {
        const data = stateManager.getData();
        localStorage.setItem('editor-autosave', JSON.stringify(data));
        console.log('Autosaved to localStorage');
      } catch (error) {
        console.error('Failed to autosave to localStorage:', error);
      }
    }
  };

  const saveToBackend = async () => {
    if (enableBackend) {
      try {
        const data = stateManager.getData();
        // TODO: Implement backend autosave
        console.log('Autosaved to backend');
      } catch (error) {
        console.error('Failed to autosave to backend:', error);
      }
    }
  };

  const debouncedSave = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      saveToLocalStorage();
      saveToBackend();
    }, debounceDelay);
  };

  useEffect(() => {
    // Set up periodic autosave
    if (periodicInterval > 0) {
      intervalRef.current = setInterval(() => {
        saveToLocalStorage();
        saveToBackend();
      }, periodicInterval);
    }

    // Set up state change listener for debounced autosave
    const stateSubscription = stateManager.subscribeToState(() => {
      debouncedSave();
    });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stateSubscription && stateSubscription.unsubscribe) {
        stateSubscription.unsubscribe();
      }
    };
  }, [stateManager, debounceDelay, periodicInterval, enableLocalStorage, enableBackend]);

  return {
    saveToLocalStorage,
    saveToBackend,
    debouncedSave
  };
};
