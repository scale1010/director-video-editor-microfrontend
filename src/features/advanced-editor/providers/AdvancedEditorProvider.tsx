import React, { createContext, useContext, ReactNode } from 'react';
import StateManager from '@designcombo/state';

// Create a new StateManager instance for Advanced Editor
const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

interface AdvancedEditorContextType {
  stateManager: StateManager;
}

const AdvancedEditorContext = createContext<AdvancedEditorContextType | undefined>(undefined);

export const useAdvancedEditorContext = () => {
  const context = useContext(AdvancedEditorContext);
  if (!context) {
    throw new Error('useAdvancedEditorContext must be used within an AdvancedEditorProvider');
  }
  return context;
};

interface AdvancedEditorProviderProps {
  children: ReactNode;
}

export const AdvancedEditorProvider: React.FC<AdvancedEditorProviderProps> = ({ children }) => {
  return (
    <AdvancedEditorContext.Provider value={{ stateManager }}>
      {children}
    </AdvancedEditorContext.Provider>
  );
};
