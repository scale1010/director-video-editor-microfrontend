import { ScrollArea } from "@/components/ui/scroll-area";
import { IAudio, ITrackItem } from "@designcombo/types";
import Volume from "./common/volume";
import Speed from "./common/speed";
import React, { useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT, LAYER_REPLACE } from "@designcombo/state";
import { Button } from "@/components/ui/button";

const BasicAudio = ({
	trackItem,
	type,
}: {
	trackItem: ITrackItem & IAudio;
	type?: string;
}) => {
	const showAll = !type;
	const [properties, setProperties] = useState(trackItem);

    const handleChangeVolume = (v: number) => {
		dispatch(EDIT_OBJECT, {
			payload: {
				[trackItem.id]: {
					details: {
                        // store as 0–1 in payload
                        volume: v / 100,
					},
				},
			},
		});

		setProperties((prev) => {
			return {
				...prev,
				details: {
					...prev.details,
                    // keep UI responsive: store 0–1 locally as well
                    volume: v / 100,
				},
			};
		});
	};

	const handleChangeSpeed = (v: number) => {
		dispatch(EDIT_OBJECT, {
			payload: {
				[trackItem.id]: {
					playbackRate: v,
				},
			},
		});

		setProperties((prev) => {
			return {
				...prev,
				playbackRate: v,
			};
		});
	};

	const components = [
		{
			key: "speed",
			component: (
				<Speed
					value={properties.playbackRate ?? 1}
					onChange={handleChangeSpeed}
				/>
			),
		},
		{
			key: "volume",
			component: (
                <Volume
                    onChange={(v: number) => handleChangeVolume(v)}
                    // UI shows 0–100; payload/state keeps 0–1
                    value={Math.round(((properties.details.volume ?? 1) * 100))}
                />
			),
		},
	];

	return (
		<div className="flex flex-col">
			<div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
				Audio
			</div>
			<div className="flex flex-col gap-2 px-4 py-4">
				{components
					.filter((comp) => showAll || comp.key === type)
					.map((comp) => (
						<React.Fragment key={comp.key}>{comp.component}</React.Fragment>
					))}
			</div>
		</div>
	);
};

export default BasicAudio;
