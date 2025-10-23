import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Project, EditorState, EditorMode, InspectorTab, Frame } from '../shared/figma-editor/types';
import { BoardView } from '../shared/figma-editor/components/BoardView';
import { FrameEditorWrapper } from '../shared/figma-editor/components/FrameEditorWrapper';
import { Inspector } from '../shared/figma-editor/components/Inspector';
import { StatusBar } from '../shared/figma-editor/components/StatusBar';
import { FloatingToolbar } from '../shared/figma-editor/components/FloatingToolbar';
import { ZoomControls } from '../shared/figma-editor/components/ZoomControls';
import { FloatingActionBar } from '../shared/figma-editor/components/FloatingActionBar';
import { useKeyboardShortcuts } from '../shared/figma-editor/hooks/useKeyboardShortcuts';
import { useProjectState } from '../shared/figma-editor/hooks/useProjectState';
import { useFocusController } from '../shared/figma-editor/hooks/useFocusController';
import { getCompactFontData, loadFonts } from '../shared/editor/utils/fonts';
import { FONTS } from '../shared/editor/data/fonts';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '../shared/editor/constants/constants';
import useDataState from '../shared/editor/store/use-data-state';
import '../shared/figma-editor/styles/tokens.css';
import '../shared/figma-editor/styles/light-theme.css';

// Sample project data
const createSampleProject = (): Project => ({
  projectId: 'advanced-project-1',
  board: {
    zoom: 0.23,
    scroll: { x: 0, y: 0 },
    snap: true,
    rulers: false,
    guides: []
  },
  workspace: {
    defaultSize: { w: 1080, h: 1920 },
    backgroundColor: '#0b0b0b',
    gridColor: '#333333'
  },
  frames: [
    {
      id: 'frame-1',
      name: 'Intro',
      position: { x: 130, y: 650 },
      size: { w: 1080, h: 1920 },
      background: '#0b0b0b',
      fps: 30,
      duration: 6.0,
      posterTime: 0.25,
      labelColor: 'purple',
      layers: [],
      timeline: {
        duration: 6.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    },
    {
      id: 'frame-2',
      name: 'Main Content',
      position: { x: 2000, y: 0 },
      size: { w: 1080, h: 1920 },
      background: '#0b0b0b',
      fps: 30,
      duration: 10.0,
      posterTime: 2.0,
      labelColor: 'blue',
      layers: [],
      timeline: {
        duration: 10.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    },
    {
      id: 'frame-3',
      name: 'Outro',
      position: { x: 3350, y: 650 },
      size: { w: 1080, h: 1920 },
      background: '#0b0b0b',
      fps: 30,
      duration: 4.0,
      posterTime: 1.0,
      labelColor: 'green',
      layers: [],
      timeline: {
        duration: 4.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    }
  ],
  sequence: {
    order: ['frame-1', 'frame-2', 'frame-3'],
    transitions: [
      {
        id: 'transition-1',
        from: 'frame-1',
        to: 'frame-2',
        type: 'crossfade',
        duration: 0.5,
        curve: 'easeInOut'
      },
      {
        id: 'transition-2',
        from: 'frame-2',
        to: 'frame-3',
        type: 'crossfade',
        duration: 0.5,
        curve: 'easeInOut'
      }
    ]
  }
});

export const AdvancedEditor: React.FC = () => {
  const { project, updateProject, updateFrame, addFrame, deleteFrame } = useProjectState(createSampleProject());
  const { focusedFrameId, setFocusedFrameId, isFrameFocused } = useFocusController();
  const { setCompactFonts, setFonts } = useDataState();

  // Initialize editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'board' as EditorMode,
    selectedFrames: [],
    activeInspectorTab: 'properties' as InspectorTab,
    isCreatingFrame: false,
    isPanning: false,
    selectionBox: null,
    contextMenu: null,
    showComments: false,
    comments: [],
    focusCommentId: null
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

  // Keyboard shortcuts
  useKeyboardShortcuts();

  const handleFrameSelect = useCallback((frameId: string, multiSelect = false) => {
    setEditorState(prev => ({
      ...prev,
      selectedFrames: multiSelect 
        ? prev.selectedFrames.includes(frameId)
          ? prev.selectedFrames.filter(id => id !== frameId)
          : [...prev.selectedFrames, frameId]
        : [frameId]
    }));
  }, []);

  const handleFrameFocus = useCallback((frameId: string) => {
    setFocusedFrameId(frameId);
    setEditorState(prev => ({
      ...prev,
      mode: 'frame' as EditorMode,
      selectedFrames: [frameId]
    }));
  }, [setFocusedFrameId]);

  const handleCreateFrame = useCallback((position: { x: number; y: number }, size: { w: number; h: number }) => {
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${project.frames.length + 1}`,
      position,
      size,
      background: project.workspace.backgroundColor,
      fps: 30,
      duration: 5.0,
      posterTime: 0.25,
      labelColor: 'blue',
      layers: [],
      timeline: {
        duration: 5.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    };
    addFrame(newFrame);
  }, [project.frames.length, project.workspace.backgroundColor, addFrame]);

  const handleFrameUpdate = useCallback((frameId: string, updates: Partial<Frame>) => {
    updateFrame(frameId, updates);
  }, [updateFrame]);

  const handleBoardStateChange = useCallback((updates: Partial<Project['board']>) => {
    updateProject({
      board: { ...project.board, ...updates }
    });
  }, [project.board, updateProject]);

  const handleBackToBoard = useCallback(() => {
    setFocusedFrameId(null);
    setEditorState(prev => ({
      ...prev,
      mode: 'board' as EditorMode,
      selectedFrames: []
    }));
  }, [setFocusedFrameId]);

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col">
      {/* Top Status Bar */}
      <StatusBar 
        project={project}
        focusedFrameId={focusedFrameId}
        onBackToBoard={handleBackToBoard}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isFrameFocused ? (
          <FrameEditorWrapper
            project={project}
            frameId={focusedFrameId!}
            onUpdateFrame={handleFrameUpdate}
            onBackToBoard={handleBackToBoard}
          />
        ) : (
          <div className="h-full relative">
            {/* Board View */}
            <BoardView
              project={project}
              editorState={editorState}
              onFrameSelect={handleFrameSelect}
              onFrameFocus={handleFrameFocus}
              onCreateFrame={handleCreateFrame}
              onFrameUpdate={handleFrameUpdate}
              onBoardStateChange={handleBoardStateChange}
              showComments={editorState.showComments}
              comments={editorState.comments}
              focusCommentId={editorState.focusCommentId}
            />

            {/* Floating UI Elements */}
            <FloatingActionBar
              project={project}
              onProjectUpdate={updateProject}
              onUpdateAllFrames={(updates) => {
                project.frames.forEach(frame => {
                  updateFrame(frame.id, updates);
                });
              }}
            />

            <FloatingToolbar
              project={project}
              onAddFrame={handleCreateFrame}
              onUpdateProject={updateProject}
            />

            <ZoomControls />

            {/* Inspector */}
            <Inspector
              project={project}
              onUpdateProject={updateProject}
            />
          </div>
        )}
      </div>
    </div>
  );
};
