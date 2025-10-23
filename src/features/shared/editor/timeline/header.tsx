import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import {
	ACTIVE_SPLIT,
	LAYER_CLONE,
	LAYER_DELETE,
	TIMELINE_SCALE_CHANGED,
} from "@designcombo/state";
import { DESIGN_RESIZE } from "@designcombo/state";
import { PLAYER_PAUSE, PLAYER_PLAY } from "../constants/events";
import { frameToTimeString, getCurrentTime, timeToString } from "../utils/time";
import useStore from "../store/use-store";
import { SquareSplitHorizontal, Trash, ZoomIn, ZoomOut, ProportionsIcon } from "lucide-react";
import {
	getNextZoomLevel,
	getPreviousZoomLevel,
	getZoomByIndex,
} from "../utils/timeline";
import { useCurrentPlayerFrame } from "../hooks/use-current-frame";
import { SleekSlider } from "@/components/ui/sleek-slider";
import { useEffect, useState } from "react";
import useUpdateAnsestors from "../hooks/use-update-ansestors";
import { ITimelineScaleState } from "@designcombo/types";
import { useIsLargeScreen } from "../hooks/use-media-query";
import { useTimelineOffsetX } from "../hooks/use-timeline-offset";
import { Icons } from "@/components/shared/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const IconPlayerPlayFilled = ({ size }: { size: number }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
	</svg>
);

const IconPlayerPauseFilled = ({ size }: { size: number }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
		<path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
	</svg>
);
const IconPlayerSkipBack = ({ size }: { size: number }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M20 5v14l-12 -7z" />
		<path d="M4 5l0 14" />
	</svg>
);

const IconPlayerSkipForward = ({ size }: { size: number }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M4 5v14l12 -7z" />
		<path d="M20 5l0 14" />
	</svg>
);
const Header = () => {
	const [playing, setPlaying] = useState(false);
	const { duration, fps, scale, playerRef, activeIds } = useStore();
	const isLargeScreen = useIsLargeScreen();
	useUpdateAnsestors({ playing, playerRef });

	const currentFrame = useCurrentPlayerFrame(playerRef);

	const doActiveDelete = () => {
		dispatch(LAYER_DELETE);
	};

	const doActiveSplit = () => {
		dispatch(ACTIVE_SPLIT, {
			payload: {},
			options: {
				time: getCurrentTime(),
			},
		});
	};

	const changeScale = (scale: ITimelineScaleState) => {
		dispatch(TIMELINE_SCALE_CHANGED, {
			payload: {
				scale,
			},
		});
	};

	const handlePlay = () => {
		dispatch(PLAYER_PLAY);
	};

	const handlePause = () => {
		dispatch(PLAYER_PAUSE);
	};

	useEffect(() => {
		playerRef?.current?.addEventListener("play", () => {
			setPlaying(true);
		});
		playerRef?.current?.addEventListener("pause", () => {
			setPlaying(false);
		});
		return () => {
			playerRef?.current?.removeEventListener("play", () => {
				setPlaying(true);
			});
			playerRef?.current?.removeEventListener("pause", () => {
				setPlaying(false);
			});
		};
	}, [playerRef]);

	return (
		<div
			style={{
				position: "relative",
				height: "50px",
				flex: "none",
			}}
		>
			<div
				style={{
					position: "absolute",
					height: 50,
					width: "100%",
					display: "flex",
					alignItems: "center",
				}}
			>
				<div
					style={{
						height: 36,
						width: "100%",
						display: "grid",
						gridTemplateColumns: isLargeScreen
							? "1fr 260px 1fr"
							: "1fr 1fr 1fr",
						alignItems: "center",
					}}
				>
					<div className="flex px-2">
						<Button
							disabled={!activeIds.length}
							onClick={doActiveDelete}
							variant={"ghost"}
							size={"icon"}
							className="flex items-center justify-center"
						>
							<Trash size={14} />
						</Button>

						<Button
							disabled={!activeIds.length}
							onClick={doActiveSplit}
							variant={"ghost"}
							size={"icon"}
							className="flex items-center justify-center"
						>
							<SquareSplitHorizontal size={15} />
						</Button>

					</div>
					<div className="flex items-center justify-center">
						<div>
							<Button
								onClick={() => {
									if (playing) {
										return handlePause();
									}
									handlePlay();
								}}
								variant={"ghost"}
								size={"icon"}
                                className="text-foreground hover:text-foreground hover:bg-muted"
							>
								{playing ? (
									<IconPlayerPauseFilled size={14} />
								) : (
									<IconPlayerPlayFilled size={14} />
								)}
							</Button>
						</div>
						<div
							className="text-xs font-light flex"
							style={{
								alignItems: "center",
								gridTemplateColumns: "54px 4px 54px",
								paddingTop: "2px",
								justifyContent: "center",
							}}
						>
							<div
								className="font-medium text-foreground"
								style={{
									display: "flex",
									justifyContent: "center",
								}}
								data-current-time={currentFrame / fps}
								id="video-current-time"
							>
								{frameToTimeString({ frame: currentFrame }, { fps })}
							</div>
							<span className="px-1">|</span>
							<div
								className="text-muted-foreground hidden lg:block"
								style={{
									display: "flex",
									justifyContent: "center",
								}}
							>
								{timeToString({ time: duration })}
							</div>
						</div>
					</div>

					<ZoomControl
						scale={scale}
						onChangeTimelineScale={changeScale}
						duration={duration}
					/>
				</div>
			</div>
		</div>
	);
};

const ZoomControl = ({
	scale,
	onChangeTimelineScale,
	duration,
}: {
	scale: ITimelineScaleState;
	onChangeTimelineScale: (scale: ITimelineScaleState) => void;
	duration: number;
}) => {
	const [localValue, setLocalValue] = useState(scale.index);
	const timelineOffsetX = useTimelineOffsetX();

	useEffect(() => {
		setLocalValue(scale.index);
	}, [scale.index]);

	const onZoomOutClick = () => {
		const newScale = getPreviousZoomLevel(scale);
		onChangeTimelineScale(newScale);
	};

	const onZoomInClick = () => {
		const newScale = getNextZoomLevel(scale);
		onChangeTimelineScale(newScale);
	};

	return (
		<div className="flex items-center justify-end">
			<div className="flex pl-4 pr-2">
				<Button 
					size={"icon"} 
					variant={"ghost"} 
					onClick={onZoomOutClick}
				>
					<ZoomOut size={16} />
				</Button>
				<SleekSlider
					className="w-28 hidden lg:flex mx-3"
					value={[localValue]}
					onValueChange={(value) => {
						const newScale = getZoomByIndex(value[0]);
						onChangeTimelineScale(newScale);
					}}
					max={getNextZoomLevel(scale).index}
					min={getPreviousZoomLevel(scale).index}
					step={1}
				/>
				<Button 
					size={"icon"} 
					variant={"ghost"} 
					onClick={onZoomInClick}
				>
					<ZoomIn size={16} />
				</Button>
			</div>
		</div>
	);
};

export default Header;
