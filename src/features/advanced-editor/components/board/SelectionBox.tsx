import React from 'react';

interface SelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isCreating?: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  x,
  y,
  width,
  height,
  isCreating = false
}) => {
  return (
    <div
      className="selection-box"
      style={{
        left: width >= 0 ? x : x + width,
        top: height >= 0 ? y : y + height,
        width: Math.abs(width),
        height: Math.abs(height)
      }}
    />
  );
};

