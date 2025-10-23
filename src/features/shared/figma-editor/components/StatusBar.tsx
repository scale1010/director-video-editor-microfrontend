import React from 'react';
import { Project, EditorState } from '../types';

interface StatusBarProps {
  project: Project;
  editorState: EditorState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ project, editorState }) => {
  return (
    <div 
      className="status-bar"
      style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-16)',
        gap: 'var(--space-12)',
        borderTop: '1px solid var(--stroke)',
        background: 'var(--bg-elev-1)',
        fontSize: 'var(--fs-11)',
        color: 'var(--text-secondary)',
        flexShrink: 0,
        zIndex: 50
      }}
    >
      {/* Left side - Frame info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <span style={{ fontWeight: 500 }}>{project.frames.length} frames</span>
        <span>•</span>
        <span>{project.sequence.order.length} in sequence</span>
        <span>•</span>
        <span style={{ color: 'var(--text-primary)' }}>
          {editorState.mode === 'frame' ? 'Frame View' : 'Board View'}
        </span>
      </div>

      {/* Right side - Additional info */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        {editorState.selectedFrameIds.length > 0 && (
          <>
            <span>{editorState.selectedFrameIds.length} selected</span>
            <span>•</span>
          </>
        )}
        <span style={{ color: 'var(--text-tertiary)' }}>
          {project.projectId}
        </span>
      </div>
    </div>
  );
};

