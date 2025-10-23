import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import AutosizeInput from "@/components/ui/autosize-input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { MenuIcon, ShareIcon, Upload, ProportionsIcon, Save, Plus, ChevronDown, CloudUpload } from "lucide-react";
import StateManager from "@designcombo/state";
import { dispatch as emitEvent } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
import useLayoutStore from "./store/use-layout-store";
import { useDownloadState } from "./store/use-download-state";
import { generateId } from "@designcombo/timeline";
import { IDesign } from "@designcombo/types";
import useStore from "./store/use-store";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO, ADD_IMAGE, ADD_TEXT, ADD_VIDEO } from "@designcombo/state";
import { SaveModal } from "@/components/SaveModal";
import { LoadDropdown } from "@/components/LoadDropdown";
import { useCompositionStore } from "./store/use-composition-store";
import { generateDefaultWorkspaceName, extractCreativeWord } from "../../utils/workspaceName";
import { WorkspaceIcon } from "@/components/WorkspaceIcon";
import { CheckCircle, Clock, AlertCircle, Wifi, WifiOff, Settings, Terminal } from "lucide-react";
// import { AutosaveSettings } from "@/components/AutosaveSettings";

export default function Navbar({
  user,
  stateManager,
  setProjectName,
  projectName,
  showMenuButton = true,
  showShareButton = true,
  showDiscordButton = true,
  autosave,
}: {
  user: null;
  stateManager: StateManager;
  setProjectName: (name: string) => void;
  projectName: string;
  showMenuButton?: boolean;
  showShareButton?: boolean;
  showDiscordButton?: boolean;
  autosave?: any;
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showAutosaveSettings, setShowAutosaveSettings] = useState(false);
  const [, setUpdateTrigger] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Console toggle state
  const { isRightDrawerOpen, rightDrawerContent, setIsRightDrawerOpen, setRightDrawerContent } = useLayoutStore();

  // Helper function to format time ago
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  const { 
    saveComposition, 
    updateComposition,
    autosaveComposition,
    loadComposition, 
    currentComposition, 
    hasUnsavedChanges,
    setCurrentComposition,
    markUnsavedChanges,
    isLoading
  } = useCompositionStore();
  const [title, setTitle] = useState(projectName || generateDefaultWorkspaceName());
  
  // Debug: Log when projectName changes
  useEffect(() => {
    console.log('[Navbar] projectName changed to:', projectName);
    console.log('[Navbar] current title:', title);
    setTitle(projectName);
  }, [projectName]);

  // Update timestamp display every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const handleCreateProject = async () => {};

  // Console toggle handler
  const handleConsoleToggle = () => {
    if (isRightDrawerOpen && rightDrawerContent === 'console') {
      setIsRightDrawerOpen(false);
    } else {
      setRightDrawerContent('console');
      setIsRightDrawerOpen(true);
    }
  };

  // Create a debounced function for setting the project name
  const debouncedSetProjectName = useCallback(
    debounce((name: string) => {
      console.log("Debounced setProjectName:", name);
      setProjectName(name);
    }, 2000), // 2 seconds delay
    [],
  );

  // Update the debounced function whenever the title changes
  useEffect(() => {
    debouncedSetProjectName(title);
  }, [title, debouncedSetProjectName]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    // Focus input after state update
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    // Save the workspace name when focus is lost
    if (title && title !== projectName) {
      console.log('[Navbar] Saving workspace name on blur:', title);
      setProjectName(title);
      await handleSave();
    }
  };

  const handleTitleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Save the workspace name when Enter is pressed
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      // Cancel editing and revert to original name
      setTitle(projectName);
      setIsEditingTitle(false);
      e.currentTarget.blur();
    }
  };

  // Handle Save (update existing or create new)
  const handleSave = async () => {
    console.log('[Navbar] handleSave called', { currentComposition, title });
    
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    
    try {
      if (currentComposition) {
        // Update existing composition
        console.log('[Navbar] Updating existing composition:', currentComposition.id);
        const result = await updateComposition(currentComposition.id, data);
        if (result) {
          console.log('[Navbar] Composition updated successfully:', result);
        } else {
          console.error('[Navbar] Update returned null');
        }
      } else {
        // No current composition, save with current workspace name
        const workspaceName = title || generateDefaultWorkspaceName();
        console.log('[Navbar] Creating new composition with name:', workspaceName);
        const result = await saveComposition(workspaceName, data);
        if (result) {
          setCurrentComposition(result);
          setProjectName(workspaceName);
          setTitle(workspaceName);
          console.log('[Navbar] Composition saved successfully:', result);
        } else {
          console.error('[Navbar] Save returned null');
        }
      }
    } catch (error) {
      console.error('[Navbar] Save failed:', error);
    }
  };

  // Handle Save As (always create new)
  const handleSaveAs = async (name: string) => {
    console.log('[Save As] Starting save as with name:', name);
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };
    
    console.log('[Save As] Data to save:', data);
    const result = await saveComposition(name, data);
    console.log('[Save As] Result:', result);
    
    if (result) {
      setCurrentComposition(result);
      setProjectName(name);
      setTitle(name);
      console.log('[Save As] Composition saved as:', result);
    } else {
      console.error('[Save As] Failed to save composition');
    }
  };

  const handleLoad = async (composition: any) => {
    // Load the saved data and validate timing values
    const payload = composition.design;
    console.log('Loading composition payload:', payload);
    
    // Validate and fix timing values in trackItemsMap
    const validatedTrackItemsMap = { ...payload.trackItemsMap };
    Object.keys(validatedTrackItemsMap).forEach(itemId => {
      const item = validatedTrackItemsMap[itemId];
      console.log(`Validating item ${itemId}:`, item);
      
      if (item && item.display) {
        // Ensure display.from and display.to are valid numbers
        if (typeof item.display.from !== 'number' || isNaN(item.display.from)) {
          console.log(`Fixing display.from for ${itemId}: ${item.display.from} -> 0`);
          item.display.from = 0;
        }
        if (typeof item.display.to !== 'number' || isNaN(item.display.to)) {
          console.log(`Fixing display.to for ${itemId}: ${item.display.to} -> ${item.display.from + 5000}`);
          item.display.to = item.display.from + 5000; // Default 5 seconds
        }
        
        // Ensure trim values are valid if they exist
        if (item.trim) {
          if (typeof item.trim.from !== 'number' || isNaN(item.trim.from)) {
            console.log(`Fixing trim.from for ${itemId}: ${item.trim.from} -> 0`);
            item.trim.from = 0;
          }
          if (typeof item.trim.to !== 'number' || isNaN(item.trim.to)) {
            console.log(`Fixing trim.to for ${itemId}: ${item.trim.to} -> ${item.duration || 5000}`);
            item.trim.to = item.duration || 5000;
          }
        }
        
        // Ensure duration is valid
        if (typeof item.duration !== 'number' || isNaN(item.duration)) {
          console.log(`Fixing duration for ${itemId}: ${item.duration} -> ${item.display.to - item.display.from}`);
          item.duration = item.display.to - item.display.from;
        }
      }
    });
    
    console.log('Validated trackItemsMap:', validatedTrackItemsMap);
    
    // Update StateManager first
    stateManager.updateState({
      size: payload.size || { width: 1080, height: 1920 },
      fps: payload.fps || 30,
      duration: payload.duration || 5000,
      background: payload.background || { type: 'color', value: 'transparent' },
      scale: payload.scale || { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: payload.tracks || [],
      trackItemIds: payload.trackItemIds || [],
      trackItemsMap: validatedTrackItemsMap,
      transitionIds: payload.transitionIds || [],
      transitionsMap: payload.transitionsMap || {},
      structure: payload.structure || [],
      activeIds: payload.activeIds || [],
    });
    
    // Update Zustand store with the validated data
    const { setState } = useStore.getState();
    setState({
      size: payload.size || { width: 1080, height: 1920 },
      fps: payload.fps || 30,
      duration: payload.duration || 5000,
      background: payload.background || { type: 'color', value: 'transparent' },
      scale: payload.scale || { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: payload.tracks || [],
      trackItemIds: payload.trackItemIds || [],
      trackItemsMap: validatedTrackItemsMap,
      transitionIds: payload.transitionIds || [],
      transitionsMap: payload.transitionsMap || {},
      structure: payload.structure || [],
      activeIds: payload.activeIds || [],
      scroll: { left: 0, top: 0 },
    });

    // Set current composition and mark as clean
    setCurrentComposition(composition);

    // Add items through the event API so CanvasTimeline reflects them
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (let i = 0; i < payload.trackItemIds.length; i++) {
      const itemId = payload.trackItemIds[i];
      const item = validatedTrackItemsMap[itemId] as any;
      if (!item) continue;
      
      const base = {
        id: item.id,
        type: item.type,
        details: item.details,
        metadata: item.metadata,
        trim: item.trim,
        display: item.display,
        playbackRate: item.playbackRate,
        duration: item.duration,
        name: item.name,
      } as any;

      if (item.type === "video") {
        emitEvent(ADD_VIDEO, { payload: base, options: { resourceId: "main", scaleMode: "fit" } });
      } else if (item.type === "audio") {
        const audioPayload = {
          id: item.id,
          type: item.type,
          name: item.name,
          display: item.display,
          trim: item.trim,
          playbackRate: item.playbackRate,
          duration: item.duration,
          details: item.details,
          metadata: item.metadata,
        };
        emitEvent(ADD_AUDIO, { payload: audioPayload, options: {} });
      } else if (item.type === "image") {
        emitEvent(ADD_IMAGE, { payload: base, options: { resourceId: "image", scaleMode: "fit" } });
      } else if (item.type === "text") {
        const textPayload = {
          id: item.id,
          type: item.type,
          display: item.display,
          details: item.details,
          name: item.name,
        };
        emitEvent(ADD_TEXT, { payload: textPayload, options: {} });
      }
      
      if (i < payload.trackItemIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Force timeline refresh
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new Event('resize'));
      }
    }, 200);
  };

  const handleNewProject = () => {
    // Reset project name with new default format
    setProjectName(generateDefaultWorkspaceName());
    
    // Clear current composition from store
    const { createNewWorkspace } = useCompositionStore.getState();
    createNewWorkspace();
    
    // Clear StateManager state first
    stateManager.updateState({
      size: { width: 1080, height: 1920 },
      fps: 30,
      duration: 5000,
      background: { type: 'color', value: 'transparent' },
      scale: { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: [],
      trackItemIds: [],
      trackItemsMap: {},
      transitionIds: [],
      transitionsMap: {},
      structure: [],
      activeIds: [],
    });
    
    // Reset the Zustand store to initial state
    const { setState } = useStore.getState();
    setState({
      size: { width: 1080, height: 1920 },
      fps: 30,
      duration: 5000,
      background: { type: 'color', value: 'transparent' },
      scale: { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
      tracks: [],
      trackItemIds: [],
      trackItemsMap: {},
      transitionIds: [],
      transitionsMap: {},
      structure: [],
      activeIds: [],
      scroll: { left: 0, top: 0 },
    });
    
    // Force timeline refresh
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new Event('resize'));
      }
    }, 200);
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 320px",
        }}
        className="bg-sidebar pointer-events-none flex h-[58px] items-center px-2"
      >


      <div className="flex items-center gap-2">
        {showMenuButton && (
          <div className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-md text-zinc-200">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hover:bg-background-subtle flex h-8 w-8 items-center justify-center">
                  <MenuIcon className="h-5 w-5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[300] w-56 p-2" align="start">
                <DropdownMenuItem
                  onClick={handleCreateProject}
                  className="cursor-pointer text-muted-foreground"
                >
                  New project
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                  My projects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCreateProject}
                  className="cursor-pointer text-muted-foreground"
                >
                  Duplicate project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 px-2.5">
          {/* New Workspace Button */}
          <Button
            onClick={handleNewProject}
            className="flex h-8 w-8 items-center justify-center border border-border"
            variant="outline"
            size="icon"
            title="New Workspace"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          {/* Open Workspace Button */}
          <LoadDropdown onLoad={handleLoad} onNewProject={handleNewProject} />
          
          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="flex h-8 w-8 items-center justify-center border border-border"
            variant="outline"
            size="icon"
            title="Save"
          >
            <CloudUpload className="h-4 w-4" />
          </Button>
          
          {/* Aspect Ratio Button */}
          <ResizeVideo />
        </div>
        
        {/* Undo/Redo buttons - hidden for now */}
        {/* <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-1 rounded-md px-2">
          <Button
            onClick={handleUndo}
            className="text-muted-foreground hover:text-zinc-200 transition-colors"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={18} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground hover:text-zinc-200 transition-colors"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={18} />
          </Button>
        </div> */}
      </div>

      {/* Center section - Workspace Name with Inline Edit */}
      <div className="flex h-14 items-center justify-center">
        <div className="pointer-events-auto flex h-12 items-center gap-2">
          {/* Workspace Icon */}
          {!isEditingTitle && title && (
            <WorkspaceIcon 
              word={extractCreativeWord(title)} 
              className="flex-shrink-0"
            />
          )}
          
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="bg-transparent border-none outline-none text-center text-sm font-medium text-foreground px-2 min-w-[200px] focus:bg-background/10 rounded"
              placeholder="Workspace name"
            />
          ) : (
            <button
              onClick={handleTitleClick}
              className="text-sm font-medium text-foreground hover:bg-background/10 px-2 py-1 rounded transition-colors cursor-text"
              title="Click to edit workspace name"
            >
              {title || "Untitled Workspace"}
            </button>
          )}
        </div>
      </div>

      {/* Right section - Other buttons */}
      <div className="flex h-14 items-center justify-end gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5">
          {/* Last Saved Timestamp */}
          {autosave && autosave.lastAutosaveAt && (
            <div className="text-xs text-muted-foreground">
              Saved {formatTimeAgo(autosave.lastAutosaveAt)}
            </div>
          )}
          
          {/* Autosave Status Indicator */}
          {autosave && (
            <div className="flex items-center gap-2">
              <AutosaveIndicator autosave={autosave} />
            </div>
          )}
          
          {showShareButton && (
            <Button
              className="flex h-8 gap-1 border border-border"
              variant="outline"
            >
              <ShareIcon width={18} /> Share
            </Button>
          )}
          
          {/* Console Toggle Button */}
          <Button
            onClick={handleConsoleToggle}
            className={`flex h-8 w-8 items-center justify-center border border-border transition-all duration-200 ${
              isRightDrawerOpen && rightDrawerContent === 'console' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'hover:bg-background-subtle'
            }`}
            variant="outline"
            size="icon"
            title="Toggle Command Console"
          >
            <Terminal className="h-4 w-4" />
          </Button>

          {/* Figma Editor Button */}
          <Button
            onClick={() => window.location.href = '/figma'}
            className="flex h-8 w-8 items-center justify-center border border-border transition-all duration-200 hover:bg-background-subtle"
            variant="outline"
            size="icon"
            title="Open Figma-style Multi-Frame Editor"
          >
            <span className="text-sm">🎨</span>
          </Button>
          
          <ExportButton stateManager={stateManager} />
          
          {showDiscordButton && (
            <Button
              className="flex h-8 gap-1 border border-border"
              variant="default"
              onClick={() => {
                window.open("https://discord.gg/jrZs3wZyM5", "_blank");
              }}
            >
              Discord
            </Button>
          )}
        </div>
      </div>
      </div>
      
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />

      <SaveModal
        isOpen={showSaveAsModal}
        onClose={() => setShowSaveAsModal(false)}
        onSave={handleSaveAs}
        isLoading={isLoading}
        title="Switch Workspace"
        placeholder="Enter workspace name"
      />

      {/* Autosave Settings Modal - Temporarily disabled */}
      {/* {showAutosaveSettings && autosave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative">
            <AutosaveSettings 
              autosave={autosave}
              onClose={() => setShowAutosaveSettings(false)}
            />
          </div>
        </div>
      )} */}
    </>
  );
}

