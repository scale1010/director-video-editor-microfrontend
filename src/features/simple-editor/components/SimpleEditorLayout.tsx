"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "../../shared/utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "../../shared/constants/constants";
import { FONTS } from "../../shared/data/fonts";
import { generateDefaultFrameName } from "../../shared/utils/frameName";
import { useAutosave } from "../../shared/hooks/use-autosave";
import { useSimpleEditorContext } from "../providers/SimpleEditorProvider";
import { useSharedStore } from "../../shared/store/use-shared-store";
import { useSharedLayoutStore } from "../../shared/store/use-shared-layout-store";
import { useSharedDataStore } from "../../shared/store/use-shared-data-store";
import { useSharedCompositionStore } from "../../shared/store/use-shared-composition-store";
import { useSharedKeyboardShortcuts } from "../../shared/hooks/use-keyboard-shortcuts";
import { useSharedTimelineEvents } from "../../shared/hooks/use-timeline-events";
import { SimpleNavbar } from "./SimpleNavbar";
import { SimpleTimeline } from "./SimpleTimeline";
import { SimpleScene } from "./SimpleScene";
import { SimpleRightDrawer } from "./SimpleRightDrawer";
import { SimpleMediaToolbar } from "./SimpleMediaToolbar";
import { SimpleFloatingControl } from "./SimpleFloatingControl";
import { SimpleCropModal } from "./SimpleCropModal";

const SimpleEditorLayout = () => {
  const [frameName, setFrameName] = useState<string>(generateDefaultFrameName());
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { stateManager } = useSimpleEditorContext();
  const { timeline, playerRef } = useSharedStore();
  const { isSidebarHovered, setIsSidebarHovered } = useSharedLayoutStore();

  useSharedTimelineEvents();
  useSharedKeyboardShortcuts();
  
  // Initialize autosave
  const autosave = useAutosave(stateManager, {
    debounceDelay: 2000, // 2 seconds for localStorage
    periodicInterval: 30000, // 30 seconds for backend
    enableLocalStorage: true,
    enableBackendAutosave: true,
  });
  
  // Debug hover state changes
  useEffect(() => {
    console.log('Simple Editor - Hover state changed:', isSidebarHovered);
  }, [isSidebarHovered]);

  // Handle click outside to hide panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the sidebar and outside the floating panel
      if (!target.closest('.sidebar-container') && !target.closest('.floating-panel')) {
        setIsSidebarHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsSidebarHovered]);

  const { setCompactFonts, setFonts } = useSharedDataStore();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  // Add unsaved changes warning
  const { hasUnsavedChanges } = useSharedCompositionStore();
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <SimpleNavbar 
        user={null}
        stateManager={stateManager}
        setFrameName={setFrameName}
        frameName={frameName}
        autosave={autosave}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="flex-1">
          {/* Scene Area */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full flex">
              {/* Media Toolbar */}
              <SimpleMediaToolbar />
              
              {/* Scene */}
              <div className="flex-1 relative">
                <SimpleScene stateManager={stateManager} />
                <SimpleFloatingControl />
                <SimpleCropModal />
              </div>
            </div>
          </ResizablePanel>

          {/* Timeline */}
          <ResizableHandle />
          <ResizablePanel 
            ref={timelinePanelRef}
            defaultSize={30} 
            minSize={20}
            maxSize={50}
          >
            <SimpleTimeline stateManager={stateManager} />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Right Drawer */}
        <SimpleRightDrawer />
      </div>
    </div>
  );
};

export { SimpleEditorLayout };
