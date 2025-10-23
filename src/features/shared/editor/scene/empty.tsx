import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import { useEffect, useRef, useState } from "react";
import { Droppable } from "@/components/ui/droppable";
import { PlusIcon } from "lucide-react";
import { DroppableArea } from "./droppable";
import { IMenuItem } from "../interfaces/layout";

const SceneEmpty = () => {
	const [isLoading, setIsLoading] = useState(true);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [desiredSize, setDesiredSize] = useState({ width: 0, height: 0 });
	const [isHovered, setIsHovered] = useState(false);
	const { size } = useStore();
	const { setActiveMenuItem, setShowMenuItem, setIsSidebarHovered } = useLayoutStore();

	useEffect(() => {
		const container = containerRef.current!;
		const PADDING = 96;
		const containerHeight = container.clientHeight - PADDING;
		const containerWidth = container.clientWidth - PADDING;
		const { width, height } = size;

		const desiredZoom = Math.min(
			containerWidth / width,
			containerHeight / height,
		);
		setDesiredSize({
			width: width * desiredZoom,
			height: height * desiredZoom,
		});
		setIsLoading(false);
	}, [size]);

	const onSelectFiles = (files: File[]) => {
		console.log({ files });
	};

	const handlePlusClick = () => {
		// Open video selection panel (same as clicking Video button in toolbar)
		setActiveMenuItem("videos" as IMenuItem);
		setShowMenuItem(true);
		setIsSidebarHovered(true);
	};

	return (
		<div ref={containerRef} className="absolute z-50 flex h-full w-full flex-1">
			{!isLoading ? (
				<Droppable
					maxFileCount={4}
					maxSize={4 * 1024 * 1024}
					disabled={false}
					onValueChange={onSelectFiles}
					className="h-full w-full flex-1 bg-background"
				>
					<DroppableArea
						onDragStateChange={setIsDraggingOver}
                    className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center border border-dashed text-center transition-colors duration-200 ease-in-out ${
                            isDraggingOver ? "border-white bg-white/10" : "border-white/30"
                        }`}
						style={{
							width: desiredSize.width,
							height: desiredSize.height,
						}}
					>
						<div className="flex flex-col items-center justify-center gap-4 pb-12">
							<div 
								className={`rounded-md border border-white/20 p-3 text-white/60 cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:text-white/90 hover:border-white/40 hover:bg-white/10 active:scale-95 ${
									isHovered ? 'scale-110 text-white/90 border-white/40 bg-white/10' : ''
								}`}
								onClick={handlePlusClick}
								onMouseEnter={() => setIsHovered(true)}
								onMouseLeave={() => setIsHovered(false)}
								title="Click to add media"
							>
								<PlusIcon className="h-6 w-6 transition-transform duration-300 ease-out" aria-hidden="true" />
							</div>
							<div className="flex flex-col gap-1">
								<p className="text-sm text-white/60">Ready to edit</p>
								<p className="text-xs text-white/40">
									Click + or add media from the dock
								</p>
							</div>
						</div>
					</DroppableArea>
				</Droppable>
			) : (
				<div className="flex flex-1 items-center justify-center bg-background-subtle text-sm text-muted-foreground">
					Loading...
				</div>
			)}
		</div>
	);
};

export default SceneEmpty;
