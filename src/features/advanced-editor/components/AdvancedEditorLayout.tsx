import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Project, EditorState, EditorMode, InspectorTab, Frame } from '../types';
import { BoardView } from './board/BoardView';
import { FrameEditorWrapper } from './frame/FrameEditorWrapper';
import { Inspector } from './shared/Inspector';
import { StatusBar } from './shared/StatusBar';
import { FloatingToolbar } from './shared/FloatingToolbar';
import { ZoomControls } from './shared/ZoomControls';
import { FloatingActionBar } from './shared/FloatingActionBar';
import { useAdvancedEditorContext } from '../providers/AdvancedEditorProvider';
import { useSharedKeyboardShortcuts } from '../../shared/hooks/use-keyboard-shortcuts';
import { useSharedProjectState } from '../hooks/useProjectState';
import { useSharedFocusController } from '../hooks/useFocusController';
import { getCompactFontData, loadFonts } from '../../shared/utils/fonts';
import { FONTS } from '../../shared/data/fonts';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '../../shared/constants/constants';
import { useSharedDataStore } from '../../shared/store/use-shared-data-store';
import '../styles/tokens.css';
import '../styles/light-theme.css';

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
        type: 'slide',
        duration: 0.3,
        curve: 'easeOut'
      }
    ],
    playRange: { startIndex: 0, endIndex: 2 }
  }
});

export const AdvancedEditorLayout: React.FC = () => {
  // Project state
  const { project, updateProject, updateFrame, addFrame, removeFrame } = useSharedProjectState(createSampleProject());
  
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

  const { stateManager } = useAdvancedEditorContext();
  useSharedKeyboardShortcuts();

  const { setCompactFonts, setFonts } = useSharedDataStore();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  // Frame selection handlers
  const handleFrameSelect = useCallback((frameId: string, multiSelect = false) => {
    setEditorState(prev => {
      if (multiSelect) {
        const newSelected = prev.selectedFrameIds.includes(frameId)
          ? prev.selectedFrameIds.filter(id => id !== frameId)
          : [...prev.selectedFrameIds, frameId];
        return { ...prev, selectedFrameIds: newSelected };
      } else {
        return { ...prev, selectedFrameIds: [frameId] };
      }
    });
  }, []);

  const handleFrameFocus = useCallback((frameId: string) => {
    setEditorState(prev => ({ ...prev, mode: 'frame', focusedFrameId: frameId }));
  }, []);

  const handleFrameUpdate = useCallback((frameId: string, updates: Partial<Frame>) => {
    updateFrame(frameId, updates);
  }, [updateFrame]);

  const handleProjectUpdate = useCallback((updates: Partial<Project>) => {
    updateProject(prev => ({ ...prev, ...updates }));
  }, [updateProject]);

  // Board state handlers
  const handleBoardStateChange = useCallback((updates: Partial<Project['board']>) => {
    setEditorState(prev => ({
      ...prev,
      boardState: { ...prev.boardState, ...updates }
    }));
    updateProject(prev => ({
      ...prev,
      board: { ...prev.board, ...updates }
    }));
  }, [updateProject]);

  // Tool change handler
  const handleToolChange = useCallback((tool: EditorState['currentTool']) => {
    setEditorState(prev => ({ ...prev, currentTool: tool }));
  }, []);

  // Export handler
  const handleExport = useCallback(() => {
    console.log('Export project:', project);
    alert('Export functionality will be implemented here');
  }, [project]);

  // New project handler
  const handleNew = useCallback(() => {
    console.log('New project');
    alert('New project functionality will be implemented here');
  }, []);

  // Open project handler
  const handleOpen = useCallback(() => {
    console.log('Open project');
    alert('Open project functionality will be implemented here');
  }, []);

  // Save project handler
  const handleSave = useCallback(() => {
    console.log('Save project:', project);
    alert('Save project functionality will be implemented here');
  }, [project]);

  // Recenter handler
  const handleRecenter = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      boardState: {
        ...prev.boardState,
        scroll: { x: 0, y: 0 },
        zoom: 0.23
      }
    }));
  }, []);

  return (
    <div className="figma-editor h-screen w-screen bg-background text-foreground overflow-hidden" data-theme={theme}>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Inspector */}
        <Inspector
          project={project}
          editorState={editorState}
          inspectorState={inspectorState}
          onInspectorStateChange={setInspectorState}
          notes={notes}
          onNotesChange={setNotes}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col relative">
          {editorState.mode === 'board' ? (
            <BoardView
              project={project}
              editorState={editorState}
              onFrameSelect={handleFrameSelect}
              onFrameFocus={handleFrameFocus}
              onCreateFrame={(position, size) => {
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
              }}
              onFrameUpdate={handleFrameUpdate}
              onBoardStateChange={handleBoardStateChange}
              showComments={showComments}
              comments={boardComments}
              onAddCommentToFrame={(frameId, x, y) => {
                const newComment = {
                  id: `comment-${Date.now()}`,
                  frameId,
                  content: '',
                  x: x || 0,
                  y: y || 0
                };
                setBoardComments(prev => [...prev, newComment]);
                setFocusCommentId(newComment.id);
              }}
              onDeleteComment={(commentId) => {
                setBoardComments(prev => prev.filter(c => c.id !== commentId));
              }}
              onUpdateComment={(commentId, updates) => {
                setBoardComments(prev => prev.map(c => 
                  c.id === commentId ? { ...c, ...updates } : c
                ));
              }}
              focusCommentId={focusCommentId}
            />
          ) : (
            <FrameEditorWrapper
              frame={project.frames.find(f => f.id === editorState.focusedFrameId)}
              onFrameUpdate={handleFrameUpdate}
              onExitFocus={() => setEditorState(prev => ({ ...prev, mode: 'board', focusedFrameId: null }))}
              onLayerSelect={(layerId) => {
                setEditorState(prev => ({ ...prev, selectedLayerIds: [layerId] }));
              }}
              selectedLayerIds={editorState.selectedLayerIds}
              theme={theme}
            />
          )}

          {/* Floating Toolbar (Board mode only) */}
          {editorState.mode === 'board' && (
            <FloatingToolbar
              currentTool={editorState.currentTool}
              onToolChange={handleToolChange}
              boardState={editorState.boardState}
              onBoardStateChange={handleBoardStateChange}
              onNotesClick={() => setInspectorState(prev => ({ ...prev, activeTab: 'notes' }))}
              showComments={showComments}
              onToggleComments={() => setShowComments(prev => !prev)}
            />
          )}

          {/* Zoom Controls (Board mode only) */}
          {editorState.mode === 'board' && (
            <ZoomControls
              zoom={editorState.boardState.zoom}
              onZoomChange={(zoom) => handleBoardStateChange({ zoom })}
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
