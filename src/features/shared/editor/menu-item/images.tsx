import { ScrollArea } from "@/components/ui/scroll-area";
import { IMAGES } from "../data/images";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import Draggable from "@/components/shared/draggable";
import { IImage } from "@designcombo/types";
import React, { useState } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { ADD_IMAGE } from "@designcombo/state";
import { dispatchWithLogging } from "../../../../commands/DispatchWrapper";
import { useImagesData } from "../data/use-images-data";
import { Plus } from "lucide-react";

// Skeleton loader component for image cards
const ImageCardSkeleton = () => (
  <div className="w-full aspect-square bg-muted rounded-md animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 rounded-md flex items-center justify-center">
      <div className="w-6 h-6 bg-muted-foreground/20 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export const Images = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { images, loading, error } = useImagesData();

  const handleAddImage = (payload: Partial<IImage>) => {
    const id = generateId();
    dispatchWithLogging(ADD_IMAGE, {
      id,
      details: {
        src: payload.details?.src,
      },
      metadata: {
        previewUrl: (payload as any)?.metadata?.previewUrl,
      },
    }, {
      resourceId: "image",
      scaleMode: "fit",
    }, 'ui', 'Images');
  };

  // Show skeleton loaders while API is loading
  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
          Photos
          <span className="ml-2 text-xs text-zinc-400">(Loading...)</span>
        </div>
        <ScrollArea>
          <div className="masonry-sm px-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ImageCardSkeleton key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
        Photos
        {error && (
          <span className="ml-2 text-xs text-red-400">(API Error)</span>
        )}
      </div>
      <ScrollArea>
        <div className="masonry-sm px-4">
          {images.map((image, index) => {
            return (
              <ImageItem
                key={index}
                image={image}
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddImage={handleAddImage}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const ImageItem = ({
  handleAddImage,
  image,
  shouldDisplayPreview,
}: {
  handleAddImage: (payload: Partial<IImage>) => void;
  image: Partial<IImage>;
  shouldDisplayPreview: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(${image.preview})`,
      backgroundSize: "cover",
      width: "80px",
      height: "80px",
    }),
    [image.preview],
  );

  const handleImageAdd = async (payload: Partial<IImage>) => {
    if (isAdding) return; // Prevent multiple clicks
    
    setIsAdding(true);
    try {
      // Simulate a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 400));
      handleAddImage(payload);
    } finally {
      // Keep loading state for a bit longer to show completion
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  return (
    <Draggable
      data={{
        ...image,
        type: "image",
        metadata: { previewUrl: image.preview },
      }}
      renderCustomPreview={<div style={style} />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() =>
          handleImageAdd({
            details: {
              src: image.details!.src,
            },
            metadata: { previewUrl: image.preview },
          } as unknown as Partial<IImage>)
        }
        className={`relative flex w-full items-center justify-center overflow-hidden bg-background pb-2 group cursor-pointer transition-all duration-300 ${
          isAdding ? 'opacity-80 scale-98 animate-pulse' : ''
        }`}
      >
        <img
          draggable={false}
          src={image.preview}
          className="h-full w-full rounded-md object-cover transition-transform duration-200 group-hover:scale-105"
          alt="image"
        />
        
        {/* Plus Icon Overlay */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            isHovered && !isAdding ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Plus className="w-8 h-8 text-white/70 drop-shadow-lg" />
        </div>

        {/* Loading Overlay */}
        {isAdding && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </Draggable>
  );
};
