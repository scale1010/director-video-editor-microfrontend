import React from 'react';
import { Project, BoardState, Tool, EditorState } from '../types';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  boardState: BoardState;
  onBoardStateChange: (updates: Partial<BoardState>) => void;
  project: Project;
  editorState: EditorState;
  onPlay: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  boardState,
  onBoardStateChange,
  project,
  editorState,
  onPlay
}) => {
  const tools: Array<{ id: Tool; label: string; icon: string; shortcut: string }> = [
    { id: 'move', label: 'Move', icon: '↖️', shortcut: 'V' },
    { id: 'hand', label: 'Hand', icon: '✋', shortcut: 'H' },
    { id: 'frame', label: 'Frame', icon: '🖼️', shortcut: 'F' },
    { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
    { id: 'shape', label: 'Shape', icon: '⬜', shortcut: 'R' },
    { id: 'pen', label: 'Pen', icon: '✏️', shortcut: 'P' },
    { id: 'comment', label: 'Comment', icon: '💬', shortcut: 'C' }
  ];

  return (
    <div 
      className="toolbar"
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-16)',
        gap: 'var(--space-12)',
        borderBottom: '1px solid var(--stroke)'
      }}
    >
      {/* Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`btn btn--icon ${currentTool === tool.id ? 'btn--active' : ''}`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span style={{ fontSize: 14 }}>{tool.icon}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--stroke)' }} />

      {/* Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <button
          onClick={() => onBoardStateChange({ snap: !boardState.snap })}
          className={`btn ${boardState.snap ? 'btn--active' : ''}`}
          title="Toggle Snap"
        >
          Snap
        </button>
        <button
          onClick={() => onBoardStateChange({ rulers: !boardState.rulers })}
          className={`btn ${boardState.rulers ? 'btn--active' : ''}`}
          title="Toggle Rulers (Shift+R)"
        >
          Rulers
        </button>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--stroke)' }} />

      {/* Play Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <button
          onClick={onPlay}
          className="btn btn--icon"
          title="Play/Pause"
        >
          {editorState.isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      {/* Board Info */}
      <div 
        style={{ 
          marginLeft: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-16)', 
          fontSize: 'var(--fs-12)', 
          color: 'var(--text-secondary)' 
        }}
      >
        <span>{project.frames.length} frames</span>
        <span>•</span>
        <span>{project.sequence.order.length} in sequence</span>
        <span>•</span>
        <span>{editorState.mode === 'frame' ? 'Editing Frame' : 'Board View'}</span>
      </div>

      {/* Back to Main Editor */}
      <button
        onClick={() => window.location.href = '/'}
        className="btn"
        style={{ marginLeft: 'var(--space-12)' }}
      >
        ← Main Editor
      </button>
    </div>
  );
};
