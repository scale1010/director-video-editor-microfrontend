'use client';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedBoardEditor } from '../../../features/shared/board-editor/components/EnhancedBoardEditor';

export default function BoardEditorPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/advanced-editor');
  };

  return (
    <EnhancedBoardEditor 
      boardId={boardId} 
      onBack={handleBack}
    />
  );
}
