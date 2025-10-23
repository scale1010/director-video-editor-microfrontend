import React from 'react';
import { Frame } from '../types';

interface FrameArrowsProps {
  frames: Frame[];
  sequenceOrder: string[];
  zoom: number;
  scroll: { x: number; y: number };
}

export const FrameArrows: React.FC<FrameArrowsProps> = ({ frames, sequenceOrder, zoom, scroll }) => {
  // Calculate arrow paths based on frame positions and sequence order
  const getArrowPath = (fromFrame: Frame, toFrame: Frame): string => {
    // Start from center of right edge of source frame
    const fromX = fromFrame.position.x + fromFrame.size.w;
    const fromY = fromFrame.position.y + fromFrame.size.h / 2;
    
    // End at center of left edge of target frame
    const toX = toFrame.position.x;
    const toY = toFrame.position.y + toFrame.size.h / 2;

    // Calculate control points for curved path (flowchart style)
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    // Horizontal offset for curve control points (50% of horizontal distance)
    const controlOffsetX = Math.abs(dx) * 0.5;
    
    // Create smooth S-curve with control points
    const controlX1 = fromX + controlOffsetX;
    const controlY1 = fromY;
    const controlX2 = toX - controlOffsetX;
    const controlY2 = toY;

    // Return cubic bezier path
    return `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  };

  // Calculate arrowhead path (for reference, though marker auto-orients)
  const getArrowhead = (fromFrame: Frame, toFrame: Frame): { x: number; y: number; angle: number } => {
    // End at center of left edge of target frame
    const toX = toFrame.position.x;
    const toY = toFrame.position.y + toFrame.size.h / 2;

    // Calculate angle for arrowhead (should point left-to-right)
    const fromX = fromFrame.position.x + fromFrame.size.w;
    const fromY = fromFrame.position.y + fromFrame.size.h / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x: toX, y: toY, angle };
  };

  // Get frame by ID
  const getFrameById = (id: string): Frame | undefined => {
    return frames.find(f => f.id === id);
  };

  // Create arrows based on sequence order
  const arrows = [];
  for (let i = 0; i < sequenceOrder.length - 1; i++) {
    const fromFrame = getFrameById(sequenceOrder[i]);
    const toFrame = getFrameById(sequenceOrder[i + 1]);
    
    if (fromFrame && toFrame) {
      const path = getArrowPath(fromFrame, toFrame);
      const arrowhead = getArrowhead(fromFrame, toFrame);
      
      arrows.push({
        id: `arrow-${i}`,
        path,
        arrowhead,
        fromFrame,
        toFrame
      });
    }
  }

  // Calculate dimensions to cover all frames
  const allPositions = frames.flatMap(f => [
    { x: f.position.x, y: f.position.y },
    { x: f.position.x + f.size.w, y: f.position.y + f.size.h }
  ]);
  
  const minX = Math.min(...allPositions.map(p => p.x), 0) - 1000;
  const minY = Math.min(...allPositions.map(p => p.y), 0) - 1000;
  const maxX = Math.max(...allPositions.map(p => p.x), 10000) + 1000;
  const maxY = Math.max(...allPositions.map(p => p.y), 5000) + 1000;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <svg
      style={{
        position: 'absolute',
        top: minY,
        left: minX,
        width: width,
        height: height,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Arrowhead marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="rgba(139, 92, 246, 0.8)"
          />
        </marker>
      </defs>

      {/* Draw arrows */}
      <g transform={`translate(${-minX}, ${-minY})`}>
        {arrows.map((arrow) => (
          <g key={arrow.id}>
            {/* Arrow line */}
            <path
              d={arrow.path}
              stroke="rgba(139, 92, 246, 0.6)"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            />
            
            {/* Glow effect */}
            <path
              d={arrow.path}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="8"
              fill="none"
              style={{
                filter: 'blur(4px)'
              }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

