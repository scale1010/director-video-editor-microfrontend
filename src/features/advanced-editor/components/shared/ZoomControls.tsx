import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { BoardState } from '../types';

interface ZoomControlsProps {
  boardState: BoardState;
  onBoardStateChange: (updates: Partial<BoardState>) => void;
  onRecenter?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  boardState,
  onBoardStateChange,
  onRecenter
}) => {
  const handleZoomIn = () => {
    onBoardStateChange({ zoom: Math.min(5, boardState.zoom * 1.2) });
  };

  const handleZoomOut = () => {
    onBoardStateChange({ zoom: Math.max(0.1, boardState.zoom * 0.8) });
  };

  const handleZoomToFit = () => {
    onBoardStateChange({ zoom: 0.16 });
    if (onRecenter) {
      onRecenter();
    }
  };

  return (
    <div 
      className="zoom-controls"
      style={{
        position: 'absolute',
        bottom: 56, // 32px status bar + 24px padding
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-8)',
        background: 'var(--bg-elev-2)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 40,
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="btn btn--icon"
        title="Zoom In (Cmd/Ctrl +)"
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ZoomIn size={16} />
      </button>

      {/* Zoom Percentage */}
      <span 
        style={{ 
          minWidth: 40, 
          textAlign: 'center', 
          fontSize: 'var(--fs-11)', 
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}
      >
        {Math.round(boardState.zoom * 100)}%
      </span>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="btn btn--icon"
        title="Zoom Out (Cmd/Ctrl -)"
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ZoomOut size={16} />
      </button>

      {/* Separator */}
      <div style={{ width: 24, height: 1, background: 'var(--stroke)', margin: 'var(--space-2) 0' }} />

      {/* Zoom to Fit / Re-center */}
      <button
        onClick={handleZoomToFit}
        className="btn"
        title="Zoom to Fit (1:1)"
        style={{
          height: 28,
          padding: '0 var(--space-6)',
          fontSize: 'var(--fs-10)',
          fontWeight: 500
        }}
      >
        1:1
      </button>

      {/* Re-center */}
      <button
        onClick={onRecenter}
        className="btn btn--icon"
        title="Re-center View"
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
};

