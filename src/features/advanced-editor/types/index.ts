// Figma-style Multi-Frame Editor Data Model

import { ITrack, ITrackItem } from "@designcombo/types";

// Board State
export interface BoardState {
  zoom: number;
  scroll: { x: number; y: number };
  snap: boolean;
  rulers: boolean;
  guides: Guide[];
}

export interface Guide {
  id: string;
  orientation: 'vertical' | 'horizontal';
  pos: number;
  locked?: boolean;
}

// Frame (Scene)
export interface Frame {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  background: string;
  fps: number;
  duration: number;
  posterTime: number;
  labelColor: 'purple' | 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'pink';
  layers: Layer[];
  timeline: TimelineState;
  locked?: boolean;
  visible?: boolean;
}

// Layer (inside Frame)
export interface Layer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'shape';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  startTime: number;
  duration: number;
  // Type-specific properties
  src?: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  [key: string]: any;
}

// Timeline State
export interface TimelineState {
  duration: number;
  fps: number;
  tracks: ITrack[];
  playheadTime: number;
}

// Sequence (Playlist)
export interface Sequence {
  order: string[]; // frame IDs in playback order
  transitions: Transition[];
  loop: boolean;
  playRange: { startIndex: number; endIndex: number };
}

export interface Transition {
  id: string;
  from: string; // frame ID
  to: string; // frame ID
  type: 'cut' | 'crossfade' | 'dipToBlack' | 'dipToWhite' | 'push';
  duration: number; // in seconds
  curve: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

// Project
export interface Workspace {
  defaultSize: { w: number; h: number };
  backgroundColor: string;
  gridColor: string;
}

export interface Project {
  projectId: string;
  board: BoardState;
  workspace: Workspace;
  frames: Frame[];
  sequence: Sequence;
}

// Editor Modes
export type EditorMode = 'board' | 'frame';

export type Tool = 'move' | 'hand' | 'frame' | 'text' | 'shape' | 'pen' | 'comment';

// Editor State
export interface EditorState {
  mode: EditorMode;
  focusedFrameId: string | null;
  selectedFrameIds: string[];
  selectedLayerIds: string[];
  currentTool: Tool;
  boardState: BoardState;
  proxyQuality: 'full' | 'half' | 'quarter';
  isPlaying: boolean;
}

// Inspector
export type InspectorTab = 'frame' | 'notes';

export interface InspectorState {
  activeTab: InspectorTab;
  selectedItem: {
    type: 'frame' | 'layer';
    id: string;
  } | null;
}

// Gallery/Assets
export interface Asset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  size?: number;
  createdAt: Date;
}

// Keyboard Shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  cmd?: boolean;
  action: string;
  scope: 'board' | 'frame' | 'global';
}

// Viewport
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Frame Thumbnail Cache
export interface FrameThumbnail {
  frameId: string;
  dataUrl: string;
  lastUpdated: number;
  quality: 'full' | 'half' | 'quarter';
}

// Events
export interface BoardEvent {
  type: 'frameCreated' | 'frameMoved' | 'frameResized' | 'frameSelected' | 'frameDeleted' | 'frameFocused';
  frameId: string;
  data?: any;
}

export interface SequenceEvent {
  type: 'frameAdded' | 'frameRemoved' | 'frameReordered' | 'transitionAdded' | 'transitionRemoved';
  data: any;
}

// Frame Presets
export interface FramePreset {
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
}

export const FRAME_PRESETS: FramePreset[] = [
  { name: '1080p (16:9)', width: 1920, height: 1080, fps: 30, duration: 5 },
  { name: '1080p Square', width: 1080, height: 1080, fps: 30, duration: 5 },
  { name: '1080p Portrait (9:16)', width: 1080, height: 1920, fps: 30, duration: 5 },
  { name: '4K (16:9)', width: 3840, height: 2160, fps: 30, duration: 5 },
  { name: '4K Square', width: 2160, height: 2160, fps: 30, duration: 5 },
];

// Snapping
export interface SnapPoint {
  type: 'edge' | 'center' | 'guide';
  orientation: 'vertical' | 'horizontal';
  position: number;
  frameId?: string;
}

export const SNAP_THRESHOLD = 4; // pixels

