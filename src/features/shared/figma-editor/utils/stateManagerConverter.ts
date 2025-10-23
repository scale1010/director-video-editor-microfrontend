/**
 * Utilities to convert between Frame data structure and StateManager format
 * This allows the original editor to work seamlessly with figma-style frames
 */

import { Frame, Layer } from '../types';
import { ITrack, ITrackItem } from '@designcombo/types';

/**
 * Convert a Layer to ITrackItem format
 */
function layerToTrackItem(layer: Layer): ITrackItem {
  const baseItem: Partial<ITrackItem> = {
    id: layer.id,
    name: layer.name,
    type: layer.type as any,
    display: {
      from: layer.startTime * 1000, // Convert to milliseconds
      to: (layer.startTime + layer.duration) * 1000,
    },
    details: {
      src: layer.src,
      text: layer.text,
      opacity: layer.opacity,
      visible: layer.visible,
      locked: layer.locked,
    },
  };

  // Add position/transform if available
  if (layer.x !== undefined && layer.y !== undefined) {
    baseItem.details = {
      ...baseItem.details,
      left: layer.x,
      top: layer.y,
    };
  }

  if (layer.width !== undefined && layer.height !== undefined) {
    baseItem.details = {
      ...baseItem.details,
      width: layer.width,
      height: layer.height,
    };
  }

  if (layer.rotation !== undefined) {
    baseItem.details = {
      ...baseItem.details,
      rotation: layer.rotation,
    };
  }

  if (layer.scale !== undefined) {
    baseItem.details = {
      ...baseItem.details,
      scale: layer.scale,
    };
  }

  // Preserve transform property (used by Moveable for rotation/scale)
  if (layer.transform !== undefined) {
    baseItem.details = {
      ...baseItem.details,
      transform: layer.transform,
    };
  }

  // Preserve all other layer properties in details
  // This includes text-specific properties like fontSize, fontFamily, color, etc.
  const standardKeys = ['id', 'name', 'type', 'visible', 'locked', 'opacity', 'blendMode', 
                        'startTime', 'duration', 'src', 'text', 'x', 'y', 'width', 'height', 
                        'rotation', 'scale', 'transform'];
  Object.keys(layer).forEach(key => {
    if (!standardKeys.includes(key) && layer[key] !== undefined) {
      baseItem.details = {
        ...baseItem.details,
        [key]: layer[key],
      };
    }
  });

  // Add video-specific properties for proper display
  if (layer.type === 'video') {
    const videoDuration = layer.duration * 1000; // Convert to milliseconds
    const startTime = layer.startTime * 1000;
    
    baseItem.trim = {
      from: startTime,
      to: startTime + videoDuration,
    };
    
    baseItem.duration = videoDuration;
    (baseItem as any).src = layer.src || '';
    (baseItem as any).playbackRate = 1;
    (baseItem as any).aspectRatio = layer.width && layer.height ? layer.width / layer.height : 1;
    
    // Add metadata for timeline thumbnails
    baseItem.metadata = {
      previewUrl: layer.src || '', // Use src as preview for now
    };
  }

  // Add audio-specific properties
  if (layer.type === 'audio') {
    const audioDuration = layer.duration * 1000; // Convert to milliseconds
    const startTime = layer.startTime * 1000;
    
    baseItem.trim = {
      from: startTime,
      to: startTime + audioDuration,
    };
    
    baseItem.duration = audioDuration;
    (baseItem as any).src = layer.src || '';
    (baseItem as any).playbackRate = 1;
  }

  // Add image-specific properties
  if (layer.type === 'image') {
    const imageDuration = layer.duration * 1000; // Convert to milliseconds
    const startTime = layer.startTime * 1000;
    
    baseItem.trim = {
      from: startTime,
      to: startTime + imageDuration,
    };
    
    baseItem.duration = imageDuration;
    (baseItem as any).src = layer.src || '';
    (baseItem as any).aspectRatio = layer.width && layer.height ? layer.width / layer.height : 1;
  }

  // Add text-specific properties
  if (layer.type === 'text') {
    const textDuration = layer.duration * 1000; // Convert to milliseconds
    const startTime = layer.startTime * 1000;
    
    baseItem.trim = {
      from: startTime,
      to: startTime + textDuration,
    };
    
    baseItem.duration = textDuration;
    (baseItem as any).text = layer.text || 'Heading and some body';
    
    // Set default text properties if not already set
    if (!baseItem.details.fontSize) {
      baseItem.details = {
        ...baseItem.details,
        fontSize: 120,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
        wordWrap: 'break-word',
      };
    }
  }

  return baseItem as ITrackItem;
}

/**
 * Convert ITrackItem back to Layer format
 */
