import { useEffect } from 'react';
import { EditorState, Project, Frame, Tool } from '../types';

interface UseKeyboardShortcutsProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  project: Project;
  updateProject: (updater: (prev: Project) => Project) => void;
  enterFrameFocus: (frameId: string) => void;
  exitFrameFocus: () => void;
  updateFrame: (frameId: string, updates: Partial<Frame>) => void;
  removeFrame: (frameId: string) => void;
}

export const useKeyboardShortcuts = ({
  editorState,
  setEditorState,
  project,
  updateProject,
  enterFrameFocus,
  exitFrameFocus,
  updateFrame,
  removeFrame
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                            document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) return;

      // Tool shortcuts (only in board mode)
      if (editorState.mode === 'board') {
        if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'move' }));
          e.preventDefault();
        } else if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'hand' }));
          e.preventDefault();
        } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'frame' }));
          e.preventDefault();
        } else if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'text' }));
          e.preventDefault();
        } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'shape' }));
          e.preventDefault();
        } else if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'pen' }));
          e.preventDefault();
        } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
          setEditorState(prev => ({ ...prev, currentTool: 'comment' }));
          e.preventDefault();
        }
      }

      // Navigation shortcuts
      if (e.key === 'Escape') {
        if (editorState.mode === 'frame') {
          exitFrameFocus();
        } else {
          // Clear selection
          setEditorState(prev => ({ ...prev, selectedFrameIds: [] }));
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length === 1) {
          enterFrameFocus(editorState.selectedFrameIds[0]);
        }
        e.preventDefault();
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        const newZoom = Math.min(5, editorState.boardState.zoom * 1.2);
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: newZoom }
        }));
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        const newZoom = Math.max(0.1, editorState.boardState.zoom * 0.8);
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: newZoom }
        }));
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: 1 }
        }));
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: 1 }
        }));
        e.preventDefault();
      }

      // Zoom to selection (Shift+2)
      if (e.shiftKey && e.key === '2' && editorState.selectedFrameIds.length > 0) {
        // Calculate bounds of selected frames
        const selectedFrames = project.frames.filter(f => editorState.selectedFrameIds.includes(f.id));
        if (selectedFrames.length > 0) {
          const bounds = selectedFrames.reduce((acc, frame) => ({
            minX: Math.min(acc.minX, frame.position.x),
            minY: Math.min(acc.minY, frame.position.y),
            maxX: Math.max(acc.maxX, frame.position.x + frame.size.w),
            maxY: Math.max(acc.maxY, frame.position.y + frame.size.h)
          }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

          // Calculate zoom to fit
          const width = bounds.maxX - bounds.minX;
          const height = bounds.maxY - bounds.minY;
          const viewportWidth = window.innerWidth - 600; // Account for sidebars
          const viewportHeight = window.innerHeight - 100; // Account for toolbar
          const zoomX = viewportWidth / width;
          const zoomY = viewportHeight / height;
          const newZoom = Math.min(zoomX, zoomY, 1) * 0.8; // 80% to add padding

          setEditorState(prev => ({
            ...prev,
            boardState: {
              ...prev.boardState,
              zoom: newZoom,
              scroll: {
                x: -(bounds.minX * newZoom) + (viewportWidth - width * newZoom) / 2,
                y: -(bounds.minY * newZoom) + (viewportHeight - height * newZoom) / 2
              }
            }
          }));
        }
        e.preventDefault();
      }

      // Frame shortcuts
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length > 0) {
          // Delete selected frames
          editorState.selectedFrameIds.forEach(frameId => removeFrame(frameId));
          setEditorState(prev => ({ ...prev, selectedFrameIds: [] }));
        }
        e.preventDefault();
      }

      // Duplicate shortcut (Cmd/Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length > 0) {
          // Duplicate selected frames
          const framesToDuplicate = project.frames.filter(frame => 
            editorState.selectedFrameIds.includes(frame.id)
          );
          
          const newFrameIds: string[] = [];
          framesToDuplicate.forEach(frame => {
            const newFrame: Frame = {
              ...frame,
              id: `frame-${Date.now()}-${Math.random()}`,
              name: `${frame.name} Copy`,
              position: {
                x: frame.position.x + 50,
                y: frame.position.y + 50
              }
            };
            
            updateProject(prev => ({
              ...prev,
              frames: [...prev.frames, newFrame],
              sequence: {
                ...prev.sequence,
                order: [...prev.sequence.order, newFrame.id]
              }
            }));
            
            newFrameIds.push(newFrame.id);
          });

          setEditorState(prev => ({
            ...prev,
            selectedFrameIds: newFrameIds
          }));
        }
        e.preventDefault();
      }

      // Select all (Cmd/Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (editorState.mode === 'board') {
          setEditorState(prev => ({
            ...prev,
            selectedFrameIds: project.frames.map(f => f.id)
          }));
        }
        e.preventDefault();
      }

      // Rulers toggle (Shift+R)
      if (e.shiftKey && e.key === 'R') {
        setEditorState(prev => ({
          ...prev,
          boardState: {
            ...prev.boardState,
            rulers: !prev.boardState.rulers
          }
        }));
        e.preventDefault();
      }

      // Snap toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "'") {
        setEditorState(prev => ({
          ...prev,
          boardState: {
            ...prev.boardState,
            snap: !prev.boardState.snap
          }
        }));
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState, setEditorState, project, updateProject, enterFrameFocus, exitFrameFocus, updateFrame, removeFrame]);
};

