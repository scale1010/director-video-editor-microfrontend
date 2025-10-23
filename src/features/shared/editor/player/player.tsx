import { useEffect, useRef } from "react";
import Composition from "./composition";
import { Player as RemotionPlayer, PlayerRef } from "@remotion/player";
import useStore from "../store/use-store";

const Player = () => {
	const playerRef = useRef<PlayerRef>(null);
	const { setPlayerRef, duration, fps, size, background } = useStore();

	useEffect(() => {
		setPlayerRef(playerRef as React.RefObject<PlayerRef>);
	}, []);

	// Final safety check to prevent Infinity error
	const safeDuration = (duration && isFinite(duration) && duration > 0) ? duration : 5000;
	const safeFps = (fps && isFinite(fps) && fps > 0) ? fps : 30;
	const durationInFrames = Math.round((safeDuration / 1000) * safeFps) || 1;

	// Additional validation to ensure we never pass Infinity
	if (!isFinite(durationInFrames) || durationInFrames <= 0) {
		console.error('Invalid durationInFrames calculated:', { duration: safeDuration, fps: safeFps, durationInFrames });
		return null; // Don't render if we can't calculate valid duration
	}

	return (
		<RemotionPlayer
			ref={playerRef}
			component={Composition}
			durationInFrames={durationInFrames}
			compositionWidth={size.width}
			compositionHeight={size.height}
			className={`h-full w-full bg-[${background.value}]`}
			fps={30}
			overflowVisible
		/>
	);
};
export default Player;
