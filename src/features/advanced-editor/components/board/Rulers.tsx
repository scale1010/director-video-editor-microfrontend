import React from 'react';

interface RulersProps {
  zoom: number;
  scroll: { x: number; y: number };
}

export const Rulers: React.FC<RulersProps> = ({ zoom, scroll }) => {
  const rulerSize = 24;
  const baseInterval = 100; // pixels at 1x
  const interval = baseInterval * Math.max(zoom, 0.1);

  const ticksX: Array<{ left: number; label: string }> = [];
  const ticksY: Array<{ top: number; label: string }> = [];

  const total = 20000;
  for (let x = 0; x < total; x += interval) {
    const left = x + scroll.x;
    if (left >= 0 && left <= window.innerWidth) {
      ticksX.push({ left, label: Math.round(x).toString() });
    }
  }
  for (let y = 0; y < total; y += interval) {
    const top = y + scroll.y;
    if (top >= 0 && top <= window.innerHeight) {
      ticksY.push({ top, label: Math.round(y).toString() });
    }
  }

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="ruler ruler--horizontal"
        style={{
          position: 'absolute',
          top: 0,
          left: rulerSize,
          right: 0,
          height: rulerSize,
          zIndex: 100,
          pointerEvents: 'none',
          background: 'var(--time-ruler-bg)',
          borderBottom: '1px solid var(--time-ruler-stroke)'
        }}
      >
        {ticksX.map(tick => (
          <div key={tick.left} style={{ position: 'absolute', left: tick.left, bottom: 0, width: 1, height: rulerSize, background: 'var(--time-ruler-stroke)' }}>
            <div style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 10, color: 'var(--text-tertiary)' }}>{tick.label}</div>
          </div>
        ))}
      </div>
      
      {/* Vertical Ruler */}
      <div 
        className="ruler ruler--vertical"
        style={{
          position: 'absolute',
          top: rulerSize,
          left: 0,
          bottom: 0,
          width: rulerSize,
          zIndex: 100,
          pointerEvents: 'none',
          background: 'var(--time-ruler-bg)',
          borderRight: '1px solid var(--time-ruler-stroke)'
        }}
      >
        {ticksY.map(tick => (
          <div key={tick.top} style={{ position: 'absolute', top: tick.top, right: 0, width: rulerSize, height: 1, background: 'var(--time-ruler-stroke)' }}>
            <div style={{ position: 'absolute', right: 2, top: 2, fontSize: 10, color: 'var(--text-tertiary)' }}>{tick.label}</div>
          </div>
        ))}
      </div>

      {/* Corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: rulerSize,
          height: rulerSize,
          background: 'var(--time-ruler-bg)',
          borderRight: '1px solid var(--time-ruler-stroke)',
          borderBottom: '1px solid var(--time-ruler-stroke)',
          zIndex: 101
        }}
      />
    </>
  );
};
