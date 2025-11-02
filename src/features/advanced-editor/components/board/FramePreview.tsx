import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Frame } from '../types';

interface FramePreviewProps {
  frame: Frame;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (updates: Partial<Frame>) => void;
  zoom: number;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

export const FramePreview: React.FC<FramePreviewProps> = ({
  frame,
  isSelected,
  onSelect,
  onDoubleClick,
  onUpdate,
  zoom
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [shouldPulse, setShouldPulse] = useState(false);
  const prevSelectedRef = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: frame.size.w,
      height: frame.size.h,
      posX: frame.position.x,
      posY: frame.position.y
    });
    onSelect();
  }, [frame, onSelect]);

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const dx = (e.clientX - resizeStart.x) / zoom;
    const dy = (e.clientY - resizeStart.y) / zoom;

    let newSize = { w: resizeStart.width, h: resizeStart.height };
    let newPosition = { x: resizeStart.posX, y: resizeStart.posY };

    switch (resizeHandle) {
      case 'nw':
        newSize.w = Math.max(100, resizeStart.width - dx);
        newSize.h = Math.max(100, resizeStart.height - dy);
        newPosition.x = resizeStart.posX + (resizeStart.width - newSize.w);
        newPosition.y = resizeStart.posY + (resizeStart.height - newSize.h);
        break;
      case 'ne':
        newSize.w = Math.max(100, resizeStart.width + dx);
        newSize.h = Math.max(100, resizeStart.height - dy);
        newPosition.y = resizeStart.posY + (resizeStart.height - newSize.h);
        break;
      case 'sw':
        newSize.w = Math.max(100, resizeStart.width - dx);
        newSize.h = Math.max(100, resizeStart.height + dy);
        newPosition.x = resizeStart.posX + (resizeStart.width - newSize.w);
        break;
      case 'se':
        newSize.w = Math.max(100, resizeStart.width + dx);
        newSize.h = Math.max(100, resizeStart.height + dy);
        break;
      case 'n':
        newSize.h = Math.max(100, resizeStart.height - dy);
        newPosition.y = resizeStart.posY + (resizeStart.height - newSize.h);
        break;
      case 's':
        newSize.h = Math.max(100, resizeStart.height + dy);
        break;
      case 'w':
        newSize.w = Math.max(100, resizeStart.width - dx);
        newPosition.x = resizeStart.posX + (resizeStart.width - newSize.w);
        break;
      case 'e':
        newSize.w = Math.max(100, resizeStart.width + dx);
        break;
    }

    onUpdate({
      size: newSize,
      position: newPosition
    });
  }, [isResizing, resizeHandle, resizeStart, zoom, onUpdate]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Set up event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Trigger pulse animation when frame becomes selected (once per selection)
  useEffect(() => {
    if (isSelected && !prevSelectedRef.current) {
      // Frame just became selected - trigger pulse animation
      setShouldPulse(true);
      // Remove pulse class after animation completes (0.8s)
      const timer = setTimeout(() => {
        setShouldPulse(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    prevSelectedRef.current = isSelected;
  }, [isSelected]);

  // Get label color class
  const getLabelColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: '#9747FF',
      blue: '#18a0fb',
      green: '#2ecc71',
      red: '#ff5a52',
      yellow: '#ffcc00',
      orange: '#ff8c00',
      pink: '#ff69b4'
    };
    return colors[color] || colors.blue;
  };

  // Get resize cursor
  const getResizeCursor = (handle: ResizeHandle) => {
    const cursors: Record<ResizeHandle, string> = {
      nw: 'nw-resize',
      ne: 'ne-resize',
      sw: 'sw-resize',
      se: 'se-resize',
      n: 'n-resize',
      s: 's-resize',
      w: 'w-resize',
      e: 'e-resize'
    };
    return cursors[handle];
  };

  return (
    <div
      ref={frameRef}
      className={`frame ${isSelected ? 'frame--selected' : ''} ${shouldPulse ? 'frame--pulse' : ''}`}
      style={{
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.w,
        height: frame.size.h,
        minWidth: 100,
        minHeight: 100
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      {/* Frame Title - DEBUG: 3x larger font */}
      <div className="frame__title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div 
          style={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            background: getLabelColor(frame.labelColor),
            flexShrink: 0
          }} 
        />
        <span style={{ fontWeight: 600, fontSize: '48px' }}>{frame.name}</span>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '30px' }}>
          – {frame.size.w}×{frame.size.h}
        </span>
      </div>

      {/* Frame Info - DEBUG: 3x larger font + coordinates */}
      <div 
        style={{
          position: 'absolute',
          bottom: 'var(--space-8)',
          left: 'var(--space-8)',
          fontSize: '30px',
          color: 'var(--text-primary)',
          background: 'var(--bg-elev-2)',
          border: '1px solid var(--stroke)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-xs)',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {frame.duration}s • {frame.fps}fps • {frame.layers.length} layers
      </div>

      {/* DEBUG: Coordinates Display */}

      {/* Frame Content Preview - DEBUG: 3x larger font */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '117px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 108, marginBottom: 27 }}>🎬</div>
          <div style={{ fontSize: '54px', fontWeight: 500, color: '#999999' }}>Double-click to edit</div>
        </div>
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="frame__resize-handle"
            style={{ 
              top: -4, 
              left: -4, 
              cursor: getResizeCursor('nw'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              top: -4, 
              right: -4, 
              cursor: getResizeCursor('ne'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              bottom: -4, 
              left: -4, 
              cursor: getResizeCursor('sw'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              bottom: -4, 
              right: -4, 
              cursor: getResizeCursor('se'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edge handles */}
          <div
            className="frame__resize-handle"
            style={{ 
              top: -4, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              cursor: getResizeCursor('n'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              bottom: -4, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              cursor: getResizeCursor('s'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              left: -4, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              cursor: getResizeCursor('w'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="frame__resize-handle"
            style={{ 
              right: -4, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              cursor: getResizeCursor('e'),
              borderRadius: '2px'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
};
