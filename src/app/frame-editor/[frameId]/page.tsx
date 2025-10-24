'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FrameProvider, useFrame } from '../../../features/shared/editor/contexts/FrameContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Settings } from 'lucide-react';
import SimpleEditor from '../../../features/simple-editor';
import StateManager from '@designcombo/state';
import { useAutosave } from '../../../features/shared/editor/hooks/use-autosave';
import { useKeyboardShortcuts } from '../../../features/shared/editor/hooks/use-keyboard-shortcuts';
import useTimelineEvents from '../../../features/shared/editor/hooks/use-timeline-events';
import { getCompactFontData, loadFonts } from '../../../features/shared/editor/utils/fonts';
import { FONTS } from '../../../features/shared/editor/data/fonts';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '../../../features/shared/editor/constants/constants';
import useDataState from '../../../features/shared/editor/store/use-data-state';
import { useRenderStore } from '../../../features/shared/render/store/use-render-store';
import { RenderProgress } from '../../../features/shared/render/components/RenderProgress';

const FrameEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { frame, isLoading, error, saveFrame, renderFrame } = useFrame();
  
  // Initialize StateManager for the frame
  const [stateManager] = useState(() => new StateManager({
    size: {
      width: frame?.size.width || 1080,
      height: frame?.size.height || 1920,
    },
  }));
  
  const { setCompactFonts, setFonts } = useDataState();
  const { renderFrame: renderFrameApi, currentRenderJob } = useRenderStore();
  
  // Initialize hooks
  useTimelineEvents();
  useKeyboardShortcuts();
  
  // Initialize autosave
  const autosave = useAutosave(stateManager, {
    debounceDelay: 2000,
    periodicInterval: 30000,
    enableLocalStorage: true,
    enableBackend: false,
  });
  
  // Initialize fonts
  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, [setCompactFonts, setFonts]);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  const handleBackToBoard = () => {
    navigate('/advanced-editor');
  };

  const handleSave = async () => {
    try {
      await saveFrame();
    } catch (error) {
      console.error('Failed to save frame:', error);
    }
  };

  const handleRender = async () => {
    if (!frame) return;
    
    try {
      await renderFrameApi(frame.id, {
        format: 'mp4',
        quality: 'high',
        fps: frame.fps,
        size: frame.size
      });
    } catch (error) {
      console.error('Failed to render frame:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading frame...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error Loading Frame</h1>
          <p className="mb-4">{error}</p>
          <Button onClick={handleBackToBoard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </div>
    );
  }

  if (!frame) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Frame Not Found</h1>
          <Button onClick={handleBackToBoard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col">
      {/* Header with Back Button and Actions */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToBoard}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
          <h1 className="text-lg font-semibold">Frame: {frame.name}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRender}
          >
            <Play className="w-4 h-4 mr-2" />
            Render
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Simple Editor Integration */}
      <div className="flex-1 overflow-hidden">
        <SimpleEditor />
      </div>

      {/* Render Progress */}
      {currentRenderJob && (
        <div className="absolute bottom-4 right-4 w-96 z-50">
          <RenderProgress 
            renderJob={currentRenderJob}
            onClose={() => {
              // Clear current render job
            }}
            onViewOutput={(url) => {
              window.open(url, '_blank');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default function FrameEditorPage() {
  const { frameId } = useParams<{ frameId: string }>();

  if (!frameId) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Frame ID</h1>
          <p>No frame ID provided in URL</p>
        </div>
      </div>
    );
  }

  return (
    <FrameProvider frameId={frameId}>
      <FrameEditorContent />
    </FrameProvider>
  );
}
