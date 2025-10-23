import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import BasicText from '../../editor/control-item/basic-text';
import BasicImage from '../../editor/control-item/basic-image';
import BasicVideo from '../../editor/control-item/basic-video';
import BasicAudio from '../../editor/control-item/basic-audio';
import { ITrackItem } from '@designcombo/types';
import useStore from '../../editor/store/use-store';

interface FramePropertiesPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const FramePropertiesPanel: React.FC<FramePropertiesPanelProps> = ({
  isVisible,
  onClose
}) => {
  const { activeIds, trackItemsMap } = useStore();
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);

  console.log('FramePropertiesPanel: Component rendered with isVisible:', isVisible);
  console.log('FramePropertiesPanel: activeIds:', activeIds);
  console.log('FramePropertiesPanel: trackItemsMap keys:', Object.keys(trackItemsMap));

  // Update trackItem when selection changes
  useEffect(() => {
    console.log('FramePropertiesPanel: activeIds changed:', activeIds);
    console.log('FramePropertiesPanel: trackItemsMap keys:', Object.keys(trackItemsMap));
    
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const item = trackItemsMap[id];
      console.log('FramePropertiesPanel: Selected item:', item);
      
      if (item) {
        setTrackItem(item);
      } else {
        console.log('FramePropertiesPanel: Item not found in trackItemsMap');
        setTrackItem(null);
      }
    } else {
      console.log('FramePropertiesPanel: No items selected or multiple items selected');
      setTrackItem(null);
    }
  }, [activeIds, trackItemsMap]);

  const getPanelTitle = () => {
    if (!trackItem) return 'Properties';
    
    switch (trackItem.type) {
      case 'text':
        return 'Text Properties';
      case 'image':
        return 'Image Properties';
      case 'video':
        return 'Video Properties';
      case 'audio':
        return 'Audio Properties';
      default:
        return 'Properties';
    }
  };

  const getPanelContent = () => {
    if (!trackItem) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground p-4">
          <div className="text-center">
            <p className="text-sm">No item selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on an item in the timeline or canvas to edit its properties
            </p>
          </div>
        </div>
      );
    }

    console.log('FramePropertiesPanel: Rendering properties for:', trackItem.type);

    switch (trackItem.type) {
      case 'text':
        return <BasicText trackItem={trackItem} />;
      case 'image':
        return <BasicImage trackItem={trackItem} />;
      case 'video':
        return <BasicVideo trackItem={trackItem} />;
      case 'audio':
        return <BasicAudio trackItem={trackItem} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4">
            <div className="text-center">
              <p className="text-sm">Unsupported item type</p>
              <p className="text-xs text-muted-foreground mt-1">
                Type: {trackItem.type}
              </p>
            </div>
          </div>
        );
    }
  };

  // Temporary: Always show panel for debugging
  console.log('FramePropertiesPanel: isVisible check:', isVisible);
  
  if (!isVisible) {
    console.log('FramePropertiesPanel: Panel not visible, returning null');
    return null;
  }
  
  console.log('FramePropertiesPanel: Panel is visible, rendering');

  return (
    <div className="fixed right-0 top-[58px] h-[calc(100vh-58px)] w-80 bg-zinc-900 border-l border-border/80 shadow-2xl transform transition-transform duration-300 ease-out z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/80 bg-zinc-900 flex-none">
        <h3 className="font-medium text-sm text-white">
          {getPanelTitle()}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-white transition-colors"
          aria-label="Close properties panel"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-zinc-900 pointer-events-auto overflow-hidden">
        <ScrollArea className="h-full">
          {getPanelContent()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default FramePropertiesPanel;
