import { useCallback } from 'react';
import { EditorState, InspectorTab } from '../types';

interface UseFocusControllerProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  setInspectorState: React.Dispatch<React.SetStateAction<{
    activeTab: InspectorTab;
    selectedItem: { type: 'frame' | 'layer'; id: string } | null;
  }>>;
}

export const useFocusController = ({ 
  editorState, 
  setEditorState, 
  setInspectorState 
}: UseFocusControllerProps) => {
  const enterFrameFocus = useCallback((frameId: string) => {
    setEditorState(prev => ({
      ...prev,
      mode: 'frame',
      focusedFrameId: frameId,
      selectedFrameIds: [frameId],
      selectedLayerIds: []
    }));
    
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'notes'
    }));
  }, [setEditorState, setInspectorState]);

  const exitFrameFocus = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      mode: 'board',
      focusedFrameId: null,
      selectedLayerIds: []
    }));
    
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'frame'
    }));
  }, [setEditorState, setInspectorState]);

  return {
    enterFrameFocus,
    exitFrameFocus
  };
};
