'use client';

import React from 'react';
import { AdvancedEditor } from '../../features/advanced-editor';

export default function AdvancedEditorPage() {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <AdvancedEditor />
    </div>
  );
}
