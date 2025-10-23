import { Player } from "../player";
import { useRef, useImperativeHandle, forwardRef } from "react";
import useStore from "../store/use-store";
import StateManager from "@designcombo/state";
import SceneEmpty from "./empty";
import Board from "./board";
import useZoom from "../hooks/use-zoom";
import { SceneInteractions } from "./interactions";
import { SceneRef } from "./scene.types";

const Scene = forwardRef<
	SceneRef,
	{
		stateManager: StateManager;
	}
>(({ stateManager }, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { size, trackItemIds } = useStore();
	const { zoom, handlePinch, recalculateZoom } = useZoom(
		containerRef as React.RefObject<HTMLDivElement>,
		size,
	);

	// Expose the recalculateZoom function to parent
	useImperativeHandle(ref, () => ({
		recalculateZoom,
	}));

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				flex: 1,
				overflow: "hidden",
				background: "var(--bg-canvas)",
				backgroundImage: "radial-gradient(circle, var(--grid-color, rgba(255, 255, 255, 0.15)) 1px, transparent 1px)",
				backgroundSize: "16px 16px",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
			ref={containerRef}
		>
			{trackItemIds.length === 0 && <SceneEmpty />}
			<div
				style={{
					width: size.width,
					height: size.height,
					background: "var(--bg-canvas)",
					transform: `scale(${zoom})`,
					position: "absolute",
				}}
				className="player-container"
			>
				<div
					style={{
						position: "absolute",
						zIndex: 100,
						pointerEvents: "none",
						width: size.width,
						height: size.height,
						background: "transparent",
						boxShadow: "0 0 0 5000px #111",
					}}
				/>
				<Board size={size}>
					<Player />
					<SceneInteractions
						stateManager={stateManager}
						containerRef={containerRef as React.RefObject<HTMLDivElement>}
						zoom={zoom}
						size={size}
					/>
				</Board>
			</div>
		</div>
	);
});

Scene.displayName = "Scene";

export default Scene;
