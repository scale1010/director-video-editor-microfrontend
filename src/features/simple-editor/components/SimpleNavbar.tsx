import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CloudUpload, Upload, Settings, Moon, Sun } from 'lucide-react';
import StateManager from '@designcombo/state';
import { generateDefaultFrameName } from '../../shared/utils/frameName';
import { useSharedCompositionStore } from '../../shared/store/use-shared-composition-store';
import { useSharedDownloadStore } from '../../shared/store/use-shared-download-store';
import { generateId } from '@designcombo/timeline';
import { IDesign } from '@designcombo/types';

interface SimpleNavbarProps {
  user: null;
  stateManager: StateManager;
  setFrameName: (name: string) => void;
  frameName: string;
  autosave?: any;
}

export const SimpleNavbar: React.FC<SimpleNavbarProps> = ({
  stateManager,
  setFrameName,
  frameName,
  autosave
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const { 
    saveComposition, 
    updateComposition,
    autosaveComposition,
    loadComposition, 
    currentComposition, 
    hasUnsavedChanges,
    setCurrentComposition,
    markUnsavedChanges,
    isLoading
  } = useSharedCompositionStore();

  const { actions, exporting } = useSharedDownloadStore();
  const [title, setTitle] = useState(frameName || generateDefaultFrameName());

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Update Tailwind dark mode class
    const rootElement = document.documentElement;
    if (newTheme === 'dark') {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  };

  // Handle new frame
  const handleNewFrame = () => {
    const newFrameName = generateDefaultFrameName();
    setFrameName(newFrameName);
    setTitle(newFrameName);
    setCurrentComposition(null);
    markUnsavedChanges();
  };

  // Handle save
  const handleSave = async () => {
    if (currentComposition) {
      const data: IDesign = {
        id: generateId(),
        ...stateManager.getState(),
      };
      await updateComposition(currentComposition.id, data);
    } else {
      setShowSaveModal(true);
    }
  };

  // Handle save as
  const handleSaveAs = async (name: string) => {
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    await saveComposition(name, data);
    setShowSaveAsModal(false);
  };

  // Handle export/render
  const handleExport = () => {
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    actions.setState({ payload: data });
    actions.startExport();
  };

  // Handle title edit
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    setFrameName(title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(frameName);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="bg-sidebar border-b border-border/80 flex h-14 items-center justify-between px-4">
      {/* Left section - Frame operations */}
      <div className="flex items-center gap-2">
        {/* New Frame Button */}
        <Button
          onClick={handleNewFrame}
          className="flex h-8 w-8 items-center justify-center border border-border"
          variant="outline"
          size="icon"
          title="New Frame"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="flex h-8 w-8 items-center justify-center border border-border"
          variant="outline"
          size="icon"
          title="Save"
        >
          <CloudUpload className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section - Frame Name */}
      <div className="flex h-14 items-center justify-center">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="bg-transparent border-none outline-none text-center text-lg font-medium text-foreground min-w-0 max-w-xs"
            style={{ width: `${Math.max(title.length * 8, 100)}px` }}
          />
        ) : (
          <button
            onClick={handleTitleEdit}
            className="text-lg font-medium text-foreground hover:text-foreground/80 transition-colors px-2 py-1 rounded hover:bg-muted/50"
            title="Click to rename frame"
          >
            {frameName}
          </button>
        )}
      </div>

      {/* Right section - Theme and Export */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          onClick={handleThemeToggle}
          className="flex h-8 w-8 items-center justify-center border border-border"
          variant="outline"
          size="icon"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="flex h-8 gap-1 border border-border transition-all duration-200"
          variant="outline"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              RENDERING...
            </>
          ) : (
            <>
              <Upload width={18} /> RENDER
            </>
          )}
        </Button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Frame</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-border rounded mb-4 bg-background text-foreground"
              placeholder="Frame name"
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowSaveModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveAs(title)}
                disabled={!title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
