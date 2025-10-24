import { create } from 'zustand';
import { 
  renderApi, 
  RenderJob, 
  RenderJobCreateRequest, 
  RenderJobUpdateRequest, 
  RenderJobListResponse,
  RenderJobStatusResponse
} from '../services/renderApi';

interface RenderStore {
  // State
  renderJobs: RenderJob[];
  currentRenderJob: RenderJob | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRenderJobs: (params?: {
    workspace_id?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadRenderJob: (renderJobId: string) => Promise<RenderJob | null>;
  createRenderJob: (request: RenderJobCreateRequest) => Promise<RenderJob | null>;
  updateRenderJob: (renderJobId: string, request: RenderJobUpdateRequest) => Promise<RenderJob | null>;
  cancelRenderJob: (renderJobId: string) => Promise<boolean>;
  retryRenderJob: (renderJobId: string) => Promise<RenderJob | null>;
  getRenderJobStatus: (renderJobId: string) => Promise<RenderJobStatusResponse | null>;
  clearError: () => void;
  
  // Convenience methods
  renderFrame: (frameId: string, renderSettings?: Record<string, any>) => Promise<RenderJob | null>;
  renderBoard: (boardId: string, renderSettings?: Record<string, any>) => Promise<RenderJob | null>;
}

export const useRenderStore = create<RenderStore>((set, get) => ({
  // Initial state
  renderJobs: [],
  currentRenderJob: null,
  isLoading: false,
  error: null,

  // Load render jobs
  loadRenderJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await renderApi.listRenderJobs(params);
      set({ renderJobs: response.render_jobs, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load render jobs',
        isLoading: false 
      });
    }
  },

  // Load a single render job
  loadRenderJob: async (renderJobId: string) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.getRenderJob(renderJobId);
      set({ 
        currentRenderJob: renderJob, 
        isLoading: false 
      });
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load render job',
        isLoading: false 
      });
      return null;
    }
  },

  // Create a new render job
  createRenderJob: async (request: RenderJobCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.createRenderJob(request);
      set(state => ({
        renderJobs: [renderJob, ...state.renderJobs],
        currentRenderJob: renderJob,
        isLoading: false
      }));
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create render job',
        isLoading: false 
      });
      return null;
    }
  },

  // Update a render job
  updateRenderJob: async (renderJobId: string, request: RenderJobUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.updateRenderJob(renderJobId, request);
      set(state => ({
        renderJobs: state.renderJobs.map(rj => rj.id === renderJobId ? renderJob : rj),
        currentRenderJob: state.currentRenderJob?.id === renderJobId ? renderJob : state.currentRenderJob,
        isLoading: false
      }));
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update render job',
        isLoading: false 
      });
      return null;
    }
  },

  // Cancel a render job
  cancelRenderJob: async (renderJobId: string) => {
    set({ isLoading: true, error: null });
    try {
      await renderApi.cancelRenderJob(renderJobId);
      set(state => ({
        renderJobs: state.renderJobs.map(rj => 
          rj.id === renderJobId 
            ? { ...rj, status: 'cancelled' as const }
            : rj
        ),
        currentRenderJob: state.currentRenderJob?.id === renderJobId 
          ? { ...state.currentRenderJob, status: 'cancelled' as const }
          : state.currentRenderJob,
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cancel render job',
        isLoading: false 
      });
      return false;
    }
  },

  // Retry a failed render job
  retryRenderJob: async (renderJobId: string) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.retryRenderJob(renderJobId);
      set(state => ({
        renderJobs: [renderJob, ...state.renderJobs],
        isLoading: false
      }));
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to retry render job',
        isLoading: false 
      });
      return null;
    }
  },

  // Get render job status
  getRenderJobStatus: async (renderJobId: string) => {
    try {
      const status = await renderApi.getRenderJobStatus(renderJobId);
      return status;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get render job status'
      });
      return null;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Render a frame
  renderFrame: async (frameId: string, renderSettings?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.renderFrame(frameId, renderSettings);
      set(state => ({
        renderJobs: [renderJob, ...state.renderJobs],
        currentRenderJob: renderJob,
        isLoading: false
      }));
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to render frame',
        isLoading: false 
      });
      return null;
    }
  },

  // Render a board
  renderBoard: async (boardId: string, renderSettings?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const renderJob = await renderApi.renderBoard(boardId, renderSettings);
      set(state => ({
        renderJobs: [renderJob, ...state.renderJobs],
        currentRenderJob: renderJob,
        isLoading: false
      }));
      return renderJob;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to render board',
        isLoading: false 
      });
      return null;
    }
  }
}));
