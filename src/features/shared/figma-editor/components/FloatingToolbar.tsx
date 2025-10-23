import React from 'react';
import { Tool, BoardState } from '../types';
import { 
  MousePointer2, 
  Hand, 
  Square, 
  FileText,
  Grid3x3,
  Ruler,
  StickyNote,
  LucideIcon
} from 'lucide-react';

interface FloatingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  boardState: BoardState;
  onBoardStateChange: (updates: Partial<BoardState>) => void;
  onNotesClick: () => void;
  showComments?: boolean;
  onToggleComments?: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  currentTool,
  onToolChange,
  boardState,
  onBoardStateChange,
  onNotesClick,
  showComments,
  onToggleComments
}) => {
  const tools: Array<{ id: Tool; label: string; Icon: LucideIcon; shortcut: string }> = [
    { id: 'move', label: 'Move', Icon: MousePointer2, shortcut: 'V' },
    { id: 'hand', label: 'Hand', Icon: Hand, shortcut: 'H' },
    { id: 'frame', label: 'Frame', Icon: Square, shortcut: 'F' }
  ];

  return (
    <div 
      className="floating-toolbar"
      style={{
        position: 'absolute',
        bottom: 56, // 32px status bar + 24px padding
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
        background: 'var(--bg-elev-2)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 40,
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {tools.map(tool => {
          const Icon = tool.Icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`btn btn--icon ${currentTool === tool.id ? 'btn--active' : ''}`}
              title={`${tool.label} (${tool.shortcut})`}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-4)' }} />

      {/* Toggles (Snap only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          onClick={() => onBoardStateChange({ snap: !boardState.snap })}
          className={`btn btn--icon ${boardState.snap ? 'btn--active' : ''}`}
          title="Toggle Snap"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Grid3x3 size={16} />
        </button>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-4)' }} />

      {/* Comments Toggle */}
      <button
        onClick={onToggleComments}
        className={`btn btn--icon ${showComments ? 'btn--active' : ''}`}
        title={showComments ? 'Hide Comments' : 'Show Comments'}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <StickyNote size={16} />
      </button>
    </div>
  );
};

