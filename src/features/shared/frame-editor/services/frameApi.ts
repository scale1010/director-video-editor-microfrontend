import { primaryApp } from '@/config/environment';

export interface FrameSize {
  width: number;
  height: number;
}

export interface FrameBackground {
  type: 'color' | 'image';
  value: string;
}

export interface FrameDesign {
  id: string;
  size: FrameSize;
  fps: number;
  tracks: any[];
  trackItemIds: string[];
  trackItemsMap: Record<string, any>;
  transitionIds: string[];
  transitionsMap: Record<string, any>;
  scale: any;
  duration: number;
  activeIds: string[];
  structure: any[];
  background: FrameBackground;
}

export interface FrameRenderSettings {
  format: string;
  quality: string;
  fps?: number;
  size?: FrameSize;
}

export interface FrameMetadata {
  tags: string[];
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Frame {
  id: string;
  name: string;
  description: string;
  size: FrameSize;
  duration: number;
  fps: number;
  background: FrameBackground;
  design: FrameDesign;
  render_settings: FrameRenderSettings;
  metadata: FrameMetadata;
  is_public: boolean;
  created_by: string;
  workspace_id: string;
  last_rendered_at?: string;
  thumbnail_url?: string;
  render_count: number;
}

export interface FrameCreateRequest {
  name: string;
  description?: string;
  size: FrameSize;
  duration?: number;
  fps?: number;
  background: FrameBackground;
  design?: FrameDesign;
  is_public?: boolean;
  workspace_id: string;
}

export interface FrameUpdateRequest {
  name?: string;
  description?: string;
  design?: FrameDesign;
  render_settings?: FrameRenderSettings;
  is_public?: boolean;
}

export interface FrameListResponse {
  frames: Frame[];
  total: number;
  page: number;
  limit: number;
}

export interface FrameRenderRequest {
  frame_id: string;
  render_settings?: FrameRenderSettings;
  user_id?: string;
}

export interface RenderResponse {
  render_id: string;
  frame_id: string;
  status: string;
  bucket_name: string;
}

class FrameApiService {
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
      console.log('[FrameAPI] Making request:', method, url);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `API call failed: ${response.status} ${response.statusText}`;
        console.error('[FrameAPI] Request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (method === 'DELETE' && response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      console.log('[FrameAPI] Request successful:', result);
      return result;
    } catch (error) {
      console.error('[FrameAPI] Error:', error);
      throw error;
    }
  }

  // Create a new frame
  async createFrame(request: FrameCreateRequest): Promise<Frame> {
    return this.makeRequest<Frame>('/frames', 'POST', request);
  }

  // Get a frame by ID
  async getFrame(frameId: string): Promise<Frame> {
    return this.makeRequest<Frame>(`/frames/${frameId}`);
  }

  // Update a frame
  async updateFrame(frameId: string, request: FrameUpdateRequest): Promise<Frame> {
    return this.makeRequest<Frame>(`/frames/${frameId}`, 'PUT', request);
  }

  // Delete a frame
  async deleteFrame(frameId: string): Promise<void> {
    return this.makeRequest<void>(`/frames/${frameId}`, 'DELETE');
  }

  // List frames
  async listFrames(params?: {
    workspace_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }): Promise<FrameListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/frames?${queryString}` : '/frames';
    return this.makeRequest<FrameListResponse>(endpoint);
  }

  // Get frame library (public frames)
  async getFrameLibrary(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }): Promise<FrameListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/frames/library?${queryString}` : '/frames/library';
    return this.makeRequest<FrameListResponse>(endpoint);
  }

  // Render a frame
  async renderFrame(frameId: string, request?: FrameRenderRequest): Promise<RenderResponse> {
    const renderRequest = request || { frame_id: frameId };
    return this.makeRequest<RenderResponse>(`/frames/${frameId}/render`, 'POST', renderRequest);
  }

  // Duplicate a frame
  async duplicateFrame(frameId: string, newName?: string): Promise<Frame> {
    const queryParams = newName ? `?new_name=${encodeURIComponent(newName)}` : '';
    return this.makeRequest<Frame>(`/frames/${frameId}/duplicate${queryParams}`, 'POST');
  }
}

export const frameApi = new FrameApiService();
