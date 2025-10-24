import { primaryApp } from '@/config/environment';

export interface Position {
  x: number;
  y: number;
}

export interface FrameReference {
  id: string;
  frame_id: string;
  position: Position;
  scale: number;
  rotation: number;
  start_time: number;
  end_time?: number;
  opacity: number;
  visible: boolean;
}

export interface BoardLayout {
  canvas_size: { width: number; height: number };
  zoom: number;
  pan: Position;
  grid_enabled: boolean;
  snap_to_grid: boolean;
  grid_size: number;
}

export interface Transition {
  id: string;
  from_frame_ref_id: string;
  to_frame_ref_id: string;
  type: string;
  duration: number;
  settings: Record<string, any>;
}

export interface SequenceSettings {
  total_duration: number;
  fps: number;
  background_color: string;
  auto_advance: boolean;
  loop: boolean;
}

export interface BoardRenderSettings {
  format: string;
  quality: string;
  fps?: number;
  size?: { width: number; height: number };
  include_transitions: boolean;
}

export interface BoardMetadata {
  tags: string[];
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  workspace_id: string;
  frame_references: FrameReference[];
  layout: BoardLayout;
  transitions: Transition[];
  sequence_settings: SequenceSettings;
  render_settings: BoardRenderSettings;
  metadata: BoardMetadata;
  created_by: string;
  last_rendered_at?: string;
  thumbnail_url?: string;
  render_count: number;
}

export interface BoardCreateRequest {
  name: string;
  description?: string;
  workspace_id: string;
  layout?: BoardLayout;
  sequence_settings?: SequenceSettings;
}

export interface BoardUpdateRequest {
  name?: string;
  description?: string;
  frame_references?: FrameReference[];
  layout?: BoardLayout;
  transitions?: Transition[];
  sequence_settings?: SequenceSettings;
  render_settings?: BoardRenderSettings;
}

export interface BoardListResponse {
  boards: Board[];
  total: number;
  page: number;
  limit: number;
}

export interface BoardRenderRequest {
  board_id: string;
  render_settings?: BoardRenderSettings;
  user_id?: string;
}

export interface AddFrameToBoardRequest {
  frame_id: string;
  position: Position;
  scale?: number;
  rotation?: number;
  start_time?: number;
  end_time?: number;
}

export interface RenderResponse {
  render_id: string;
  board_id: string;
  status: string;
  bucket_name: string;
}

class BoardApiService {
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
      console.log('[BoardAPI] Making request:', method, url);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `API call failed: ${response.status} ${response.statusText}`;
        console.error('[BoardAPI] Request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (method === 'DELETE' && response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      console.log('[BoardAPI] Request successful:', result);
      return result;
    } catch (error) {
      console.error('[BoardAPI] Error:', error);
      throw error;
    }
  }

  // Create a new board
  async createBoard(request: BoardCreateRequest): Promise<Board> {
    return this.makeRequest<Board>('/boards', 'POST', request);
  }

  // Get a board by ID
  async getBoard(boardId: string): Promise<Board> {
    return this.makeRequest<Board>(`/boards/${boardId}`);
  }

  // Update a board
  async updateBoard(boardId: string, request: BoardUpdateRequest): Promise<Board> {
    return this.makeRequest<Board>(`/boards/${boardId}`, 'PUT', request);
  }

  // Delete a board
  async deleteBoard(boardId: string): Promise<void> {
    return this.makeRequest<void>(`/boards/${boardId}`, 'DELETE');
  }

  // List boards
  async listBoards(params?: {
    workspace_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }): Promise<BoardListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/boards?${queryString}` : '/boards';
    return this.makeRequest<BoardListResponse>(endpoint);
  }

  // Add frame to board
  async addFrameToBoard(boardId: string, request: AddFrameToBoardRequest): Promise<Board> {
    return this.makeRequest<Board>(`/boards/${boardId}/frames`, 'POST', request);
  }

  // Remove frame from board
  async removeFrameFromBoard(boardId: string, frameRefId: string): Promise<Board> {
    return this.makeRequest<Board>(`/boards/${boardId}/frames/${frameRefId}`, 'DELETE');
  }

  // Update frame reference in board
  async updateFrameReference(boardId: string, frameRefId: string, frameRef: FrameReference): Promise<Board> {
    return this.makeRequest<Board>(`/boards/${boardId}/frames/${frameRefId}`, 'PUT', frameRef);
  }

  // Render a board
  async renderBoard(boardId: string, request?: BoardRenderRequest): Promise<RenderResponse> {
    const renderRequest = request || { board_id: boardId };
    return this.makeRequest<RenderResponse>(`/boards/${boardId}/render`, 'POST', renderRequest);
  }

  // Duplicate a board
  async duplicateBoard(boardId: string, newName?: string): Promise<Board> {
    const queryParams = newName ? `?new_name=${encodeURIComponent(newName)}` : '';
    return this.makeRequest<Board>(`/boards/${boardId}/duplicate${queryParams}`, 'POST');
  }
}

export const boardApi = new BoardApiService();
