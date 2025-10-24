import { create } from 'zustand';
import { frameApi, Frame, FrameCreateRequest, FrameUpdateRequest, FrameListResponse } from '../services/frameApi';

interface FrameStore {
  // State
  frames: Frame[];
  currentFrameId: string | null;
  currentFrame: Frame | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFrames: (params?: {
    workspace_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }) => Promise<void>;
  loadFrame: (frameId: string) => Promise<Frame | null>;
  createFrame: (request: FrameCreateRequest) => Promise<Frame | null>;
  updateFrame: (frameId: string, request: FrameUpdateRequest) => Promise<Frame | null>;
  deleteFrame: (frameId: string) => Promise<boolean>;
  duplicateFrame: (frameId: string, newName?: string) => Promise<Frame | null>;
  setCurrentFrameId: (frameId: string | null) => void;
  setCurrentFrame: (frame: Frame | null) => void;
  markUnsavedChanges: () => void;
  markSaved: () => void;
  clearError: () => void;
  autosaveFrame: (frameId: string, data: any) => Promise<Frame | null>;
  resetCurrentFrame: () => void;
  createNewFrame: () => void;
}

export const useFrameStore = create<FrameStore>((set, get) => ({
  // Initial state
  frames: [],
  currentFrameId: null,
  currentFrame: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,

  // Load frames
  loadFrames: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await frameApi.listFrames(params);
      set({ frames: response.frames, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load frames',
        isLoading: false 
      });
    }
  },

  // Load a single frame
  loadFrame: async (frameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const frame = await frameApi.getFrame(frameId);
      set({ 
        currentFrame: frame, 
        currentFrameId: frameId,
        isLoading: false 
      });
      return frame;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load frame',
        isLoading: false 
      });
      return null;
    }
  },

  // Create a new frame
  createFrame: async (request: FrameCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const frame = await frameApi.createFrame(request);
      set(state => ({
        frames: [frame, ...state.frames],
        currentFrame: frame,
        currentFrameId: frame.id,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date()
      }));
      return frame;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create frame',
        isLoading: false 
      });
      return null;
    }
  },

  // Update a frame
  updateFrame: async (frameId: string, request: FrameUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const frame = await frameApi.updateFrame(frameId, request);
      set(state => ({
        frames: state.frames.map(f => f.id === frameId ? frame : f),
        currentFrame: state.currentFrameId === frameId ? frame : state.currentFrame,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date()
      }));
      return frame;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update frame',
        isLoading: false 
      });
      return null;
    }
  },

  // Delete a frame
  deleteFrame: async (frameId: string) => {
    set({ isLoading: true, error: null });
    try {
      await frameApi.deleteFrame(frameId);
      set(state => ({
        frames: state.frames.filter(f => f.id !== frameId),
        currentFrame: state.currentFrameId === frameId ? null : state.currentFrame,
        currentFrameId: state.currentFrameId === frameId ? null : state.currentFrameId,
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete frame',
        isLoading: false 
      });
      return false;
    }
  },

  // Duplicate a frame
  duplicateFrame: async (frameId: string, newName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const frame = await frameApi.duplicateFrame(frameId, newName);
      set(state => ({
        frames: [frame, ...state.frames],
        isLoading: false
      }));
      return frame;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to duplicate frame',
        isLoading: false 
      });
      return null;
    }
  },

  // Set current frame ID
  setCurrentFrameId: (frameId: string | null) => {
    set({ currentFrameId: frameId });
  },

  // Set current frame
  setCurrentFrame: (frame: Frame | null) => {
    set({ 
      currentFrame: frame,
      currentFrameId: frame?.id || null
    });
  },

  // Mark unsaved changes
  markUnsavedChanges: () => {
    set({ hasUnsavedChanges: true });
  },

  // Mark as saved
  markSaved: () => {
    set({ 
      hasUnsavedChanges: false,
      lastSavedAt: new Date()
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Autosave frame
  autosaveFrame: async (frameId: string, data: any) => {
    try {
      const request: FrameUpdateRequest = {
        design: data
      };
      const frame = await frameApi.updateFrame(frameId, request);
      set(state => ({
        frames: state.frames.map(f => f.id === frameId ? frame : f),
        currentFrame: state.currentFrameId === frameId ? frame : state.currentFrame,
        lastSavedAt: new Date()
      }));
      return frame;
    } catch (error) {
      console.error('Autosave failed:', error);
      return null;
    }
  },

  // Reset current frame
  resetCurrentFrame: () => {
    set({ 
      currentFrame: null,
      currentFrameId: null,
      hasUnsavedChanges: false,
      lastSavedAt: null
    });
  },

  // Create new frame
  createNewFrame: () => {
    set({ 
      currentFrame: null,
      currentFrameId: null,
      hasUnsavedChanges: false,
      lastSavedAt: null
    });
  }
}));
