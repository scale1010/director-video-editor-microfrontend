import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, EditorState, Frame, SNAP_THRESHOLD } from '../../types';
import { FramePreview } from './FramePreview';
import { Rulers } from './Rulers';
import { Guides } from './Guides';
import { SelectionBox } from './SelectionBox';
import { FrameArrows } from './FrameArrows';

interface BoardViewProps {
  project: Project;
  editorState: EditorState;
  onFrameSelect: (frameId: string, multiSelect?: boolean) => void;
  onFrameFocus: (frameId: string) => void;
  onCreateFrame: (position: { x: number; y: number }, size: { w: number; h: number }) => void;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
  onBoardStateChange: (updates: Partial<Project['board']>) => void;
  showComments?: boolean;
  comments?: Array<{ id: string; frameId: string; content: string; x: number; y: number }>;
  onAddCommentToFrame?: (frameId: string, x?: number, y?: number) => void;
  onDeleteComment?: (commentId: string) => void;
  onUpdateComment?: (commentId: string, updates: Partial<{ content: string; x: number; y: number }>) => void;
  focusCommentId?: string;
}

export const BoardView: React.FC<BoardViewProps> = ({
  project,
  editorState,
  onFrameSelect,
  onFrameFocus,
  onCreateFrame,
  onFrameUpdate,
  onBoardStateChange,
  showComments,
  comments,
  onAddCommentToFrame,
  onDeleteComment,
  onUpdateComment,
  focusCommentId
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [frameCreationStart, setFrameCreationStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  // Simplified: no context menu; direct add on right-click
  const commentRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const MAX_COMMENT_CHARS = 280;
  useEffect(() => {
    if (focusCommentId && commentRefs.current[focusCommentId]) {
      const el = commentRefs.current[focusCommentId]!;
      el.focus();
      // select all
      el.setSelectionRange(0, el.value.length);
    }
  }, [focusCommentId]);

  // Convert screen coordinates to board coordinates
  const screenToBoard = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (screenX - rect.left - editorState.boardState.scroll.x) / editorState.boardState.zoom,
      y: (screenY - rect.top - editorState.boardState.scroll.y) / editorState.boardState.zoom
    };
  }, [editorState.boardState.zoom, editorState.boardState.scroll]);

  // No auto-center - let initial state handle positioning

  // Track space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, editorState.boardState.zoom * delta));
      
      onBoardStateChange({ zoom: newZoom });
    }
  }, [editorState.boardState.zoom, onBoardStateChange]);

  // Handle mouse down / context menu (right click)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const boardPos = screenToBoard(e.clientX, e.clientY);

    // Check if clicking on a frame
    const clickedFrame = project.frames.find(frame => {
      return boardPos.x >= frame.position.x &&
             boardPos.x <= frame.position.x + frame.size.w &&
             boardPos.y >= frame.position.y &&
             boardPos.y <= frame.position.y + frame.size.h;
    });

    // Direct add on right-click: place a note to the right at clicked height
    if (e.button === 2 && onAddCommentToFrame) {
      if (clickedFrame) {
        e.preventDefault();
        const placeX = clickedFrame.position.x + clickedFrame.size.w + 40;
        const placeY = boardPos.y;
        onAddCommentToFrame(clickedFrame.id, placeX, placeY);
        return;
      }
    }

    // Handle different tools
    if (editorState.currentTool === 'hand' || e.button === 1 || (e.button === 0 && isSpacePressed)) {
      // Pan mode
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (editorState.currentTool === 'frame') {
      // Frame creation mode
      if (!clickedFrame) {
        setIsCreatingFrame(true);
        setFrameCreationStart(boardPos);
        setSelectionBox({ x: boardPos.x, y: boardPos.y, width: 0, height: 0 });
      }
    } else if (editorState.currentTool === 'move') {
      // Selection mode
      if (clickedFrame) {
        onFrameSelect(clickedFrame.id, e.shiftKey);
        setDraggedFrameId(clickedFrame.id);
        setDragOffset({
          x: boardPos.x - clickedFrame.position.x,
          y: boardPos.y - clickedFrame.position.y
        });
      } else {
        // Start selection box
        if (!e.shiftKey) {
          onFrameSelect('', false); // Clear selection
        }
        setSelectionBox({ x: boardPos.x, y: boardPos.y, width: 0, height: 0 });
      }
    }
  }, [editorState.currentTool, project.frames, screenToBoard, onFrameSelect, isSpacePressed, onAddCommentToFrame]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      onBoardStateChange({
        scroll: {
          x: editorState.boardState.scroll.x + dx,
          y: editorState.boardState.scroll.y + dy
        }
      });
      
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (isCreatingFrame && frameCreationStart) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      
      setSelectionBox({
        x: Math.min(boardPos.x, frameCreationStart.x),
        y: Math.min(boardPos.y, frameCreationStart.y),
        width: Math.abs(boardPos.x - frameCreationStart.x),
        height: Math.abs(boardPos.y - frameCreationStart.y)
      });
    } else if (draggedFrameId) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      let newX = boardPos.x - dragOffset.x;
      let newY = boardPos.y - dragOffset.y;

      // Apply snapping if enabled
      if (editorState.boardState.snap) {
        const frame = project.frames.find(f => f.id === draggedFrameId);
        if (frame) {
          // Snap to guides
          for (const guide of project.board.guides) {
            if (guide.orientation === 'vertical') {
              if (Math.abs(newX - guide.pos) < SNAP_THRESHOLD) newX = guide.pos;
              if (Math.abs(newX + frame.size.w - guide.pos) < SNAP_THRESHOLD) newX = guide.pos - frame.size.w;
            } else {
              if (Math.abs(newY - guide.pos) < SNAP_THRESHOLD) newY = guide.pos;
              if (Math.abs(newY + frame.size.h - guide.pos) < SNAP_THRESHOLD) newY = guide.pos - frame.size.h;
            }
          }

          // Snap to other frames
          for (const otherFrame of project.frames) {
            if (otherFrame.id === draggedFrameId) continue;
            
            // Vertical snapping
            if (Math.abs(newX - otherFrame.position.x) < SNAP_THRESHOLD) newX = otherFrame.position.x;
            if (Math.abs(newX + frame.size.w - (otherFrame.position.x + otherFrame.size.w)) < SNAP_THRESHOLD) {
              newX = otherFrame.position.x + otherFrame.size.w - frame.size.w;
            }
            
            // Horizontal snapping
            if (Math.abs(newY - otherFrame.position.y) < SNAP_THRESHOLD) newY = otherFrame.position.y;
            if (Math.abs(newY + frame.size.h - (otherFrame.position.y + otherFrame.size.h)) < SNAP_THRESHOLD) {
              newY = otherFrame.position.y + otherFrame.size.h - frame.size.h;
            }
          }
        }
      }

      onFrameUpdate(draggedFrameId, {
        position: { x: newX, y: newY }
      });
    } else if (selectionBox && !isCreatingFrame) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      
      setSelectionBox(prev => prev ? {
        x: prev.x,
        y: prev.y,
        width: boardPos.x - prev.x,
        height: boardPos.y - prev.y
      } : null);
    }
  }, [isPanning, panStart, isCreatingFrame, frameCreationStart, draggedFrameId, dragOffset, selectionBox, 
      screenToBoard, onBoardStateChange, onFrameUpdate, editorState.boardState, project]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isCreatingFrame && frameCreationStart && selectionBox) {
      // Create frame
      const size = {
        w: Math.max(100, Math.abs(selectionBox.width)),
        h: Math.max(100, Math.abs(selectionBox.height))
      };
      
      const position = {
        x: selectionBox.width >= 0 ? selectionBox.x : selectionBox.x + selectionBox.width,
        y: selectionBox.height >= 0 ? selectionBox.y : selectionBox.y + selectionBox.height
      };
      
      onCreateFrame(position, size);
    } else if (selectionBox && !isCreatingFrame && !draggedFrameId) {
      // Multi-select frames within selection box
      const box = {
        x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
        y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
        w: Math.abs(selectionBox.width),
        h: Math.abs(selectionBox.height)
      };

      project.frames.forEach(frame => {
        const frameInBox = 
          frame.position.x + frame.size.w > box.x &&
          frame.position.x < box.x + box.w &&
          frame.position.y + frame.size.h > box.y &&
          frame.position.y < box.y + box.h;

        if (frameInBox) {
          onFrameSelect(frame.id, true);
        }
      });
    }

    setIsPanning(false);
    setIsCreatingFrame(false);
    setFrameCreationStart(null);
    setSelectionBox(null);
    setDraggedFrameId(null);
  }, [isCreatingFrame, frameCreationStart, selectionBox, draggedFrameId, onCreateFrame, onFrameSelect, project.frames]);

  // Handle double click to focus frame
  const handleFrameDoubleClick = useCallback((frameId: string) => {
    onFrameFocus(frameId);
  }, [onFrameFocus]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  // Get cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (editorState.currentTool === 'hand') return 'grab';
    if (editorState.currentTool === 'frame') return 'crosshair';
    if (editorState.currentTool === 'text') return 'text';
    if (editorState.currentTool === 'pen') return 'crosshair';
    return 'default';
  };

  return (
    <div
      ref={canvasRef}
      className="board w-full h-full relative overflow-hidden"
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: getCursorStyle(),
        '--grid-color': project.workspace.gridColor
      } as React.CSSProperties}
    >
      {/* Rulers */}
      {editorState.boardState.rulers && (
        <Rulers
          zoom={editorState.boardState.zoom}
          scroll={editorState.boardState.scroll}
        />
      )}

      {/* Canvas Content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${editorState.boardState.scroll.x}px, ${editorState.boardState.scroll.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        <div
          style={{
            transform: `scale(${editorState.boardState.zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Guides */}
          <Guides
            guides={project.board.guides}
            zoom={editorState.boardState.zoom}
          />

          {/* Frame Arrows - Connect frames in sequence order */}
          <FrameArrows
            frames={project.frames}
            sequenceOrder={project.sequence.order}
            zoom={editorState.boardState.zoom}
            scroll={editorState.boardState.scroll}
          />

          {/* Frame Previews */}
          {project.frames.map(frame => (
            <FramePreview
              key={frame.id}
              frame={frame}
              isSelected={editorState.selectedFrameIds.includes(frame.id)}
              onSelect={() => onFrameSelect(frame.id)}
              onDoubleClick={() => handleFrameDoubleClick(frame.id)}
              onUpdate={(updates) => onFrameUpdate(frame.id, updates)}
              zoom={editorState.boardState.zoom}
            />
          ))}

          {/* Comments (Post-it) and dotted arrows */}
          {showComments && comments && comments.map(c => {
            const frame = project.frames.find(f => f.id === c.frameId);
            if (!frame) return null;
            const startX = frame.position.x + frame.size.w;
            const startY = frame.position.y + frame.size.h / 2;
            const endX = c.x;
            const endY = c.y;
            const ctrlX1 = startX + Math.abs(endX - startX) * 0.5;
            const ctrlY1 = startY;
            const ctrlX2 = endX - Math.abs(endX - startX) * 0.5;
            const ctrlY2 = endY;
            const path = `M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`;
            const noteHeight = Math.max(60, Math.floor(frame.size.h * 0.14));
            const noteWidth = Math.floor(noteHeight * 1.2);
            return (
              <React.Fragment key={c.id}>
                <svg
                  style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
                  viewBox={`0 0 100 100`}
                  preserveAspectRatio="none"
                >
                  <g transform={`scale(1)`}>
                    <path d={path} stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none" strokeDasharray="4 4" />
                  </g>
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    left: c.x - noteWidth / 2,
                    top: c.y - noteHeight / 2,
                    width: noteWidth,
                    height: noteHeight,
                    background: '#FFF59D',
                    color: '#333',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: 6,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    padding: '8px 10px',
                    fontSize: Math.floor(noteHeight * 0.14 * 1.3),
                    lineHeight: 1.4,
                    zIndex: 4
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Delete button */}
                  {onDeleteComment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this comment?')) {
                          onDeleteComment(c.id);
                        }
                      }}
                      title="Delete Comment"
                      style={{
                        position: 'absolute',
                        right: -14,
                        top: -14,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 900,
                        lineHeight: '32px',
                        fontSize: 18
                      }}
                    >
                      -
                    </button>
                  )}
                  <textarea
                    defaultValue={c.content}
                    maxLength={MAX_COMMENT_CHARS}
                    onChange={(e) => onUpdateComment && onUpdateComment(c.id, { content: e.target.value })}
                    tabIndex={0}
                    style={{
                      width: '100%',
                      height: noteHeight - 26, // subtract padding/header
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#333',
                      resize: 'none',
                      overflow: 'auto',
                      font: 'inherit',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    ref={(el) => { commentRefs.current[c.id] = el; }}
                  />
                  {/* Paper fold bottom-right */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: Math.max(12, Math.floor(noteWidth * 0.18)),
                      height: Math.max(12, Math.floor(noteWidth * 0.18)),
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                      clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
                      borderTop: '1px solid rgba(0,0,0,0.1)',
                      borderLeft: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {/* Selection Box */}
          {selectionBox && (
            <SelectionBox
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              isCreating={isCreatingFrame}
            />
          )}
        </div>
      </div>


      {/* Zoom Level Indicator */}
    </div>
  );
};
