import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { 
  Plus, 
  Save, 
  Play, 
  Settings, 
  ArrowLeft,
  Grid3X3,
  Eye,
  EyeOff
} from 'lucide-react';
import { FrameLibrary } from './FrameLibrary';
import { BoardCanvas } from './BoardCanvas';
import { useBoardStore } from '../store/use-board-store';
import { useFrameStore } from '../../frame-editor/store/use-frame-store';
import { Board, FrameReference, AddFrameToBoardRequest } from '../services/boardApi';

interface EnhancedBoardEditorProps {
  boardId?: string;
  onBack?: () => void;
}

export const EnhancedBoardEditor: React.FC<EnhancedBoardEditorProps> = ({
  boardId,
  onBack
}) => {
  const navigate = useNavigate();
  const { 
    currentBoard, 
    loadBoard, 
    createBoard, 
    updateBoard,
    addFrameToBoard,
    removeFrameFromBoard,
    updateFrameReference,
    isLoading,
    error
  } = useBoardStore();
  
  const { duplicateFrame } = useFrameStore();
  
  const [showFrameLibrary, setShowFrameLibrary] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Load board on mount
  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    } else {
      // Create a new board if no ID provided
      createNewBoard();
    }
  }, [boardId, loadBoard]);

  const createNewBoard = async () => {
    try {
      await createBoard({
        name: 'New Board',
        description: 'A new board for organizing frames',
        workspace_id: 'default' // This should come from context
      });
    } catch (error) {
      console.error('Failed to create new board:', error);
    }
  };

  const handleAddFrame = async (frameId: string) => {
    if (!currentBoard) return;

    try {
      const request: AddFrameToBoardRequest = {
        frame_id: frameId,
        position: { x: 100, y: 100 },
        scale: 1.0,
        rotation: 0,
        start_time: 0,
        end_time: 5.0
      };
      
      await addFrameToBoard(currentBoard.id, request);
    } catch (error) {
      console.error('Failed to add frame to board:', error);
    }
  };

  const handleEditFrame = (frameId: string) => {
    navigate(`/frame-editor/${frameId}`);
  };

  const handleDuplicateFrame = async (frameId: string) => {
    try {
      await duplicateFrame(frameId, `${frameId} (Copy)`);
    } catch (error) {
      console.error('Failed to duplicate frame:', error);
    }
  };

  const handleRenderFrame = async (frameId: string) => {
    // This would trigger frame rendering
    console.log('Rendering frame:', frameId);
  };

  const handleUpdateFrameReference = async (frameRefId: string, updates: Partial<FrameReference>) => {
    if (!currentBoard) return;

    try {
      const frameRef = currentBoard.frame_references.find(fr => fr.id === frameRefId);
      if (frameRef) {
        const updatedFrameRef = { ...frameRef, ...updates };
        await updateFrameReference(currentBoard.id, frameRefId, updatedFrameRef);
      }
    } catch (error) {
      console.error('Failed to update frame reference:', error);
    }
  };

  const handleRemoveFrame = async (frameRefId: string) => {
    if (!currentBoard) return;

    try {
      await removeFrameFromBoard(currentBoard.id, frameRefId);
    } catch (error) {
      console.error('Failed to remove frame from board:', error);
    }
  };

  const handleSaveBoard = async () => {
    if (!currentBoard) return;

    try {
      await updateBoard(currentBoard.id, {
        name: currentBoard.name,
        description: currentBoard.description
      });
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  };

  const handleRenderBoard = async () => {
    if (!currentBoard) return;

    try {
      // This would trigger board rendering
      console.log('Rendering board:', currentBoard.id);
    } catch (error) {
      console.error('Failed to render board:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error Loading Board</h1>
          <p className="mb-4">{error}</p>
          <Button onClick={onBack || (() => navigate('/advanced-editor'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Board Not Found</h1>
          <Button onClick={onBack || (() => navigate('/advanced-editor'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-lg font-semibold">{currentBoard.name}</h1>
          <Badge variant="outline" className="ml-2">
            {currentBoard.frame_references.length} frames
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFrameLibrary(!showFrameLibrary)}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveBoard}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRenderBoard}
          >
            <Play className="w-4 h-4 mr-2" />
            Render
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Frame Library Panel */}
          {showFrameLibrary && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <FrameLibrary
                  onAddFrame={handleAddFrame}
                  onEditFrame={handleEditFrame}
                  onDuplicateFrame={handleDuplicateFrame}
                  onRenderFrame={handleRenderFrame}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Board Canvas Panel */}
          <ResizablePanel defaultSize={showFrameLibrary ? 75 : 100}>
            <BoardCanvas
              board={currentBoard}
              onUpdateFrameReference={handleUpdateFrameReference}
              onRemoveFrame={handleRemoveFrame}
              onAddFrame={handleAddFrame}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
