import { useEffect, useState, useMemo } from "react";
import { IVideo } from "@designcombo/types";
import { VIDEOS } from "./video";
import { fetchVideosFromAPI } from "./fetch-videos";

// Helper function to group videos by source
const groupVideosBySource = (videos: Partial<IVideo>[]): { videosBySource: Record<string, Partial<IVideo>[]>, sources: string[] } => {
  const grouped = videos.reduce((acc, video) => {
    const source = (video as any)?.source || "unknown";
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(video);
    return acc;
  }, {} as Record<string, Partial<IVideo>[]>);
  
  const sources = Object.keys(grouped).sort();
  return { videosBySource: grouped, sources };
};

interface UseVideosDataReturn {
  videos: Partial<IVideo>[];
  videosBySource: Record<string, Partial<IVideo>[]>;
  sources: string[];
  loading: boolean;
  error: string | null;
}

export function useVideosData(): UseVideosDataReturn {
  const [videos, setVideos] = useState<Partial<IVideo>[]>(VIDEOS);
  const [videosBySource, setVideosBySource] = useState<Record<string, Partial<IVideo>[]>>({});
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiEnabled = import.meta.env.VITE_VIDEOS_API_ENABLED === "true";

  useEffect(() => {
    const updateVideosData = (videosList: Partial<IVideo>[]) => {
      setVideos(videosList);
      const { videosBySource, sources } = groupVideosBySource(videosList);
      setVideosBySource(videosBySource);
      setSources(sources);
    };

    if (!isApiEnabled) {
      updateVideosData(VIDEOS);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiVideos = await fetchVideosFromAPI();

        if (apiVideos.length > 0) {
          updateVideosData(apiVideos);
          console.log(`✅ Loaded ${apiVideos.length} videos from API`);
        } else {
          console.warn("API returned no videos, falling back to static data");
          updateVideosData(VIDEOS);
        }
      } catch (err) {
        console.warn("Failed to fetch videos from API, using static fallback:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
        updateVideosData(VIDEOS);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [isApiEnabled]);

  return { videos, videosBySource, sources, loading, error };
}
