import { useState, useCallback } from 'react';
import { Project, Frame } from '../types';

export const useProjectState = (initialProject: Project) => {
  const [project, setProject] = useState<Project>(initialProject);

  const updateProject = useCallback((updater: (prev: Project) => Project) => {
    setProject(updater);
  }, []);

  const updateFrame = useCallback((frameId: string, updates: Partial<Frame>) => {
    setProject(prev => ({
      ...prev,
      frames: prev.frames.map(frame => 
        frame.id === frameId ? { ...frame, ...updates } : frame
      )
    }));
  }, []);

  const addFrame = useCallback((frame: Frame) => {
    setProject(prev => ({
      ...prev,
      frames: [...prev.frames, frame],
      sequence: {
        ...prev.sequence,
        order: [...prev.sequence.order, frame.id]
      }
    }));
  }, []);

  const removeFrame = useCallback((frameId: string) => {
    setProject(prev => ({
      ...prev,
      frames: prev.frames.filter(frame => frame.id !== frameId),
      sequence: {
        ...prev.sequence,
        order: prev.sequence.order.filter(id => id !== frameId),
        transitions: prev.sequence.transitions.filter(t => 
          t.from !== frameId && t.to !== frameId
        )
      }
    }));
  }, []);

  const updateSequence = useCallback((updates: Partial<Project['sequence']>) => {
    setProject(prev => ({
      ...prev,
      sequence: { ...prev.sequence, ...updates }
    }));
  }, []);

  const updateBoard = useCallback((updates: Partial<Project['board']>) => {
    setProject(prev => ({
      ...prev,
      board: { ...prev.board, ...updates }
    }));
  }, []);

  return {
    project,
    updateProject,
    updateFrame,
    addFrame,
    removeFrame,
    updateSequence,
    updateBoard
  };
};