// Autosave Status Indicator Component
const AutosaveIndicator = ({ autosave }: { autosave: any }) => {
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusIcon = () => {
    if (autosave.isAutosaving) {
      return <Clock className="h-3 w-3 text-blue-400 animate-pulse" />;
    }
    
    if (autosave.error) {
      return <AlertCircle className="h-3 w-3 text-red-400" />;
    }
    
    if (autosave.lastAutosaveAt) {
      return <CheckCircle className="h-3 w-3 text-green-400" />;
    }
    
    return <WifiOff className="h-3 w-3 text-gray-400" />;
  };

  const getStatusText = () => {
    if (autosave.isAutosaving) {
      return 'Saving...';
    }
    
    if (autosave.error) {
      return 'Save failed';
    }
    
    if (autosave.lastAutosaveAt) {
      return formatTimeAgo(autosave.lastAutosaveAt);
    }
    
    return 'Not saved';
  };

  const getTooltipText = () => {
    if (autosave.isAutosaving) {
      return 'Auto-saving your changes...';
    }
    
    if (autosave.error) {
      return `Autosave failed: ${autosave.error}`;
    }
    
    if (autosave.lastAutosaveAt) {
      return `Last saved: ${autosave.lastAutosaveAt.toLocaleString()}`;
    }
    
    return 'Changes will be auto-saved';
  };

  return (
    <div 
      className="flex items-center gap-1.5 text-xs text-gray-400 cursor-help"
      title={getTooltipText()}
    >
      {getStatusIcon()}
      <span className="hidden sm:inline">{getStatusText()}</span>
    </div>
  );
};

