import useLayoutStore from "./store/use-layout-store";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IMenuItem } from "./interfaces/layout";

export default function HorizontalMediaToolbar() {
  const { setActiveMenuItem, setShowMenuItem, activeMenuItem, showMenuItem, setIsSidebarHovered } =
    useLayoutStore();

  const handleIconClick = (menuItem: IMenuItem) => {
    setActiveMenuItem(menuItem);
    setShowMenuItem(true);
    setIsSidebarHovered(true);
  };

  return (
    <div className="bg-background border-b border-border/20 px-4 py-2">
      <div className="flex items-center gap-4">
        {/* Add Label */}
        <span className="text-sm font-medium text-foreground/80">Add</span>
        
        {/* Media Type Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleIconClick("videos")}
            className={cn(
              "h-8 px-3 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2",
              showMenuItem && activeMenuItem === "videos"
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md",
            )}
            variant={"ghost"}
            size={"sm"}
          >
            <Icons.video width={16} />
            Video
          </Button>

          <Button
            onClick={() => handleIconClick("images")}
            className={cn(
              "h-8 px-3 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2",
              showMenuItem && activeMenuItem === "images"
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md",
            )}
            variant={"ghost"}
            size={"sm"}
          >
            <Icons.image width={16} />
            Image
          </Button>

          <Button
            onClick={() => handleIconClick("audios")}
            className={cn(
              "h-8 px-3 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2",
              showMenuItem && activeMenuItem === "audios"
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md",
            )}
            variant={"ghost"}
            size={"sm"}
          >
            <Icons.audio width={16} />
            Audio
          </Button>

          <Button
            onClick={() => handleIconClick("texts")}
            className={cn(
              "h-8 px-3 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2",
              showMenuItem && activeMenuItem === "texts"
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md",
            )}
            variant={"ghost"}
            size={"sm"}
          >
            <Icons.text width={16} />
            Text
          </Button>
        </div>
      </div>
    </div>
  );
}
