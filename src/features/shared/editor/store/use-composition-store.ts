import { create } from 'zustand';
import { compositionApi, Composition } from '../../../../services/compositionApi';
import { generateDefaultWorkspaceName } from '../../../../utils/workspaceName';

interface CompositionStore {
  // State
  compositions: Composition[];
  currentCompositionId: string | null;
  currentCompositionName: string | null;
  currentComposition: Composition | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCompositions: () => Promise<void>;
  loadComposition: (id: string) => Promise<Composition | null>;
  saveComposition: (name: string, data: any) => Promise<Composition | null>;
  updateComposition: (id: string, data: any) => Promise<Composition | null>;
  setCurrentCompositionId: (id: string | null) => void;
  setCurrentCompositionName: (name: string | null) => void;
  setCurrentComposition: (composition: Composition | null) => void;
  markUnsavedChanges: () => void;
  markSaved: () => void;
  clearError: () => void;
  autosaveComposition: (data: any) => Promise<Composition | null>;
  resetCurrentComposition: () => void;
  createNewWorkspace: () => void;
}

export const useCompositionStore = create<CompositionStore>((set, get) => ({
  // Initial state
  compositions: [],
  currentCompositionId: null,
  currentCompositionName: null,
  currentComposition: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,

  // Load list of compositions
  loadCompositions: async () => {
    console.log('[CompositionStore] loadCompositions called');
    set({ isLoading: true, error: null });
    try {
      const response = await compositionApi.listCompositions();
      console.log('[CompositionStore] API response:', response);
      if (response.success && response.data.compositions) {
        console.log('[CompositionStore] Loaded compositions:', response.data.compositions.length);
        set({ compositions: response.data.compositions });
      } else {
        console.error('[CompositionStore] Invalid response structure:', response);
        set({ error: 'Failed to load compositions' });
      }
    } catch (error) {
      console.error('[CompositionStore] Load error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load compositions' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Load specific composition
  loadComposition: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await compositionApi.getComposition(id);
      if (response.success && response.data.composition) {
        set({ 
          currentCompositionId: id,
          currentCompositionName: response.data.composition.name
        });
        return response.data.composition;
      } else {
        set({ error: 'Failed to load composition' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load composition' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Save composition - save the exact render API payload
  saveComposition: async (name: string, data: any) => {
    console.log('[CompositionStore] saveComposition called with name:', name);
    set({ isLoading: true, error: null });
    try {
      // Save the exact data structure as-is (render API payload)
      const apiData = {
        name,
        description: `Composition saved on ${new Date().toLocaleDateString()}`,
        duration: data.duration || 0,
        fps: data.fps || 30,
        size: data.size || { width: 1080, height: 1920 },
        tracks_count: data.tracks?.length || 0,
        is_public: false,
        category: 'general',
        tags: [],
        design: data, // Save the entire data object as-is
        options: {
          fps: data.fps || 30,
          size: data.size || { width: 1080, height: 1920 },
          format: 'mp4'
        }
      };

      console.log('[CompositionStore] Calling API with data:', apiData);
      const response = await compositionApi.createComposition(apiData);
      console.log('[CompositionStore] API response:', response);
      
      if (response.success && response.data.composition) {
        // Add to local compositions list
        const newComposition = response.data.composition;
        console.log('[CompositionStore] Composition saved successfully:', newComposition);
        set(state => ({
          compositions: [newComposition, ...state.compositions],
          currentCompositionId: newComposition.id,
          currentCompositionName: newComposition.name,
          currentComposition: newComposition,
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
        }));
        return newComposition;
      } else {
        console.error('[CompositionStore] Invalid response structure:', response);
        set({ error: 'Failed to save composition' });
        return null;
      }
    } catch (error) {
      console.error('[CompositionStore] Save error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save composition' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update existing composition
  updateComposition: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const apiData = {
        name: get().currentComposition?.name || 'Untitled',
        description: `Updated on ${new Date().toLocaleDateString()}`,
        duration: data.duration || 0,
        fps: data.fps || 30,
        size: data.size || { width: 1080, height: 1920 },
        tracks_count: data.tracks?.length || 0,
        is_public: false,
        category: 'general',
        tags: [],
        design: data,
        options: {
          fps: data.fps || 30,
          size: data.size || { width: 1080, height: 1920 },
          format: 'mp4'
        }
      };

      const response = await compositionApi.updateComposition(id, apiData);
      if (response.success && response.data.composition) {
        const updatedComposition = response.data.composition;
        set(state => ({
          currentComposition: updatedComposition,
          compositions: state.compositions.map(comp => 
            comp.id === id ? updatedComposition : comp
          ),
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
        }));
        return updatedComposition;
      } else {
        set({ error: 'Failed to update composition' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update composition' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Set current composition ID
  setCurrentCompositionId: (id: string | null) => {
    set({ currentCompositionId: id });
  },

  // Set current composition name
  setCurrentCompositionName: (name: string | null) => {
    set({ currentCompositionName: name });
  },

  // Set current composition
  setCurrentComposition: (composition: Composition | null) => {
    set({ 
      currentComposition: composition,
      currentCompositionId: composition?.id || null,
      currentCompositionName: composition?.name || null,
      hasUnsavedChanges: false,
      lastSavedAt: composition ? new Date(composition.updated_at) : null
    });
  },

  // Mark as having unsaved changes
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

  // Reset current composition (useful when composition doesn't exist in DB)
  resetCurrentComposition: () => {
    set({ 
      currentComposition: null,
      currentCompositionId: null,
      currentCompositionName: null,
      hasUnsavedChanges: false
    });
  },

  // Clear all compositions (useful for debugging)
  clearAllCompositions: () => {
    set({ 
      compositions: [],
      currentComposition: null,
      currentCompositionId: null,
      currentCompositionName: null,
      hasUnsavedChanges: false
    });
  },

  // Create new workspace (clears current composition)
  createNewWorkspace: () => {
    set({ 
      currentComposition: null,
      currentCompositionId: null,
      currentCompositionName: null,
      hasUnsavedChanges: false
    });
  },

  // Autosave methods
  autosaveComposition: async (data: any) => {
    const state = get();
    if (!state.currentComposition) {
      return null;
    }

    try {
      const apiData = {
        name: state.currentComposition.name,
        description: `Auto-saved on ${new Date().toLocaleDateString()}`,
        duration: data.duration || 0,
        fps: data.fps || 30,
        size: data.size || { width: 1080, height: 1920 },
        tracks_count: data.tracks?.length || 0,
        is_public: false,
        category: 'general',
        tags: [],
        design: data,
        options: {
          fps: data.fps || 30,
          size: data.size || { width: 1080, height: 1920 },
          format: 'mp4'
        }
      };

      const response = await compositionApi.updateComposition(state.currentComposition.id, apiData);
      if (response.success && response.data.composition) {
        const updatedComposition = response.data.composition;
        set(state => ({
          currentComposition: updatedComposition,
          compositions: state.compositions.map(comp => 
            comp.id === state.currentCompositionId ? updatedComposition : comp
          ),
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
        }));
        return updatedComposition;
      } else {
        throw new Error('Autosave failed');
      }
    } catch (error) {
      console.error('Autosave error:', error);
      
      // If update failed, just log the error and don't create new compositions
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log('[Autosave] Composition not found, but not creating new one during autosave');
        // Reset current composition state since it doesn't exist
        const { resetCurrentComposition } = get();
        resetCurrentComposition();
      }
      
      throw error;
    }
  }
}));
