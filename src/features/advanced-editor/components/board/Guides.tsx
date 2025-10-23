import React from 'react';
import { Guide } from '../types';

interface GuidesProps {
  guides: Guide[];
  zoom: number;
}

export const Guides: React.FC<GuidesProps> = ({ guides, zoom }) => {
  return (
    <>
      {guides.map(guide => (
        <div
          key={guide.id}
          className={`guide guide--${guide.orientation}`}
          style={{
            [guide.orientation === 'vertical' ? 'left' : 'top']: guide.pos
          }}
        />
      ))}
    </>
  );
};

