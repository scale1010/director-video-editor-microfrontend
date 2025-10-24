import { create } from 'zustand';
import { 
  boardApi, 
  Board, 
  BoardCreateRequest, 
  BoardUpdateRequest, 
  BoardListResponse,
  FrameReference,
  AddFrameToBoardRequest
} from '../services/boardApi';

interface BoardStore {
  // State
  boards: Board[];
  currentBoardId: string | null;
  currentBoard: Board | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBoards: (params?: {
    workspace_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }) => Promise<void>;
  loadBoard: (boardId: string) => Promise<Board | null>;
  createBoard: (request: BoardCreateRequest) => Promise<Board | null>;
  updateBoard: (boardId: string, request: BoardUpdateRequest) => Promise<Board | null>;
  deleteBoard: (boardId: string) => Promise<boolean>;
  duplicateBoard: (boardId: string, newName?: string) => Promise<Board | null>;
  setCurrentBoardId: (boardId: string | null) => void;
  setCurrentBoard: (board: Board | null) => void;
  markUnsavedChanges: () => void;
  markSaved: () => void;
  clearError: () => void;
  autosaveBoard: (boardId: string, data: any) => Promise<Board | null>;
  resetCurrentBoard: () => void;
  createNewBoard: () => void;
  
  // Frame management
  addFrameToBoard: (boardId: string, request: AddFrameToBoardRequest) => Promise<Board | null>;
  removeFrameFromBoard: (boardId: string, frameRefId: string) => Promise<Board | null>;
  updateFrameReference: (boardId: string, frameRefId: string, frameRef: FrameReference) => Promise<Board | null>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  // Initial state
  boards: [],
  currentBoardId: null,
  currentBoard: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,

  // Load boards
  loadBoards: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardApi.listBoards(params);
      set({ boards: response.boards, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load boards',
        isLoading: false 
      });
    }
  },

  // Load a single board
  loadBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.getBoard(boardId);
      set({ 
        currentBoard: board, 
        currentBoardId: boardId,
        isLoading: false 
      });
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load board',
        isLoading: false 
      });
      return null;
    }
  },

  // Create a new board
  createBoard: async (request: BoardCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.createBoard(request);
      set(state => ({
        boards: [board, ...state.boards],
        currentBoard: board,
        currentBoardId: board.id,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date()
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create board',
        isLoading: false 
      });
      return null;
    }
  },

  // Update a board
  updateBoard: async (boardId: string, request: BoardUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.updateBoard(boardId, request);
      set(state => ({
        boards: state.boards.map(b => b.id === boardId ? board : b),
        currentBoard: state.currentBoardId === boardId ? board : state.currentBoard,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date()
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update board',
        isLoading: false 
      });
      return null;
    }
  },

  // Delete a board
  deleteBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardApi.deleteBoard(boardId);
      set(state => ({
        boards: state.boards.filter(b => b.id !== boardId),
        currentBoard: state.currentBoardId === boardId ? null : state.currentBoard,
        currentBoardId: state.currentBoardId === boardId ? null : state.currentBoardId,
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete board',
        isLoading: false 
      });
      return false;
    }
  },

  // Duplicate a board
  duplicateBoard: async (boardId: string, newName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.duplicateBoard(boardId, newName);
      set(state => ({
        boards: [board, ...state.boards],
        isLoading: false
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to duplicate board',
        isLoading: false 
      });
      return null;
    }
  },

  // Set current board ID
  setCurrentBoardId: (boardId: string | null) => {
    set({ currentBoardId: boardId });
  },

  // Set current board
  setCurrentBoard: (board: Board | null) => {
    set({ 
      currentBoard: board,
      currentBoardId: board?.id || null
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

  // Autosave board
  autosaveBoard: async (boardId: string, data: any) => {
    try {
      const request: BoardUpdateRequest = {
        frame_references: data.frame_references,
        layout: data.layout,
        transitions: data.transitions,
        sequence_settings: data.sequence_settings
      };
      const board = await boardApi.updateBoard(boardId, request);
      set(state => ({
        boards: state.boards.map(b => b.id === boardId ? board : b),
        currentBoard: state.currentBoardId === boardId ? board : state.currentBoard,
        lastSavedAt: new Date()
      }));
      return board;
    } catch (error) {
      console.error('Autosave failed:', error);
      return null;
    }
  },

  // Reset current board
  resetCurrentBoard: () => {
    set({ 
      currentBoard: null,
      currentBoardId: null,
      hasUnsavedChanges: false,
      lastSavedAt: null
    });
  },

  // Create new board
  createNewBoard: () => {
    set({ 
      currentBoard: null,
      currentBoardId: null,
      hasUnsavedChanges: false,
      lastSavedAt: null
    });
  },

  // Add frame to board
  addFrameToBoard: async (boardId: string, request: AddFrameToBoardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.addFrameToBoard(boardId, request);
      set(state => ({
        boards: state.boards.map(b => b.id === boardId ? board : b),
        currentBoard: state.currentBoardId === boardId ? board : state.currentBoard,
        isLoading: false
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add frame to board',
        isLoading: false 
      });
      return null;
    }
  },

  // Remove frame from board
  removeFrameFromBoard: async (boardId: string, frameRefId: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.removeFrameFromBoard(boardId, frameRefId);
      set(state => ({
        boards: state.boards.map(b => b.id === boardId ? board : b),
        currentBoard: state.currentBoardId === boardId ? board : state.currentBoard,
        isLoading: false
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove frame from board',
        isLoading: false 
      });
      return null;
    }
  },

  // Update frame reference
  updateFrameReference: async (boardId: string, frameRefId: string, frameRef: FrameReference) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardApi.updateFrameReference(boardId, frameRefId, frameRef);
      set(state => ({
        boards: state.boards.map(b => b.id === boardId ? board : b),
        currentBoard: state.currentBoardId === boardId ? board : state.currentBoard,
        isLoading: false
      }));
      return board;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update frame reference',
        isLoading: false 
      });
      return null;
    }
  }
}));
