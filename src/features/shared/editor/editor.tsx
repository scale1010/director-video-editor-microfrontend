"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import StateManager from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import CropModal from "./crop-modal/crop-modal";
import HorizontalMediaToolbar from "./horizontal-media-toolbar";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import useLayoutStore from "./store/use-layout-store";
import { useCompositionStore } from "./store/use-composition-store";
import { RightDrawer } from "./components";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { generateDefaultWorkspaceName } from "../../utils/workspaceName";
import { useAutosave } from "../../hooks/useAutosave";

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

const Editor = () => {
  const [projectName, setProjectName] = useState<string>(generateDefaultWorkspaceName());
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { timeline, playerRef } = useStore();
  const { isSidebarHovered, setIsSidebarHovered } = useLayoutStore();

  useTimelineEvents();
  useKeyboardShortcuts();
  
  // Initialize autosave
  const autosave = useAutosave(stateManager, {
    debounceDelay: 2000, // 2 seconds for localStorage
    periodicInterval: 30000, // 30 seconds for backend
    enableLocalStorage: true,
    enableBackendAutosave: true,
  });
  
  // Debug hover state changes
  useEffect(() => {
    console.log('Hover state changed:', isSidebarHovered);
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

  const { setCompactFonts, setFonts } = useDataState();

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

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        projectName={projectName}
        user={null}
        stateManager={stateManager}
        setProjectName={setProjectName}
        showMenuButton={false}
        showShareButton={false}
        showDiscordButton={false}
        autosave={autosave}
      />
      
      {/* Horizontal Media Toolbar */}
      <HorizontalMediaToolbar />
      
      {/* Floating panel - appears on click of toolbar buttons */}
      <div className="relative">
        <div className={`floating-panel fixed left-4 top-[120px] z-[9999] transition-all duration-200 ${
          isSidebarHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="bg-zinc-900 border border-border/80 rounded-lg shadow-xl min-w-[280px] max-w-[320px] h-[calc(100vh-140px)] overflow-hidden">
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
            {playerRef && <Timeline stateManager={stateManager} />}
          </ResizablePanel>
        </ResizablePanelGroup>
        
        {/* Right Drawer - appears when needed */}
        <RightDrawer />
      </div>
    </div>
  );
};

export default Editor;
