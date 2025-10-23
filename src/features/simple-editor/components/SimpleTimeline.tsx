import React from 'react';
import StateManager from '@designcombo/state';
import Timeline from '../../shared/components/Timeline/Timeline';

interface SimpleTimelineProps {
  stateManager: StateManager;
}

export const SimpleTimeline: React.FC<SimpleTimelineProps> = ({ stateManager }) => {
  return (
    <div className="h-full bg-background border-t border-border/80">
      <Timeline stateManager={stateManager} />
    </div>
  );
};
