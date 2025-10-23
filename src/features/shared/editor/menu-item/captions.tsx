import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { generateCaptions } from "../utils/captions";
import { loadFonts } from "../utils/fonts";
import { dispatch } from "@designcombo/events";
import { ADD_CAPTIONS } from "@designcombo/state";
import { ITrackItem, ITrackItemsMap } from "@designcombo/types";
import { millisecondsToHHMMSS } from "../utils/format";
import useStore from "../store/use-store";
import { groupBy } from "lodash";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PLAYER_SEEK } from "../constants/events";
import { useCurrentPlayerFrame } from "../hooks/use-current-frame";

export const Captions = () => {
  const { trackItemsMap } = useStore();
  const [selectMediaItems, setSelectMediaItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedMedia, setSelectedMedia] = useState<string | undefined>();
  const [captionTrackItemsMap, setCaptionTrackItemsMap] = useState<
    Record<string, ITrackItem[]>
  >({});
  const [mediaTrackItems, setMediaTrackItems] = useState<ITrackItem[]>([]);

  useEffect(() => {
    const mediaTrackItems = fetchMediaTrackItems(trackItemsMap);
    setMediaTrackItems(mediaTrackItems);

    const selectMediaOptions = createSelectMediaOptions(mediaTrackItems);
    setSelectMediaItems(selectMediaOptions);

    const groupedCaptions = groupCaptionItems(trackItemsMap);

    Object.keys(groupedCaptions).forEach((key) => {
      const captions = groupedCaptions[key];
      const orderedCaptionByDisplayFrom = captions.sort(
        (a, b) => a.display.from - b.display.from,
      );
      console.log({ orderedCaptionByDisplayFrom });
      groupedCaptions[key] = orderedCaptionByDisplayFrom as ITrackItem[];
    });
    setCaptionTrackItemsMap(groupedCaptions);
  }, [trackItemsMap]);

  const handleSelectChange = (value: string) => {
    setSelectedMedia(value);
  };

  const createCaptions = async (selectedMedia: string) => {
    const trackItem = mediaTrackItems.find(
      (m) => m.details.src === selectedMedia,
    )!;

    const { url } = await transcribeMedia(selectedMedia, "ES");
    const jsonData = await fetchJsonFromUrl(url);

    const fontInfo = {
      fontFamily: "theboldfont",
      fontUrl: "https://cdn.designcombo.dev/fonts/the-bold-font.ttf",
      fontSize: 60,
    };
    const options = {
      containerWidth: 600,
      linesPerCaption: 2,
      parentId: trackItem.id,
      displayFrom: trackItem.display.from,
    };

    await loadFonts([{ name: fontInfo.fontFamily, url: fontInfo.fontUrl }]);
    const captions = generateCaptions(
      { ...jsonData, sourceUrl: selectedMedia },
      fontInfo,
      options,
    );

    dispatch(ADD_CAPTIONS, { payload: captions });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Header />
      {mediaTrackItems.length === 0 ? (
        <EmptyMediaTrackItems />
      ) : (
        <MediaSection
          selectMediaItems={selectMediaItems}
          selectedMedia={selectedMedia}
          onSelectChange={handleSelectChange}
          captionTrackItemsMap={captionTrackItemsMap}
          createCaptions={createCaptions}
        />
      )}
    </div>
  );
};

const Header = () => (
  <div className="text-foreground flex h-12 flex-none items-center px-4 text-sm font-medium">
    Captions
  </div>
);

