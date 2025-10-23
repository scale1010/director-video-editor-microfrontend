import React, { forwardRef } from 'react';
import StateManager from '@designcombo/state';
import Scene from '../../shared/components/Scene/Scene';
import { SceneRef } from '../../shared/components/Scene/Scene.types';

interface SimpleSceneProps {
  stateManager: StateManager;
}

const SimpleScene = forwardRef<SceneRef, SimpleSceneProps>(
  ({ stateManager }, ref) => {
    return (
      <Scene
        ref={ref}
        stateManager={stateManager}
        mode="simple"
      />
    );
  }
);

SimpleScene.displayName = "SimpleScene";

export { SimpleScene };
