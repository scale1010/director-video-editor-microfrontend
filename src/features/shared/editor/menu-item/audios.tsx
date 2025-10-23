import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AUDIOS } from "../data/audio";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO } from "@designcombo/state";
import { IAudio } from "@designcombo/types";
import { Music, Plus } from "lucide-react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import React, { useState } from "react";
import { generateId } from "@designcombo/timeline";
import { useAudiosData } from "../data/use-audios-data";

// Helper function to format generation type names for display
const formatGenerationTypeName = (generationType: string): string => {
  const typeMap: Record<string, string> = {
    'music': 'Music',
    'voice': 'Voice',
    'unknown': 'All Audio'
  };
  
  return typeMap[generationType] || generationType
    .charAt(0).toUpperCase() + generationType.slice(1);
};

export const Audios = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { audios, audiosByGenerationType, generationTypes, loading, error } = useAudiosData();

  const handleAddAudio = (payload: Partial<IAudio>) => {
    payload.id = generateId();
    dispatch(ADD_AUDIO, {
      payload,
      options: {},
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
          Audios
          <span className="ml-2 text-xs text-zinc-400">(Loading...)</span>
        </div>
        <ScrollArea>
          <div className="flex flex-col px-2 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <AudioCardSkeleton key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Note: We don't early return on error anymore
  // Instead, we show the error badge but still display fallback audio items
  // This matches the behavior of Videos and Images components

  // If we have generation types, show tabs; otherwise show all audios
  if (generationTypes.length > 1) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
          Audios
          {error && (
            <span className="ml-2 text-xs text-red-400">(API Error)</span>
          )}
        </div>
        <Tabs defaultValue={generationTypes[0]} className="flex flex-1 flex-col">
          <div className="px-4 mb-3">
            <TabsList className="!inline-flex !w-full bg-muted/30 p-1 rounded-md h-8">
              {generationTypes.map((generationType) => (
                <TabsTrigger 
                  key={generationType} 
                  value={generationType}
                  className="text-xs font-medium px-3 py-1 data-[state=active]:bg-background/80 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground/70 transition-all duration-200 rounded-sm flex-1"
                >
                  {formatGenerationTypeName(generationType)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {generationTypes.map((generationType) => (
            <TabsContent key={generationType} value={generationType} className="flex-1 mt-0">
              <ScrollArea>
                <div className="flex flex-col px-2">
                  {audiosByGenerationType[generationType]?.map((audio, index) => (
                    <AudioItem
                      key={`${generationType}-${index}`}
                      shouldDisplayPreview={!isDraggingOverTimeline}
                      handleAddAudio={handleAddAudio}
                      audio={audio}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Fallback: show all audios without tabs
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
        Audios
        {error && (
          <span className="ml-2 text-xs text-red-400">(API Error)</span>
        )}
      </div>
      <ScrollArea>
        <div className="flex flex-col px-2">
          {audios.map((audio, index) => {
            return (
              <AudioItem
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddAudio={handleAddAudio}
                audio={audio}
                key={index}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const AudioItem = ({
  handleAddAudio,
  audio,
  shouldDisplayPreview,
}: {
  handleAddAudio: (payload: Partial<IAudio>) => void;
  audio: Partial<IAudio>;
  shouldDisplayPreview: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const style = React.useMemo(
    () => ({
      backgroundImage: `url(https://cdn.designcombo.dev/thumbnails/music-preview.png)`,
      backgroundSize: "cover",
      width: "70px",
      height: "70px",
    }),
    [],
  );

  const handleAudioAdd = async () => {
    if (isAdding) return; // Prevent multiple clicks
    
    setIsAdding(true);
    try {
      // Simulate a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 400));
      handleAddAudio(audio);
    } finally {
      // Keep loading state for a bit longer to show completion
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  return (
    <Draggable
      data={{
        ...audio,
        type: "audio",
      }}
      renderCustomPreview={<div style={style} />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        draggable={false}
        onClick={handleAudioAdd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr",
        }}
        className={`relative flex cursor-pointer gap-4 px-2 py-1 text-sm hover:bg-zinc-800/70 transition-all duration-200 ${
          isAdding ? 'opacity-80 scale-98 animate-pulse' : ''
        }`}
      >
        <div className="flex h-12 items-center justify-center bg-zinc-800">
          <Music width={16} />
        </div>
        <div className="flex flex-col justify-center">
          <div>{audio.name}</div>
          <div className="text-zinc-400">{audio.metadata?.author}</div>
        </div>

        {/* Plus icon overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded transition-all duration-200">
            <Plus className="w-6 h-6 text-white/80" />
          </div>
        )}

        {/* Loading overlay when adding */}
        {isAdding && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </Draggable>
  );
};

const AudioCardSkeleton = () => {
  return (
    <div className="flex gap-4 px-2 py-1 animate-pulse">
      <div className="w-12 h-12 bg-zinc-700 rounded"></div>
      <div className="flex flex-col justify-center gap-2 flex-1">
        <div className="h-4 bg-zinc-700 rounded w-24"></div>
        <div className="h-3 bg-zinc-700 rounded w-20"></div>
      </div>
    </div>
  );
};
