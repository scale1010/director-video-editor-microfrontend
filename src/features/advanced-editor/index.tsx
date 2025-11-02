import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, EditorState, EditorMode, InspectorTab, Frame, Tool, BoardState } from '../shared/figma-editor/types';
import { BoardView } from '../shared/figma-editor/components/BoardView';
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
// Simple Editor components are now used in separate frame editor page
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
  const { setCompactFonts, setFonts } = useDataState();

  // Initialize editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'board' as EditorMode,
    selectedFrames: [],
    selectedFrameIds: [], // Add this for keyboard shortcuts compatibility
    activeInspectorTab: 'properties' as InspectorTab,
    isCreatingFrame: false,
    isPanning: false,
    selectionBox: null,
    contextMenu: null,
    showComments: false,
    comments: [],
    focusCommentId: null,
    currentTool: 'move' as Tool,
    boardState: {
      zoom: 0.23,
      scroll: { x: 0, y: 0 },
      snap: true,
      rulers: false,
      guides: []
    }
  });

  // Initialize inspector state
  const [inspectorState, setInspectorState] = useState<{
    activeTab: InspectorTab;
    selectedItem: { type: 'frame' | 'layer'; id: string } | null;
  }>({
    activeTab: 'properties',
    selectedItem: null
  });

  // Initialize focus controller with proper parameters
  const { enterFrameFocus, exitFrameFocus } = useFocusController({
    editorState,
    setEditorState,
    setInspectorState
  });

  // Frame focus is now handled by navigation to separate frame editor page

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
  useKeyboardShortcuts({
    editorState,
    setEditorState,
    project,
    updateProject,
    enterFrameFocus,
    exitFrameFocus,
    updateFrame,
    removeFrame: deleteFrame
  });

  const handleFrameSelect = useCallback((frameId: string, multiSelect = false) => {
    setEditorState(prev => {
      const newSelectedFrames = multiSelect 
        ? prev.selectedFrames.includes(frameId)
          ? prev.selectedFrames.filter(id => id !== frameId)
          : [...prev.selectedFrames, frameId]
        : [frameId];
      
      return {
        ...prev,
        selectedFrames: newSelectedFrames,
        selectedFrameIds: newSelectedFrames // Keep both for compatibility
      };
    });
  }, []);

  const navigate = useNavigate();
  
  const handleFrameFocus = useCallback((frameId: string) => {
    // Navigate to frame editor instead of inline frame view
    navigate(`/frame-editor/${frameId}`);
  }, [navigate]);

  const handleCreateFrame = useCallback((position: { x: number; y: number }, size: { w: number; h: number }) => {
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${(project.frames?.length ?? 0) + 1}`,
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
    // Update both project.board AND editorState.boardState
    // The view uses editorState.boardState for rendering
    setEditorState(prev => ({
      ...prev,
      boardState: { ...prev.boardState, ...updates }
    }));
    updateProject(prev => ({
      ...prev,
      board: { ...prev.board, ...updates }
    }));
  }, [updateProject]);

  const handleBackToBoard = useCallback(() => {
    setFocusedFrameId(null);
    exitFrameFocus();
  }, [exitFrameFocus]);

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
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
            onAddCommentToFrame={(frameId, x, y) => {
              // Handle adding comments to frames
              console.log('Add comment to frame:', frameId, x, y);
            }}
            onDeleteComment={(commentId) => {
              // Handle deleting comments
              console.log('Delete comment:', commentId);
            }}
            onUpdateComment={(commentId, updates) => {
              // Handle updating comments
              console.log('Update comment:', commentId, updates);
            }}
          />

          {/* Floating UI Elements */}
          <FloatingActionBar
            editorState={editorState}
            onExport={() => {
              console.log('Export project:', project);
            }}
            onBackToBoard={handleBackToBoard}
          />

          <FloatingToolbar
            currentTool={editorState.currentTool}
            onToolChange={(tool) => {
              setEditorState(prev => ({ ...prev, currentTool: tool }));
            }}
            boardState={editorState.boardState}
            onBoardStateChange={(updates) => {
              setEditorState(prev => ({
                ...prev,
                boardState: { ...prev.boardState, ...updates }
              }));
            }}
            onAddFrame={handleCreateFrame}
            onUpdateProject={updateProject}
          />

          <ZoomControls 
            boardState={editorState.boardState}
            onBoardStateChange={(updates) => {
              setEditorState(prev => ({
                ...prev,
                boardState: { ...prev.boardState, ...updates }
              }));
            }}
            onRecenter={() => {
              setEditorState(prev => ({
                ...prev,
                boardState: { ...prev.boardState, scroll: { x: 0, y: 0 }, zoom: 1 }
              }));
            }}
          />

          {/* Inspector */}
          <Inspector
            state={inspectorState}
            onStateChange={setInspectorState}
            project={project}
            editorState={editorState}
            onFrameUpdate={handleFrameUpdate}
            onFrameSelect={handleFrameSelect}
            onFrameReorder={(fromIndex, toIndex) => {
              // Handle frame reordering
              const newOrder = [...project.sequence.order];
              const [movedFrame] = newOrder.splice(fromIndex, 1);
              newOrder.splice(toIndex, 0, movedFrame);
              updateProject(prev => ({
                ...prev,
                sequence: { ...prev.sequence, order: newOrder }
              }));
            }}
            onFrameAdd={() => {
              const newFrame: Frame = {
                id: `frame-${Date.now()}`,
                name: `Frame ${(project.frames?.length ?? 0) + 1}`,
                position: { x: 100, y: 100 },
                size: { w: 1080, h: 1920 },
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
            }}
            onFrameDelete={deleteFrame}
            onProjectUpdate={updateProject}
            focusedFrame={null}
          />
        </div>
      </div>

      {/* Status Bar at bottom */}
      <StatusBar 
        project={project}
        editorState={editorState}
      />
    </div>
  );
};

export default AdvancedEditor;
