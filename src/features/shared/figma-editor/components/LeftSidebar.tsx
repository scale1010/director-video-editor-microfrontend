import React from 'react';
import { Frame } from '../types';

interface LeftSidebarProps {
  frames: Frame[];
  selectedFrameIds: string[];
  onFrameSelect: (frameId: string) => void;
  onFrameFocus: (frameId: string) => void;
  onCreateFrame: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  frames,
  selectedFrameIds,
  onFrameSelect,
  onFrameFocus,
  onCreateFrame
}) => {
  return (
    <div 
      className="sidebar"
      style={{
        width: 280,
        borderRight: '1px solid var(--stroke)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: 'var(--space-12) var(--space-16)',
          borderBottom: '1px solid var(--stroke)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Frames
        </h3>
        <button
          onClick={onCreateFrame}
          className="btn btn--icon btn--primary"
          title="Create Frame (F)"
        >
          +
        </button>
      </div>

      {/* Frames List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {frames.map(frame => (
            <div
              key={frame.id}
              onClick={() => onFrameSelect(frame.id)}
              onDoubleClick={() => onFrameFocus(frame.id)}
              style={{
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: selectedFrameIds.includes(frame.id) ? 'var(--bg-elev-2)' : 'transparent',
                border: selectedFrameIds.includes(frame.id) ? '1px solid var(--accent)' : '1px solid transparent',
                transition: 'all var(--dur-1) var(--ease-standard)'
              }}
              onMouseEnter={(e) => {
                if (!selectedFrameIds.includes(frame.id)) {
                  e.currentTarget.style.background = 'var(--bg-elev-1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedFrameIds.includes(frame.id)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                <div 
                  style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: frame.labelColor === 'purple' ? '#9747FF' :
                                frame.labelColor === 'blue' ? '#18a0fb' :
                                frame.labelColor === 'green' ? '#2ecc71' :
                                frame.labelColor === 'red' ? '#ff5a52' :
                                frame.labelColor === 'yellow' ? '#ffcc00' : '#18a0fb',
                    flexShrink: 0
                  }} 
                />
                <div style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {frame.name}
                </div>
              </div>
              <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-tertiary)' }}>
                {frame.size.w}×{frame.size.h} • {frame.duration}s • {frame.layers.length} layers
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assets Section (Placeholder) */}
      <div 
        style={{
          borderTop: '1px solid var(--stroke)',
          padding: 'var(--space-12) var(--space-16)'
        }}
      >
        <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
          Assets
        </h3>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-tertiary)' }}>
          Gallery integration coming soon
        </div>
      </div>
    </div>
  );
};

