import { primaryApp } from '@/config/environment';

export interface RenderJob {
  id: string;
  type: 'frame' | 'board' | 'composition';
  source_id: string;
  user_id: string;
  workspace_id: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  render_settings: Record<string, any>;
  output_url?: string;
  thumbnail_url?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  gallery_folder: string;
  progress: number;
  estimated_completion?: string;
  render_duration?: number;
  output_size?: { width: number; height: number };
  output_duration?: number;
  output_file_size?: number;
}

export interface RenderJobCreateRequest {
  type: 'frame' | 'board' | 'composition';
  source_id: string;
  user_id: string;
  workspace_id: string;
  render_settings?: Record<string, any>;
  gallery_folder?: string;
}

export interface RenderJobUpdateRequest {
  status?: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  output_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  progress?: number;
  estimated_completion?: string;
  render_duration?: number;
  output_size?: { width: number; height: number };
  output_duration?: number;
  output_file_size?: number;
}

export interface RenderJobListResponse {
  render_jobs: RenderJob[];
  total: number;
  page: number;
  limit: number;
}

export interface RenderJobStatusResponse {
  id: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  output_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  estimated_completion?: string;
  render_duration?: number;
  output_size?: { width: number; height: number };
  output_duration?: number;
  output_file_size?: number;
}

class RenderApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${primaryApp.apiBaseUrl}/api`;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      console.log('[RenderAPI] Making request:', method, url);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `API call failed: ${response.status} ${response.statusText}`;
        console.error('[RenderAPI] Request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (method === 'DELETE' && response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      console.log('[RenderAPI] Request successful:', result);
      return result;
    } catch (error) {
      console.error('[RenderAPI] Error:', error);
      throw error;
    }
  }

  // Create a new render job
  async createRenderJob(request: RenderJobCreateRequest): Promise<RenderJob> {
    return this.makeRequest<RenderJob>('/render-jobs', 'POST', request);
  }

  // Get a render job by ID
  async getRenderJob(renderJobId: string): Promise<RenderJob> {
    return this.makeRequest<RenderJob>(`/render-jobs/${renderJobId}`);
  }

  // Update a render job
  async updateRenderJob(renderJobId: string, request: RenderJobUpdateRequest): Promise<RenderJob> {
    return this.makeRequest<RenderJob>(`/render-jobs/${renderJobId}`, 'PUT', request);
  }

  // List render jobs
  async listRenderJobs(params?: {
    workspace_id?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<RenderJobListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/render-jobs?${queryString}` : '/render-jobs';
    return this.makeRequest<RenderJobListResponse>(endpoint);
  }

  // Get render job status
  async getRenderJobStatus(renderJobId: string): Promise<RenderJobStatusResponse> {
    return this.makeRequest<RenderJobStatusResponse>(`/render-jobs/${renderJobId}/status`);
  }

  // Cancel a render job
  async cancelRenderJob(renderJobId: string): Promise<void> {
    return this.makeRequest<void>(`/render-jobs/${renderJobId}/cancel`, 'POST');
  }

  // Retry a failed render job
  async retryRenderJob(renderJobId: string): Promise<RenderJob> {
    return this.makeRequest<RenderJob>(`/render-jobs/${renderJobId}/retry`, 'POST');
  }

  // Render a frame
  async renderFrame(frameId: string, renderSettings?: Record<string, any>): Promise<RenderJob> {
    const request = {
      frame_id: frameId,
      render_settings: renderSettings
    };
    return this.makeRequest<RenderJob>(`/frames/${frameId}/render`, 'POST', request);
  }

  // Render a board
  async renderBoard(boardId: string, renderSettings?: Record<string, any>): Promise<RenderJob> {
    const request = {
      board_id: boardId,
      render_settings: renderSettings
    };
    return this.makeRequest<RenderJob>(`/boards/${boardId}/render`, 'POST', request);
  }
}

export const renderApi = new RenderApiService();
