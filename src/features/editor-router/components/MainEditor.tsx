import React from 'react';
import { MainEditorRouter } from '../index';
import { EditorModeSwitcher } from './EditorModeSwitcher';

interface MainEditorProps {
  initialMode?: 'simple' | 'advanced' | 'expert';
  showModeSwitcher?: boolean;
}

export const MainEditor: React.FC<MainEditorProps> = ({ 
  initialMode = 'simple',
  showModeSwitcher = true 
}) => {
  return (
    <div className="h-screen w-screen bg-background">
      {/* Mode Switcher - Optional top bar */}
      {showModeSwitcher && (
        <div className="absolute top-4 left-4 z-50">
          <EditorModeSwitcher />
        </div>
      )}
      
      {/* Main Editor Router */}
      <MainEditorRouter initialMode={initialMode} />
    </div>
  );
};