const ExportButton = ({ stateManager }: { stateManager: StateManager }) => {
  const { actions, exporting } = useDownloadState();

  // Debug: Log the exporting state
  console.log('ExportButton render - exporting state:', exporting);
  console.log('ExportButton render - actions:', actions);

  const handleExport = () => {
    console.log('ExportButton clicked - starting export');
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    console.log('🔍 StateManager.getState():', stateManager.getState());
    console.log('🔍 StateManager trackItemsMap:', (stateManager.getState() as any).trackItemsMap);
    
    // Log a specific audio item if it exists
    const trackItems = (stateManager.getState() as any).trackItemsMap || {};
    const audioItems = Object.entries(trackItems).filter(([id, item]: [string, any]) => item?.type === 'audio');
    if (audioItems.length > 0) {
      const [audioId, audioItem] = audioItems[0];
      const typedAudioItem = audioItem as any;
      console.log(`🔍 Sample audio item ${audioId}:`, {
        item: audioItem,
        hasTrim: !!typedAudioItem?.trim,
        trim: typedAudioItem?.trim,
        hasPlaybackRate: typedAudioItem?.playbackRate !== undefined,
        playbackRate: typedAudioItem?.playbackRate,
        keys: Object.keys(audioItem || {}),
        enumerableKeys: Object.getOwnPropertyNames(audioItem || {}),
        prototype: Object.getPrototypeOf(audioItem),
        isClassInstance: audioItem?.constructor?.name !== 'Object',
      });
    }

    actions.setState({ payload: data });
    actions.startExport();
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="flex h-8 gap-1 border border-border transition-all duration-200"
      variant="outline"
      style={{
        backgroundColor: exporting 
          ? 'rgba(156, 163, 175, 0.8)' // gray-400/80 when disabled
          : 'rgba(255, 255, 255, 0.9)', // white/90
        color: exporting ? 'white' : 'black',
        borderColor: exporting 
          ? 'rgb(156, 163, 175)' // gray-400 when disabled
          : 'rgb(255, 255, 255)',
        cursor: exporting ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!exporting) {
          e.currentTarget.style.backgroundColor = 'rgb(255, 255, 255)'; // white
        }
      }}
      onMouseLeave={(e) => {
        if (!exporting) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // white/90
        }
      }}
    >
      {exporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          RENDERING...
        </>
      ) : (
        <>
          <Upload width={18} /> RENDER
        </>
      )}
    </Button>
  );
};


interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
  description: string;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    description: "YouTube ads",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    description: "TikTok, YouTube Shorts",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    description: "Instagram, Facebook posts",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
];

const ResizeVideo = () => {
  const [open, setOpen] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState("9:16");
  
  const handleResize = (options: ResizeValue) => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        ...options,
      },
    });
    // Update current aspect ratio display
    setCurrentAspectRatio(options.name);
    // Close the popover after selection
    setOpen(false);
  };
  
  // Get the current aspect ratio option to display its icon
  const currentOption = RESIZE_OPTIONS.find(option => option.value.name === currentAspectRatio) || RESIZE_OPTIONS[1]; // Default to 9:16
  const CurrentIcon = Icons[currentOption.icon as "text"];
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          className="flex h-8 w-8 items-center justify-center border border-border" 
          variant="outline"
          size="icon"
          title="Aspect Ratio"
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[250] w-60 px-2.5 py-3">
        <div className="text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
              description={option.description}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  description,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-zinc-50/10"
    >
      <div className="w-8 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};



