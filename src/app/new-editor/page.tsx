'use client';

import React, { useState } from 'react';
import { SimpleEditor } from '../../features/simple-editor';
import { AdvancedEditor } from '../../features/advanced-editor';

export default function NewEditorPage() {
  const [currentMode, setCurrentMode] = useState<'simple' | 'advanced' | 'expert'>('simple');

  const renderEditor = () => {
    switch (currentMode) {
      case 'simple':
        return <SimpleEditor />;
      case 'advanced':
        return <AdvancedEditor />;
      case 'expert':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Expert Editor</h1>
              <p className="text-muted-foreground">Coming Soon - Professional video editing features</p>
            </div>
          </div>
        );
      default:
        return <SimpleEditor />;
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      {/* Mode Switcher */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex gap-2 p-2 bg-muted rounded-lg shadow-lg">
          <button
            onClick={() => setCurrentMode('simple')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentMode === 'simple' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Simple Editor
          </button>
          <button
            onClick={() => setCurrentMode('advanced')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentMode === 'advanced' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Advanced Editor
          </button>
          <button
            onClick={() => setCurrentMode('expert')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentMode === 'expert' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expert Editor
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="h-full">
        {renderEditor()}
      </div>
    </div>
  );
}
