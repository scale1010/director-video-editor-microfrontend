import { X, LassoSelect } from "lucide-react";
import { Button } from "@/components/ui/button";
import useLayoutStore from "../store/use-layout-store";
import { RightDrawerContent } from "../interfaces/layout";
import useStore from "../store/use-store";
import { useEffect, useState } from "react";
import {
  IAudio,
  IImage,
  IText,
  ITrackItem,
  ITrackItemAndDetails,
  IVideo,
} from "@designcombo/types";
import BasicText from "../control-item/basic-text";
import BasicImage from "../control-item/basic-image";
import BasicVideo from "../control-item/basic-video";
import BasicAudio from "../control-item/basic-audio";
import { CommandConsole } from "../../../console/CommandConsole";
import { subject, filter } from "@designcombo/events";
import { LAYER_PREFIX, LAYER_SELECTION } from "@designcombo/state";

export const RightDrawer = () => {
  const { 
    isRightDrawerOpen, 
    rightDrawerContent, 
    selectedItem, 
    setIsRightDrawerOpen 
  } = useLayoutStore();

  // Track selected items from timeline
  const { activeIds, trackItemsMap, transitionsMap } = useStore();
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);

  // Sync trackItem with trackItemsMap changes
  useEffect(() => {
    console.log('RightDrawer: activeIds or trackItemsMap changed:', activeIds, 'trackItemsMap keys:', Object.keys(trackItemsMap));
    
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const updatedTrackItem = trackItemsMap[id];
      console.log('RightDrawer: Looking for item with id:', id, 'Found:', updatedTrackItem);
      
      if (updatedTrackItem) {
        // Always update trackItem to reflect latest changes from trackItemsMap
        setTrackItem(updatedTrackItem);
        // Update the layout store selected item
        useLayoutStore.getState().setSelectedItem(updatedTrackItem);
        // Auto-open the drawer when an item is selected
        useLayoutStore.getState().setIsRightDrawerOpen(true);
        useLayoutStore.getState().setRightDrawerContent('properties');
        console.log('RightDrawer: Updated trackItem for:', updatedTrackItem.type);
      } else {
        console.log('RightDrawer: Item not found in trackItemsMap');
      }
    } else {
      console.log('RightDrawer: No items selected or multiple items selected');
      setTrackItem(null);
      useLayoutStore.getState().setSelectedItem(null);
      // Close the drawer completely when no item is selected
      useLayoutStore.getState().setIsRightDrawerOpen(false);
    }
  }, [activeIds, trackItemsMap, transitionsMap]);

  // Also listen to changes in the layout store's selectedItem
  useEffect(() => {
    const { selectedItem } = useLayoutStore.getState();
    if (selectedItem && !trackItem) {
      console.log('RightDrawer: selectedItem updated from store:', selectedItem);
      setTrackItem(selectedItem);
    }
  }, [trackItem]);

  // Listen to timeline selection events directly
  useEffect(() => {
    const selectionEvents = subject.pipe(
      filter(({ key }) => key.startsWith(LAYER_PREFIX)),
    );

    const selectionSubscription = selectionEvents.subscribe((obj) => {
      if (obj.key === LAYER_SELECTION) {
        console.log('RightDrawer: Received LAYER_SELECTION event:', obj.value?.payload);
        const { activeIds: eventActiveIds } = obj.value?.payload || {};
        
        if (eventActiveIds && eventActiveIds.length === 1) {
          const [id] = eventActiveIds;
          const trackItem = trackItemsMap[id];
          if (trackItem) {
            console.log('RightDrawer: Timeline selection event - opening drawer for:', trackItem.type);
            setTrackItem(trackItem);
            useLayoutStore.getState().setSelectedItem(trackItem);
            useLayoutStore.getState().setIsRightDrawerOpen(true);
            useLayoutStore.getState().setRightDrawerContent('properties');
          }
        } else {
          // Close drawer when no items are selected
          console.log('RightDrawer: Timeline selection event - no items selected, closing drawer');
          setTrackItem(null);
          useLayoutStore.getState().setSelectedItem(null);
          useLayoutStore.getState().setIsRightDrawerOpen(false);
        }
      }
    });

    return () => selectionSubscription.unsubscribe();
  }, [trackItemsMap]);

  // Add a global click listener to detect timeline item clicks
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if clicked on a timeline track item - look for more specific selectors
      const isTimelineItem = target.closest('[data-track-item]') || 
                            target.closest('.designcombo-scene-item') ||
                            target.closest('.timeline-item') ||
                            target.closest('[class*="timeline"]') ||
                            target.closest('[class*="track"]') ||
                            target.closest('[class*="item"]');
      
      if (isTimelineItem) {
        console.log('RightDrawer: Detected click on timeline/canvas item:', {
          target: target.tagName,
          className: target.className,
          dataAttributes: target.dataset,
          closest: isTimelineItem
        });
        
        // Small delay to allow the selection to update
        setTimeout(() => {
          const { activeIds } = useStore.getState();
          console.log('RightDrawer: After click, activeIds:', activeIds);
          
          if (activeIds.length === 1) {
            const [id] = activeIds;
            const trackItem = trackItemsMap[id];
            if (trackItem && !isRightDrawerOpen) {
              console.log('RightDrawer: Manually opening drawer for clicked item:', trackItem.type);
              useLayoutStore.getState().setSelectedItem(trackItem);
              useLayoutStore.getState().setIsRightDrawerOpen(true);
              useLayoutStore.getState().setRightDrawerContent('properties');
            }
          } else {
            // If no activeIds, try to find the item by looking at the clicked element
            console.log('RightDrawer: No activeIds, trying to find item from clicked element...');
            
            // Look for ID in the clicked element or its parents
            let itemId = null;
            let currentElement = target;
            
            while (currentElement && !itemId) {
              // Check for ID in various attributes
              if (currentElement.id && currentElement.id !== '') {
                itemId = currentElement.id;
              } else if (currentElement.dataset.id) {
                itemId = currentElement.dataset.id;
              } else if (currentElement.dataset.trackItem) {
                itemId = currentElement.dataset.trackItem;
              } else if (currentElement.className && typeof currentElement.className === 'string' && currentElement.className.includes('id-')) {
                // Extract ID from className like "id-123"
                const match = currentElement.className.match(/id-([a-zA-Z0-9-]+)/);
                if (match) itemId = match[1];
              }
              
              currentElement = currentElement.parentElement;
            }
            
            if (itemId && trackItemsMap[itemId]) {
              console.log('RightDrawer: Found item by element inspection:', itemId);
              const trackItem = trackItemsMap[itemId];
              useLayoutStore.getState().setSelectedItem(trackItem);
              useLayoutStore.getState().setIsRightDrawerOpen(true);
              useLayoutStore.getState().setRightDrawerContent('properties');
            }
          }
        }, 100);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isRightDrawerOpen, trackItemsMap]);

  if (!isRightDrawerOpen) return null;

  const getDrawerTitle = () => {
    if (trackItem && rightDrawerContent === 'properties') {
      return `${trackItem.type.charAt(0).toUpperCase() + trackItem.type.slice(1)} Properties`;
    }
    
    switch (rightDrawerContent) {
      case 'properties':
        return 'Properties';
      case 'controls':
        return 'Controls';
      case 'settings':
        return 'Settings';
      case 'console':
        return 'Command Console';
      default:
        return 'Properties';
    }
  };

  const getDrawerContent = () => {
    console.log('RightDrawer: getDrawerContent called with trackItem:', trackItem);
    console.log('RightDrawer: trackItem type:', trackItem?.type);
    console.log('RightDrawer: rightDrawerContent:', rightDrawerContent);
    
    // Handle console content
    if (rightDrawerContent === 'console') {
      return (
        <CommandConsole 
          isVisible={true} 
          onClose={() => setIsRightDrawerOpen(false)} 
        />
      );
    }
    
    if (!trackItem) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No item selected
        </div>
      );
    }

    switch (trackItem.type) {
      case "text":
        console.log('RightDrawer: Rendering BasicText with trackItem:', trackItem);
        return <BasicText trackItem={trackItem} />;
      case "image":
        return <BasicImage trackItem={trackItem} />;
      case "video":
        return <BasicVideo trackItem={trackItem} />;
      case "audio":
        return <BasicAudio trackItem={trackItem} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unsupported item type: {trackItem.type}
          </div>
        );
    }
  };

  return (
    <div className="fixed right-0 top-[58px] h-[calc(100vh-58px)] w-80 bg-background border-l border-border/80 shadow-2xl transform transition-transform duration-300 ease-out z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/80 bg-background flex-none">
        <h3 className="font-medium text-sm text-foreground">
          {getDrawerTitle()}
        </h3>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-background pointer-events-auto overflow-y-auto" style={{ minHeight: 0 }}>
        {getDrawerContent()}
      </div>
    </div>
  );
};
