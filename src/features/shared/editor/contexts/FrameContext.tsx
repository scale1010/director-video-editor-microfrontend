import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFrameStore } from '../../frame-editor/store/use-frame-store';
import { Frame } from '../../frame-editor/services/frameApi';

interface FrameContextType {
  frame: Frame | null;
  isLoading: boolean;
  error: string | null;
  updateFrame: (updates: Partial<Frame>) => void;
  saveFrame: () => Promise<void>;
  renderFrame: () => Promise<void>;
}

const FrameContext = createContext<FrameContextType | undefined>(undefined);

interface FrameProviderProps {
  children: ReactNode;
  frameId: string;
}

export const FrameProvider: React.FC<FrameProviderProps> = ({ children, frameId }) => {
  const { 
    currentFrame, 
    isLoading, 
    error, 
    loadFrame, 
    updateFrame: updateFrameStore,
    clearError 
  } = useFrameStore();
  
  const [frame, setFrame] = useState<Frame | null>(null);

  useEffect(() => {
    if (frameId) {
      // For now, create a mock frame instead of loading from API
      // This avoids authentication issues during development
      const mockFrame: Frame = {
        id: frameId,
        name: `Frame ${frameId}`,
        description: 'Mock frame for development',
        metadata: {},
        size: { width: 1080, height: 1920 },
        background: { type: 'color', value: '#ffffff' },
        fps: 30,
        duration: 5.0,
        posterTime: 0.25,
        labelColor: 'blue',
        design: {
          layers: [],
          timeline: {
            duration: 5.0,
            fps: 30,
            tracks: [],
            playheadTime: 0
          }
        },
        renderSettings: {
          format: 'mp4',
          quality: 'high',
          fps: 30
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setFrame(mockFrame);
      // Don't call loadFrame(frameId) to avoid API authentication issues
    }
  }, [frameId]);

  // Remove this useEffect as it conflicts with the mock frame creation
  // useEffect(() => {
  //   setFrame(currentFrame);
  // }, [currentFrame]);

  const updateFrame = (updates: Partial<Frame>) => {
    if (!frame) return;
    
    const updatedFrame = { ...frame, ...updates };
    setFrame(updatedFrame);
    
    // Update the store
    updateFrameStore(frameId, {
      design: updatedFrame.design,
      name: updatedFrame.name,
      description: updatedFrame.description
    });
  };

  const saveFrame = async () => {
    if (!frame) return;
    
    try {
      // For now, just log the save action to avoid API authentication issues
      console.log('Saving frame:', frame.id, frame);
      // In a real implementation, this would call the backend API
      // await updateFrameStore(frameId, {
      //   design: frame.design,
      //   name: frame.name,
      //   description: frame.description
      // });
    } catch (error) {
      console.error('Failed to save frame:', error);
    }
  };

  const renderFrame = async () => {
    if (!frame) return;
    
    try {
      // For now, just log the render action to avoid API authentication issues
      console.log('Rendering frame:', frame.id);
      // In a real implementation, this would call the render API
    } catch (error) {
      console.error('Failed to render frame:', error);
    }
  };

  const value: FrameContextType = {
    frame,
    isLoading,
    error,
    updateFrame,
    saveFrame,
    renderFrame
  };

  return (
    <FrameContext.Provider value={value}>
      {children}
    </FrameContext.Provider>
  );
};

export const useFrame = (): FrameContextType => {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error('useFrame must be used within a FrameProvider');
  }
  return context;
};
