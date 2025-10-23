import { Frame } from '../types';
import { IDesign } from '@designcombo/types';

/**
 * Convert frame data to StateManager format
 */
export const frameToStateManagerData = (frame: Frame): IDesign => {
  return {
    id: frame.id,
    name: frame.name,
    size: {
      width: frame.size.w,
      height: frame.size.h
    },
    backgroundColor: frame.background,
    fps: frame.fps,
    duration: frame.duration,
    layers: frame.layers || [],
    timeline: frame.timeline || {
      duration: frame.duration,
      fps: frame.fps,
      tracks: [],
      playheadTime: 0
    }
  };
};

/**
 * Update frame from StateManager data
 */
export const updateFrameFromStateManager = (frame: Frame, data: IDesign): Partial<Frame> => {
  return {
    name: data.name,
    size: {
      w: data.size.width,
      h: data.size.height
    },
    background: data.backgroundColor,
    fps: data.fps,
    duration: data.duration,
    layers: data.layers,
    timeline: data.timeline
  };
};
