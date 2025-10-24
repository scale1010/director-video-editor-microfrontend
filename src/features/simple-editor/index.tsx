"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "../shared/editor/utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "../shared/editor/constants/constants";
import { FONTS } from "../shared/editor/data/fonts";
import { generateDefaultFrameName } from "../shared/editor/utils/frameName";
import { useAutosave } from "../shared/editor/hooks/use-autosave";
import useStore from "../shared/editor/store/use-store";
import useLayoutStore from "../shared/editor/store/use-layout-store";
import useDataState from "../shared/editor/store/use-data-state";
import { useCompositionStore } from "../shared/editor/store/use-composition-store";
import { useKeyboardShortcuts } from "../shared/editor/hooks/use-keyboard-shortcuts";
import useTimelineEvents from "../shared/editor/hooks/use-timeline-events";
import StateManager from '@designcombo/state';
import Scene from '../shared/editor/scene/scene';
import Timeline from '../shared/editor/timeline/timeline';
import { RightDrawer } from '../shared/editor/components/right-drawer';
import HorizontalMediaToolbar from '../shared/editor/horizontal-media-toolbar';
import FloatingControl from '../shared/editor/control-item/floating-controls/floating-control';
import CropModal from '../shared/editor/crop-modal/crop-modal';
import { MenuItem } from '../shared/editor/menu-item/menu-item';

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

export const SimpleEditor: React.FC = () => {
  const [frameName, setFrameName] = useState<string>(generateDefaultFrameName());
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { timeline, playerRef } = useStore();
  const { isSidebarHovered, setIsSidebarHovered } = useLayoutStore();
  const { setCompactFonts, setFonts } = useDataState();
  const { currentComposition, saveComposition, updateComposition } = useCompositionStore();

  useTimelineEvents();
  useKeyboardShortcuts();
  
  // Initialize autosave
  const autosave = useAutosave(stateManager, {
    debounceDelay: 2000, // 2 seconds for localStorage
    periodicInterval: 30000, // 30 seconds for backend
    enableLocalStorage: true,
    enableBackend: false, // Disable for now
  });

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, [setCompactFonts, setFonts]);

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
  const { hasUnsavedChanges } = useCompositionStore();
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTimelineResize = () => {
    const timelineContainer = document.getElementById("timeline-container");
    if (!timelineContainer) return;

    timeline?.resize(
      {
        height: timelineContainer.clientHeight - 90,
        width: timelineContainer.clientWidth - 40,
      },
      {
        force: true,
      },
    );
  };

  useEffect(() => {
    const onResize = () => handleTimelineResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [timeline]);

  const handleSave = async () => {
    if (!currentComposition) {
      const newComposition = await saveComposition(frameName, stateManager.getData());
      if (newComposition) {
        console.log('New frame saved:', newComposition.name);
      }
    } else {
      const updatedComposition = await updateComposition(currentComposition.id, stateManager.getData());
      if (updatedComposition) {
        console.log('Frame updated:', updatedComposition.name);
      }
    }
  };

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

  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Top Navbar */}
      <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Simple Editor</h1>
          <input
            type="text"
            value={frameName}
            onChange={(e) => setFrameName(e.target.value)}
            className="px-2 py-1 bg-muted border border-border rounded text-sm"
            placeholder="Frame name"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          >
            Save Frame
          </button>
        </div>
      </div>
      
      {/* Horizontal Media Toolbar */}
      <HorizontalMediaToolbar />
      
      {/* Floating panel - appears on click of toolbar buttons */}
      <div className="relative">
        <div className={`floating-panel fixed left-4 top-[120px] z-[9999] transition-all duration-200 ${
          isSidebarHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="bg-background border border-border/80 rounded-lg shadow-xl min-w-[280px] max-w-[320px] h-[calc(100vh-140px)] overflow-hidden">
            <div className="h-full overflow-y-auto">
              <MenuItem />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel className="relative" defaultSize={70}>
            <FloatingControl />
            <div className="flex h-full flex-1">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <CropModal />
                <Scene stateManager={stateManager} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="min-h-[50px]"
            ref={timelinePanelRef}
            defaultSize={30}
            onResize={handleTimelineResize}
          >
            <div id="timeline-container" className="h-full">
              {playerRef && <Timeline stateManager={stateManager} />}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        {/* Right Drawer - appears when needed */}
        <RightDrawer />
      </div>
    </div>
  );
};

export default SimpleEditor;
