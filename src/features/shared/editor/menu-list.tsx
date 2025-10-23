import useLayoutStore from "./store/use-layout-store";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IMenuItem } from "./interfaces/layout";

export default function MenuList() {
  const { setActiveMenuItem, setShowMenuItem, activeMenuItem, showMenuItem, setIsSidebarHovered } =
    useLayoutStore();

  const handleIconClick = (menuItem: IMenuItem) => {
    setActiveMenuItem(menuItem);
    setShowMenuItem(true);
    setIsSidebarHovered(true);
  };

  return (
    <div className="sidebar-container bg-sidebar flex flex-none">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
        <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-800/40 p-2 backdrop-blur-sm border border-zinc-700/20 shadow-lg mr-2 transition-all duration-300 ease-out hover:bg-zinc-800/60 hover:shadow-xl">
          <Button
            onClick={() => handleIconClick("videos")}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95",
              showMenuItem && activeMenuItem === "videos"
                ? "bg-white text-black shadow-md shadow-white/25 scale-105"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/40 hover:shadow-md",
            )}
            variant={"ghost"}
            size={"icon"}
          >
            <Icons.video width={16} />
          </Button>

          <Button
            onClick={() => handleIconClick("images")}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95",
              showMenuItem && activeMenuItem === "images"
                ? "bg-white text-black shadow-md shadow-white/25 scale-105"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/40 hover:shadow-md",
            )}
            variant={"ghost"}
            size={"icon"}
          >
            <Icons.image width={16} />
          </Button>

          <Button
            onClick={() => handleIconClick("audios")}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95",
              showMenuItem && activeMenuItem === "audios"
                ? "bg-white text-black shadow-md shadow-white/25 scale-105"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/40 hover:shadow-md",
            )}
            variant={"ghost"}
            size={"icon"}
          >
            <Icons.audio width={16} />
          </Button>

          <Button
            onClick={() => handleIconClick("texts")}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-300 ease-out hover:scale-110 active:scale-95",
              showMenuItem && activeMenuItem === "texts"
                ? "bg-white text-black shadow-md shadow-white/25 scale-105"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/40 hover:shadow-md",
            )}
            variant={"ghost"}
            size={"icon"}
          >
            <Icons.text width={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
