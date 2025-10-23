import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Project, EditorState, EditorMode, InspectorTab, Frame } from './types';
import { BoardView } from './components/BoardView';
import { FrameEditorWrapper } from './components/FrameEditorWrapper';
import { Inspector } from './components/Inspector';
import { StatusBar } from './components/StatusBar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { ZoomControls } from './components/ZoomControls';
import { FloatingActionBar } from './components/FloatingActionBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectState } from './hooks/useProjectState';
import { useFocusController } from './hooks/useFocusController';
import { getCompactFontData, loadFonts } from '../editor/utils/fonts';
import { FONTS } from '../editor/data/fonts';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '../editor/constants/constants';
import useDataState from '../editor/store/use-data-state';
import './styles/tokens.css';
import './styles/light-theme.css';

// Sample project data
const createSampleProject = (): Project => ({
  projectId: 'figma-project-1',
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
      }
    ],
    loop: false,
    playRange: { startIndex: 0, endIndex: 2 }
  }
});

export const FigmaEditor: React.FC = () => {
  // Project state
  const { project, updateProject, updateFrame, addFrame, removeFrame } = useProjectState(createSampleProject());
  
  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'board',
    focusedFrameId: null,
    selectedFrameIds: [],
    selectedLayerIds: [],
    currentTool: 'hand',
    boardState: project.board,
    proxyQuality: 'half',
    isPlaying: false
  });

  // Inspector state
  const [inspectorState, setInspectorState] = useState({
    activeTab: 'frame' as InspectorTab,
    selectedItem: null as { type: 'frame' | 'layer'; id: string } | null
  });

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Initialize Tailwind dark mode on mount
  useEffect(() => {
    const rootElement = document.documentElement;
    if (theme === 'dark') {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  }, []);
  
  // Debug theme changes
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    console.log('Theme changing from', theme, 'to', newTheme);
    setTheme(newTheme);
    
    // Update Tailwind dark mode class
    const rootElement = document.documentElement;
    if (newTheme === 'dark') {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  };

  // Notes state
  const [notes, setNotes] = useState<Array<{
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    isLiked: boolean;
    likes: number;
    replies: any[];
    parentId?: string;
  }>>([]);

  // Board comments (post-it style)
  const [showComments, setShowComments] = useState<boolean>(true);
  const [boardComments, setBoardComments] = useState<Array<{
    id: string;
    frameId: string;
    content: string;
    x: number; // board coordinate
    y: number; // board coordinate
  }>>([]);
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);

  const handleAddCommentToFrame = useCallback((frameId: string, x?: number, y?: number) => {
    const frame = project.frames.find(f => f.id === frameId);
    if (!frame) return;
    const content = 'New comment';
    const defaultX = typeof x === 'number' ? x : frame.position.x + frame.size.w + 120;
    const defaultY = typeof y === 'number' ? y : frame.position.y + frame.size.h / 2;
    const newComment = {
      id: `c-${Date.now()}`,
      frameId,
      content,
      x: defaultX,
      y: defaultY
    };
    setBoardComments(prev => [...prev, newComment]);
    setShowComments(true);
    setFocusCommentId(newComment.id);
  }, [project.frames]);

  const handleDeleteComment = useCallback((commentId: string) => {
    setBoardComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const handleUpdateComment = useCallback((commentId: string, updates: Partial<{ content: string; x: number; y: number }>) => {
    setBoardComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updates } : c));
  }, []);

  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  // Focus controller
  const { enterFrameFocus, exitFrameFocus } = useFocusController({
    editorState,
    setEditorState,
    setInspectorState
  });

  // Initialize fonts for editor
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    // Load font data
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
    
    // Load secondary font
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, [setCompactFonts, setFonts]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    editorState,
    setEditorState,
    project,
    updateProject,
    enterFrameFocus,
    exitFrameFocus,
    updateFrame,
    removeFrame
  });

  // Handle frame selection
  const handleFrameSelect = useCallback((frameId: string, multiSelect: boolean = false) => {
    setEditorState(prev => ({
      ...prev,
      selectedFrameIds: multiSelect 
        ? prev.selectedFrameIds.includes(frameId)
          ? prev.selectedFrameIds.filter(id => id !== frameId)
          : [...prev.selectedFrameIds, frameId]
        : [frameId],
      selectedLayerIds: [] // Clear layer selection when selecting frames
    }));
    
    setInspectorState(prev => ({
      ...prev,
      selectedItem: { type: 'frame', id: frameId }
    }));
  }, []);

  // Handle frame focus (enter frame editing mode)
  const handleFrameFocus = useCallback((frameId: string) => {
    enterFrameFocus(frameId);
  }, [enterFrameFocus]);

  // Handle frame creation
  const handleCreateFrame = useCallback((position: { x: number; y: number }, size: { w: number; h: number }) => {
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${project.frames.length + 1}`,
      position,
      size,
      background: '#0b0b0b',
      fps: 30,
      duration: 5.0,
      posterTime: 0.5,
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
    handleFrameSelect(newFrame.id);
  }, [project.frames.length, addFrame, handleFrameSelect]);

  // Handle frame update
  const handleFrameUpdate = useCallback((frameId: string, updates: Partial<Frame>) => {
    updateFrame(frameId, updates);
  }, [updateFrame]);

  // Handle project update
  const handleProjectUpdate = useCallback((updates: Partial<Project>) => {
    updateProject(prev => ({ ...prev, ...updates }));
  }, [updateProject]);

  // Handle frame reordering
  const handleFrameReorder = useCallback((fromIndex: number, toIndex: number) => {
    const newOrder = [...project.sequence.order];
    const [movedFrame] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedFrame);
    
    updateProject(prev => ({
      ...prev,
      sequence: {
        ...prev.sequence,
        order: newOrder
      }
    }));
  }, [project.sequence.order, updateProject]);

  // Handle board state changes
  const handleBoardStateChange = useCallback((updates: Partial<typeof editorState.boardState>) => {
    setEditorState(prev => ({
      ...prev,
      boardState: { ...prev.boardState, ...updates }
    }));
    
    updateProject(prev => ({
      ...prev,
      board: { ...prev.board, ...updates }
    }));
  }, [updateProject]);

  // Handle frame delete
  const handleFrameDelete = useCallback((frameId: string) => {
    if (window.confirm('Are you sure you want to delete this frame?')) {
      removeFrame(frameId);
    }
  }, [removeFrame]);

  // Handle export
  const handleExport = useCallback(() => {
    console.log('Export project:', project);
    alert('Export functionality will be implemented here');
  }, [project]);

  // Handle file actions
  const handleNew = useCallback(() => {
    console.log('New project');
    alert('New project functionality will be implemented here');
  }, []);

  const handleOpen = useCallback(() => {
    console.log('Open project');
    alert('Open project functionality will be implemented here');
  }, []);

  const handleSave = useCallback(() => {
    console.log('Save project:', project);
    alert('Save project functionality will be implemented here');
  }, [project]);

  // Handle recenter view
  const handleRecenter = useCallback(() => {
    // Simple recenter - show all frames
    handleBoardStateChange({
      zoom: 0.23,
      scroll: { x: 0, y: 0 }
    });
  }, [handleBoardStateChange]);

  // Handle notes click
  const handleNotesClick = useCallback(() => {
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'notes'
    }));
  }, []);

  // Handle frame add from Inspector (with default position and size)
  const handleFrameAddFromInspector = useCallback(() => {
    const defaultPosition = { x: 200 * (project.frames.length + 1), y: 0 };
    const defaultSize = { w: 1080, h: 1920 };
    handleCreateFrame(defaultPosition, defaultSize);
  }, [handleCreateFrame, project.frames.length]);

  // Handle layer selection
  const handleLayerSelect = useCallback((layerId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedLayerIds: [layerId]
    }));
    
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'notes',
      selectedItem: { type: 'layer', id: layerId }
    }));
  }, []);

  // Get focused frame
  const focusedFrame = editorState.focusedFrameId 
    ? project.frames.find(f => f.id === editorState.focusedFrameId)
    : null;

  return (
    <div 
      className="figma-editor h-screen w-full flex flex-col overflow-hidden"
      data-theme={theme}
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inspector (Hidden in frame view) */}
        {editorState.mode === 'board' && (
          <Inspector
            state={inspectorState}
            onStateChange={setInspectorState}
            project={project}
            editorState={editorState}
            onFrameUpdate={handleFrameUpdate}
            onFrameSelect={handleFrameSelect}
            onFrameReorder={handleFrameReorder}
            onFrameAdd={handleFrameAddFromInspector}
            onFrameDelete={handleFrameDelete}
            onProjectUpdate={handleProjectUpdate}
            focusedFrame={focusedFrame}
            notes={notes}
            onNotesChange={setNotes}
          />
        )}

        {/* Center - Board or Frame Editor */}
        <div className="flex-1 relative overflow-hidden">
          {editorState.mode === 'board' ? (
            <BoardView
              project={project}
              editorState={editorState}
              onFrameSelect={handleFrameSelect}
              onFrameFocus={handleFrameFocus}
              onCreateFrame={handleCreateFrame}
              onFrameUpdate={handleFrameUpdate}
              onBoardStateChange={handleBoardStateChange}
              showComments={showComments}
              comments={boardComments}
              onAddCommentToFrame={handleAddCommentToFrame}
              onDeleteComment={handleDeleteComment}
              onUpdateComment={handleUpdateComment}
              focusCommentId={focusCommentId || undefined}
            />
          ) : focusedFrame ? (
            <FrameEditorWrapper
              frame={focusedFrame}
              onFrameUpdate={handleFrameUpdate}
              onExitFocus={exitFrameFocus}
              onLayerSelect={handleLayerSelect}
              selectedLayerIds={editorState.selectedLayerIds}
              theme={theme}
            />
          ) : null}

          {/* Floating Toolbar - Only show in board mode */}
          {editorState.mode === 'board' && (
            <FloatingToolbar
              currentTool={editorState.currentTool}
              onToolChange={(tool) => setEditorState(prev => ({ ...prev, currentTool: tool }))}
              boardState={editorState.boardState}
              onBoardStateChange={handleBoardStateChange}
              onNotesClick={handleNotesClick}
              showComments={showComments}
              onToggleComments={handleToggleComments}
            />
          )}

          {/* Zoom Controls - Only show in board mode */}
          {editorState.mode === 'board' && (
            <ZoomControls
              boardState={editorState.boardState}
              onBoardStateChange={handleBoardStateChange}
              onRecenter={handleRecenter}
            />
          )}

          {/* Floating Action Bar - Always visible */}
          <FloatingActionBar
            editorState={editorState}
            onExport={handleExport}
            onNew={handleNew}
            onOpen={handleOpen}
            onSave={handleSave}
            onBackToBoard={editorState.mode === 'frame' ? () => setEditorState(prev => ({ ...prev, mode: 'board', focusedFrameId: null })) : undefined}
            onRender={editorState.mode === 'frame' ? () => {
              console.log('Render frame:', editorState.focusedFrameId);
              alert('Render functionality will be implemented here');
            } : undefined}
            frame={editorState.mode === 'frame' ? project.frames.find(f => f.id === editorState.focusedFrameId) : undefined}
            onFrameUpdate={editorState.mode === 'frame' ? handleFrameUpdate : undefined}
            project={project}
            onProjectUpdate={handleProjectUpdate}
            onUpdateAllFrames={(updates) => {
              project.frames.forEach(frame => {
                handleFrameUpdate(frame.id, updates);
              });
            }}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>

      {/* Status Bar at bottom (Only in board mode) */}
      {editorState.mode === 'board' && (
        <StatusBar
          project={project}
          editorState={editorState}
        />
      )}
    </div>
  );
};
