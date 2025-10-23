import React, { createContext, useContext, ReactNode } from 'react';
import StateManager from '@designcombo/state';

// Create a new StateManager instance for Simple Editor
const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

interface SimpleEditorContextType {
  stateManager: StateManager;
}

const SimpleEditorContext = createContext<SimpleEditorContextType | undefined>(undefined);

export const useSimpleEditorContext = () => {
  const context = useContext(SimpleEditorContext);
  if (!context) {
    throw new Error('useSimpleEditorContext must be used within a SimpleEditorProvider');
  }
  return context;
};

interface SimpleEditorProviderProps {
  children: ReactNode;
}

export const SimpleEditorProvider: React.FC<SimpleEditorProviderProps> = ({ children }) => {
  return (
    <SimpleEditorContext.Provider value={{ stateManager }}>
      {children}
    </SimpleEditorContext.Provider>
  );
};
