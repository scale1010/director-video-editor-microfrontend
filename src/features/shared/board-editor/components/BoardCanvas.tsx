import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Trash2, Move, RotateCw } from 'lucide-react';
import { FrameReference, Board } from '../services/boardApi';
import { useNavigate } from 'react-router-dom';

interface BoardCanvasProps {
  board: Board;
  onUpdateFrameReference: (frameRefId: string, updates: Partial<FrameReference>) => void;
  onRemoveFrame: (frameRefId: string) => void;
  onAddFrame: (frameId: string) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  board,
  onUpdateFrameReference,
  onRemoveFrame,
  onAddFrame
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedFrameRefId, setSelectedFrameRefId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFrameClick = (frameRefId: string) => {
    setSelectedFrameRefId(frameRefId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedFrameRefId(null);
    }
  };

  const handleFrameDoubleClick = (frameRef: FrameReference) => {
    // Navigate to frame editor
    navigate(`/frame-editor/${frameRef.frame_id}`);
  };

  const handleDragStart = (e: React.MouseEvent, frameRefId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setSelectedFrameRefId(frameRefId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedFrameRefId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const frameRef = board.frame_references.find(fr => fr.id === selectedFrameRefId);
    if (frameRef) {
      const newPosition = {
        x: Math.max(0, frameRef.position.x + deltaX),
        y: Math.max(0, frameRef.position.y + deltaY)
      };

      onUpdateFrameReference(selectedFrameRefId, { position: newPosition });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, selectedFrameRefId, dragStart, board.frame_references, onUpdateFrameReference]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getFrameThumbnail = (frameRef: FrameReference) => {
    // This would typically come from the frame data
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#4f46e5"/>
        <text x="100" y="75" text-anchor="middle" fill="white" font-family="Arial" font-size="12">
          Frame ${frameRef.frame_id.slice(-4)}
        </text>
      </svg>
    `)}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Canvas Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{board.name}</h2>
            <p className="text-sm text-gray-500">
              {board.frame_references.length} frames • {board.sequence_settings.total_duration.toFixed(1)}s
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-50 dark:bg-gray-900"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: board.layout.grid_enabled 
            ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${board.layout.grid_size}px ${board.layout.grid_size}px`,
          transform: `scale(${board.layout.zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Canvas Content */}
        <div 
          className="relative"
          style={{
            width: board.layout.canvas_size.width,
            height: board.layout.canvas_size.height,
            minWidth: '100%',
            minHeight: '100%'
          }}
        >
          {/* Frame References */}
          {board.frame_references.map((frameRef) => (
            <div
              key={frameRef.id}
              className={`absolute border-2 cursor-move transition-all ${
                selectedFrameRefId === frameRef.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              } ${!frameRef.visible ? 'opacity-50' : ''}`}
              style={{
                left: frameRef.position.x,
                top: frameRef.position.y,
                width: 200 * frameRef.scale,
                height: 150 * frameRef.scale,
                transform: `rotate(${frameRef.rotation}deg)`,
                opacity: frameRef.opacity
              }}
              onClick={() => handleFrameClick(frameRef.id)}
              onDoubleClick={() => handleFrameDoubleClick(frameRef)}
              onMouseDown={(e) => handleDragStart(e, frameRef.id)}
            >
              {/* Frame Thumbnail */}
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded overflow-hidden">
                <img
                  src={getFrameThumbnail(frameRef)}
                  alt={`Frame ${frameRef.frame_id}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Frame Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Frame {frameRef.frame_id.slice(-4)}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-white hover:bg-white hover:bg-opacity-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frameRef.id);
                      }}
                      title="Remove from board"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-white hover:bg-white hover:bg-opacity-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateFrameReference(frameRef.id, { 
                          rotation: frameRef.rotation + 90 
                        });
                      }}
                      title="Rotate"
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  {frameRef.start_time.toFixed(1)}s - {frameRef.end_time?.toFixed(1) || '∞'}s
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedFrameRefId === frameRef.id && (
                <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-500 rounded pointer-events-none">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {board.frame_references.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-lg font-semibold mb-2">No frames yet</h3>
                <p className="text-gray-500 mb-4">
                  Add frames from the library to start building your board
                </p>
                <Button onClick={() => onAddFrame('new')}>
                  Add Your First Frame
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Zoom:</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={board.layout.zoom}
                onChange={(e) => {
                  // This would update the board layout
                  console.log('Zoom changed:', e.target.value);
                }}
                className="w-20"
              />
              <span className="text-sm text-gray-500">
                {Math.round(board.layout.zoom * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {board.frame_references.length} frames
            </Badge>
            <Badge variant="outline">
              {board.sequence_settings.total_duration.toFixed(1)}s
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