function trackItemToLayer(trackItem: ITrackItem): Layer {
  const details = trackItem.details || {};
  const display = trackItem.display || { from: 0, to: 5000 };
  const trim = trackItem.trim || { from: display.from, to: display.to };

  // Create base layer with standard properties
  const baseLayer: Layer = {
    id: trackItem.id,
    name: trackItem.name,
    type: trackItem.type as 'video' | 'audio' | 'image' | 'text' | 'shape',
    visible: details.visible ?? true,
    locked: details.locked ?? false,
    opacity: details.opacity ?? 1,
    blendMode: 'normal',
    startTime: display.from / 1000, // Convert from milliseconds
    duration: (display.to - display.from) / 1000,
    src: (trackItem as any).src || details.src,
    text: details.text || (trackItem as any).text,
    x: details.left,
    y: details.top,
    width: details.width,
    height: details.height,
    rotation: details.rotation,
    scale: details.scale,
    transform: details.transform, // Preserve transform property
  };

  // Preserve all other details properties (fontSize, fontFamily, color, etc.)
  // This is important for text properties and other type-specific properties
  Object.keys(details).forEach(key => {
    if (!(key in baseLayer) && key !== 'left' && key !== 'top') {
      (baseLayer as any)[key] = details[key];
    }
  });

  return baseLayer;
}

/**
 * Convert Frame to StateManager-compatible state
 */
export function frameToStateManagerData(frame: Frame): any {
  // Convert layers to tracks and trackItems
  const trackItemsMap: Record<string, ITrackItem> = {};
  const trackItemIds: string[] = [];

  // Convert layers to track items
  frame.layers.forEach((layer) => {
    const trackItem = layerToTrackItem(layer);
    trackItemsMap[layer.id] = trackItem;
    trackItemIds.push(layer.id);
  });

  // Ensure valid duration - prevent Infinity/NaN
  const frameDuration = frame.duration;
  const validDuration = (frameDuration && isFinite(frameDuration) && frameDuration > 0) 
    ? frameDuration 
    : 5; // Default 5 seconds

  // Ensure valid fps
  const validFps = (frame.fps && isFinite(frame.fps) && frame.fps > 0) 
    ? frame.fps 
    : 30; // Default 30 fps

  return {
    size: {
      width: frame.size.w,
      height: frame.size.h,
    },
    fps: validFps,
    duration: validDuration * 1000, // Convert to milliseconds
    background: {
      type: 'color',
      value: frame.background,
    },
    tracks: frame.timeline.tracks || [],
    trackItemIds,
    trackItemsMap,
    transitionIds: [],
    transitionsMap: {},
    structure: [],
    activeIds: [],
    scale: {
      index: 7,
      unit: 300,
      zoom: 1 / 300,
      segments: 5,
    },
    scroll: {
      left: 0,
      top: 0,
    },
  };
}

/**
 * Update Frame with current StateManager state
 */
export function updateFrameFromStateManager(
  frame: Frame,
  stateManagerState: any
): Partial<Frame> {
  const trackItemsMap = stateManagerState.trackItemsMap || {};
  const trackItemIds = stateManagerState.trackItemIds || [];

  // Convert track items back to layers
  const layers: Layer[] = trackItemIds.map((id: string) => {
    const trackItem = trackItemsMap[id];
    return trackItemToLayer(trackItem);
  });

  // Ensure valid duration - prevent Infinity/NaN
  const stateDuration = stateManagerState.duration;
  const validDuration = (stateDuration && isFinite(stateDuration) && stateDuration > 0) 
    ? stateDuration / 1000 // Convert from milliseconds
    : 5; // Default 5 seconds

  // Ensure valid fps
  const validFps = (stateManagerState.fps && isFinite(stateManagerState.fps) && stateManagerState.fps > 0) 
    ? stateManagerState.fps 
    : 30; // Default 30 fps

  return {
    size: {
      w: stateManagerState.size?.width || frame.size.w,
      h: stateManagerState.size?.height || frame.size.h,
    },
    background:
      stateManagerState.background?.value || frame.background,
    fps: validFps,
    duration: validDuration,
    layers,
    timeline: {
      duration: validDuration,
      fps: validFps,
      tracks: stateManagerState.tracks || [],
      playheadTime: 0,
    },
  };
}

/**
 * Create an empty state for a new frame
 */
export function createEmptyFrameState(
  width: number = 1920,
  height: number = 1080,
  fps: number = 30,
  duration: number = 5
): any {
  return {
    size: {
      width,
      height,
    },
    fps,
    duration: duration * 1000,
    background: {
      type: 'color',
      value: '#0b0b0b',
    },
    tracks: [],
    trackItemIds: [],
    trackItemsMap: {},
    transitionIds: [],
    transitionsMap: {},
    structure: [],
    activeIds: [],
    scale: {
      index: 7,
      unit: 300,
      zoom: 1 / 300,
      segments: 5,
    },
    scroll: {
      left: 0,
      top: 0,
    },
  };
}

