import React, { useState, createContext, useContext, ReactNode } from 'react';
import { SimpleEditor } from '../simple-editor';
import { AdvancedEditor } from '../advanced-editor';

// Editor modes
export type EditorMode = 'simple' | 'advanced' | 'expert';

interface EditorRouterContextType {
  currentMode: EditorMode;
  setCurrentMode: (mode: EditorMode) => void;
  availableModes: EditorMode[];
}

const EditorRouterContext = createContext<EditorRouterContextType | undefined>(undefined);

export const useEditorRouter = () => {
  const context = useContext(EditorRouterContext);
  if (!context) {
    throw new Error('useEditorRouter must be used within an EditorRouterProvider');
  }
  return context;
};

interface EditorRouterProviderProps {
  children: ReactNode;
  initialMode?: EditorMode;
}

export const EditorRouterProvider: React.FC<EditorRouterProviderProps> = ({ 
  children, 
  initialMode = 'simple' 
}) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(initialMode);
  
  const availableModes: EditorMode[] = ['simple', 'advanced']; // 'expert' will be added later

  return (
    <EditorRouterContext.Provider value={{ 
      currentMode, 
      setCurrentMode, 
      availableModes 
    }}>
      {children}
    </EditorRouterContext.Provider>
  );
};

interface EditorRouterProps {
  initialMode?: EditorMode;
}

export const EditorRouter: React.FC<EditorRouterProps> = ({ initialMode = 'simple' }) => {
  const { currentMode } = useEditorRouter();

  const renderEditor = () => {
    switch (currentMode) {
      case 'simple':
        return <SimpleEditor />;
      case 'advanced':
        return <AdvancedEditor />;
      case 'expert':
        return (
          <div className="flex items-center justify-center h-screen text-muted-foreground">
            Expert Editor - Coming Soon
          </div>
        );
      default:
        return <SimpleEditor />;
    }
  };

  return (
    <div className="h-screen w-screen">
      {renderEditor()}
    </div>
  );
};

// Main Editor Router Component
export const MainEditorRouter: React.FC<EditorRouterProps> = ({ initialMode = 'simple' }) => {
  return (
    <EditorRouterProvider initialMode={initialMode}>
      <EditorRouter initialMode={initialMode} />
    </EditorRouterProvider>
  );
};
