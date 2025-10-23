import { Button } from "@/components/ui/button";
import { ChevronDown, CircleOff } from "lucide-react";
import { useEffect, useState } from "react";
import { IText, ITrackItem } from "@designcombo/types";
import { Label } from "@/components/ui/label";
import useLayoutStore from "../../store/use-layout-store";
import { useIsLargeScreen } from "../../hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	applyPreset,
	getTextShadow,
	NONE_PRESET,
	TEXT_PRESETS,
} from "../floating-controls/text-preset-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface PresetTextProps {
	trackItem: ITrackItem & any;
	properties: any;
}

export const PresetText = ({ properties, trackItem }: PresetTextProps) => {
	return (
		<div className="flex flex-col gap-2">
			<Label className="font-sans text-xs font-semibold">Text</Label>
			<SelectPreset trackItem={trackItem} properties={properties} />
		</div>
	);
};

const SelectPreset = ({ trackItem, properties }: { trackItem: ITrackItem & IText; properties: any }) => {
	const isLargeScreen = useIsLargeScreen();
	const [open, setOpen] = useState(false);
	const [currentPreset, setCurrentPreset] = useState<string>("None");

	// Function to detect which preset is currently applied
	const detectCurrentPreset = () => {
		if (!properties) return "None";
		
		// Check if it matches NONE_PRESET
		if (properties.backgroundColor === "transparent" && 
			properties.color === "#ffffff" && 
			properties.borderRadius === 0 && 
			properties.borderWidth === 0) {
			return "None";
		}
		
		// Check against all presets
		for (let i = 0; i < TEXT_PRESETS.length; i++) {
			const preset = TEXT_PRESETS[i];
			if (properties.backgroundColor === preset.backgroundColor &&
				properties.color === preset.color &&
				properties.borderRadius === preset.borderRadius &&
				properties.borderWidth === preset.borderWidth &&
				properties.borderColor === preset.borderColor) {
				return `Preset ${i + 1}`;
			}
		}
		
		return "Custom";
	};

	// Update current preset when properties change
	useEffect(() => {
		const detected = detectCurrentPreset();
		setCurrentPreset(detected);
	}, [properties]);

	const handlePresetSelect = (preset: any) => {
		applyPreset(preset, trackItem);
		setOpen(false); // Close the popover after selection
		
		// Update current preset display
		if (preset === NONE_PRESET) {
			setCurrentPreset("None");
		} else {
			const presetIndex = TEXT_PRESETS.indexOf(preset);
			setCurrentPreset(`Preset ${presetIndex + 1}`);
		}
	};

	return (
		<div className="flex gap-2 py-0 flex-col lg:flex-row">
			<div className="flex flex-1 items-center text-sm text-muted-foreground">
				Preset
			</div>
			{isLargeScreen ? (
				<div className="relative w-32">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								className="flex h-8 w-full items-center justify-between text-sm"
								variant="secondary"
							>
								<div className="w-full text-left">
									<p className="truncate">{currentPreset}</p>
								</div>
								<ChevronDown className="text-muted-foreground" size={14} />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="z-[200] w-80 p-4">
							<div className="grid grid-cols-3 gap-2">
								<div
									onClick={() => handlePresetSelect(NONE_PRESET)}
									className="flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
								>
									<CircleOff />
								</div>
								{TEXT_PRESETS.map((preset, index) => (
									<div
										key={index}
										onClick={() => handlePresetSelect(preset)}
										className="text-md flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
									>
										<div
											style={{
												backgroundColor: preset.backgroundColor,
												color: preset.color,
												borderRadius: `${preset.borderRadius}px`,
												WebkitTextStroke: `2px ${preset.borderColor}`,
												paintOrder: "stroke fill",
												fontWeight: "bold",
												textShadow: getTextShadow(preset.boxShadow),
											}}
											className="h-6 place-content-center px-2"
										>
											Text
										</div>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>
				</div>
			) : (
				<div>
					<ScrollArea className="h-[300px] w-full py-0">
						<div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(100px,1fr))]">
							<div
								onClick={() => applyPreset(NONE_PRESET, trackItem)}
								className="flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg"
							>
								<CircleOff />
							</div>

							{TEXT_PRESETS.map((preset, index) => (
								<div
									key={index}
									onClick={() => applyPreset(preset, trackItem)}
									className="text-md flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg"
								>
									<div
										style={{
											backgroundColor: preset.backgroundColor,
											color: preset.color,
											borderRadius: `${preset.borderRadius}px`,
											WebkitTextStroke: `2px ${preset.borderColor}`,
											paintOrder: "stroke fill",
											fontWeight: "bold",
											textShadow: getTextShadow(preset.boxShadow),
										}}
										className="h-6 place-content-center px-2"
									>
										Text
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
			)}
		</div>
	);
};
