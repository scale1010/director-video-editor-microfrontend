// Main entry point for the new editor system

// Export all editor modules
export { SimpleEditor } from './simple-editor';
export { AdvancedEditor } from './advanced-editor';

// Export editor router
export { 
  MainEditorRouter, 
  EditorRouter, 
  EditorRouterProvider,
  useEditorRouter,
  type EditorMode 
} from './editor-router';

// Export main editor component
export { MainEditor } from './editor-router/components/MainEditor';
export { EditorModeSwitcher } from './editor-router/components/EditorModeSwitcher';

// Export shared components and utilities
export { useSharedStore } from './shared/store/use-shared-store';
export { useSharedLayoutStore } from './shared/store/use-shared-layout-store';
export { useSharedCompositionStore } from './shared/store/use-shared-composition-store';
export { useSharedDownloadStore } from './shared/store/use-shared-download-store';
export { useSharedDataStore } from './shared/store/use-shared-data-store';

// Export shared hooks
export { useZoom } from './shared/hooks/use-zoom';
export { useAutosave } from './shared/hooks/use-autosave';
export { useSharedKeyboardShortcuts } from './shared/hooks/use-keyboard-shortcuts';
export { useSharedTimelineEvents } from './shared/hooks/use-timeline-events';

// Export shared components
export { default as Scene } from './shared/components/Scene/Scene';
export { default as Player } from './shared/components/Player/Player';
export { Timeline } from './shared/components/Timeline/Timeline';
export { RightDrawer } from './shared/components/RightDrawer/RightDrawer';
export { HorizontalMediaToolbar } from './shared/components/HorizontalMediaToolbar/HorizontalMediaToolbar';

// Export shared types
export type { IDataState, IFont, ICompactFont } from './shared/types/editor';
export type { ILayoutState, IMenuItem, RightDrawerContent } from './shared/types/layout';

// Export shared utilities
export { generateDefaultFrameName } from './shared/utils/frameName';
export { loadFonts, getCompactFontData } from './shared/utils/fonts';