const MediaSection = ({
  selectMediaItems,
  selectedMedia,
  onSelectChange,
  captionTrackItemsMap,
  createCaptions,
}: {
  selectMediaItems: { label: string; value: string }[];
  selectedMedia: string | undefined;
  onSelectChange: (value: string) => void;
  captionTrackItemsMap: Record<string, ITrackItem[]>;
  createCaptions: (selectedMedia: string) => void;
}) => (
  <div className="flex h-[calc(100%-4.5rem)] flex-col gap-4 px-4">
    <Select value={selectedMedia} onValueChange={onSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select media" />
      </SelectTrigger>
      <SelectContent className="z-[200]">
        {selectMediaItems.map((item) => (
          <SelectItem value={item.value} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {selectedMedia ? (
      captionTrackItemsMap[selectedMedia] ? (
        <div className="h-[calc(100vh-29rem)]">
          <ScrollArea className="h-full">
            <MediaWithCaptions
              captionTrackItems={captionTrackItemsMap[selectedMedia]}
            />
          </ScrollArea>
        </div>
      ) : (
        <MediaWithNoCaptions
          createCaptions={() => createCaptions(selectedMedia)}
        />
      )
    ) : (
      <MediaNoSelected />
    )}
  </div>
);

const MediaNoSelected = () => (
  <div className="text-center text-sm text-muted-foreground">
    Select video or audio and generate captions automatically.
  </div>
);

const EmptyMediaTrackItems = () => (
  <div className="text-center text-sm text-muted-foreground">
    Add video or audio and generate captions automatically.
  </div>
);

const MediaWithNoCaptions = ({
  createCaptions,
}: {
  createCaptions: () => void;
}) => (
  <div className="flex flex-col gap-2 px-4">
    <div className="text-center text-sm text-muted-foreground">
      Recognize speech in the selected video/audio and generate captions
      automatically.
    </div>
    <Button onClick={createCaptions} variant="default" className="w-full">
      Generate
    </Button>
  </div>
);

const MediaWithCaptions = ({
  captionTrackItems,
}: {
  captionTrackItems: ITrackItem[];
}) => {
  const { playerRef } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);

  return (
    <div className="flex flex-col gap-2">
      {captionTrackItems.map((item) => (
        <CaptionItem
          isActive={
            currentFrame * (1000 / 30) >= item.display.from &&
            currentFrame * (1000 / 30) <= item.display.to
          }
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
};
const CaptionItem = ({
  item,
  isActive,
}: {
  item: ITrackItem;
  isActive?: boolean;
}) => {
  const { display, details } = item;
  // const [timeline, setTimeline] = useState(0);
  // const { fps, playerRef } = useStore();
  // const currentFrame = useCurrentPlayerFrame(playerRef!);
  // const [inRange, setInRange] = useState(false);
  // useEffect(() => {
  //   setTimeline(currentFrame / fps);
  // }, [currentFrame, fps]);

  // const isInRange = useCallback(() => {
  //   return timeline >= display.from / 1000 && timeline <= display.to / 1000;
  // }, [timeline, display.from, display.to]);

  // useEffect(() => {
  //   setInRange(isInRange());
  // }, [timeline, isInRange]);

  const handleSeek = (time: number) => {
    dispatch(PLAYER_SEEK, { payload: { time: time } });
  };
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg p-2 hover:cursor-pointer hover:bg-zinc-900 ${
        isActive
          ? "bg-captions-background text-captions-text"
          : "text-muted-foreground"
      }`}
      onClick={() => handleSeek(display.from)}
    >
      <div className="flex flex-col gap-1">
        <div className="text-xs">
          {millisecondsToHHMMSS(display.from)} -{" "}
          {millisecondsToHHMMSS(display.to)}
        </div>
        <div className="text-sm">{details.text}</div>
      </div>
    </div>
  );
};
// Helper functions
const fetchMediaTrackItems = (trackItemsMap: ITrackItemsMap) => {
  return Object.values(trackItemsMap).filter(
    ({ type }: ITrackItem) => type === "audio" || type === "video",
  );
};

const createSelectMediaOptions = (mediaTrackItems: ITrackItem[]) => {
  return mediaTrackItems.map(({ name, details }) => ({
    label: name,
    value: details.src,
  }));
};

const groupCaptionItems = (trackItemsMap: ITrackItemsMap) => {
  const captionTrackItems = Object.values(trackItemsMap).filter(
    ({ type }: ITrackItem) => type === "caption",
  );
  return groupBy(captionTrackItems, "metadata.sourceUrl");
};

async function transcribeMedia(
  mediaUrl: string,
  targetLanguage: string,
): Promise<{ url: string }> {
  const transcribeResponse = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: mediaUrl,
      targetLanguage,
    }),
  });

  if (!transcribeResponse.ok) {
    throw new Error("Failed to initiate transcription.");
  }

  const transcribeData = await transcribeResponse.json();
  const { transcribe } = transcribeData;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const statusResponse = await fetch(`/api/transcribe/${transcribe.id}`);

        if (!statusResponse.ok) {
          throw new Error("Failed to fetch export status.");
        }

        const statusInfo = await statusResponse.json();
        const { status, languages } = statusInfo.transcribe;

        if (status === "COMPLETED") {
          const keys = Object.keys(languages);
          const urls = keys.map((key) => ({ key, url: languages[key]?.url }));
          const lngs = urls.find((u) => u.key === "normal");
          if (!lngs) throw new Error("Failed to fetch export url.");

          resolve({ url: lngs.url });
        } else if (status === "PENDING" || status === "PROGRESS") {
          setTimeout(checkStatus, 2500);
        } else {
          reject(new Error(`Unexpected status: ${status}`));
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
}

async function fetchJsonFromUrl(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching JSON: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch JSON data:", error);
    throw error; // Optionally rethrow to handle it in the caller
  }
}
