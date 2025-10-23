import { useEffect, useState } from "react";
import { IAudio } from "@designcombo/types";
import { AUDIOS } from "./audio";
import { fetchAudiosFromAPI } from "./fetch-audios";

// Helper function to group audios by generation_type
const groupAudiosByGenerationType = (audios: Partial<IAudio>[]): { audiosByGenerationType: Record<string, Partial<IAudio>[]>, generationTypes: string[] } => {
  const grouped = audios.reduce((acc, audio) => {
    const generationType = (audio as any)?.generation_type || "unknown";
    if (!acc[generationType]) {
      acc[generationType] = [];
    }
    acc[generationType].push(audio);
    return acc;
  }, {} as Record<string, Partial<IAudio>[]>);
  
  const generationTypes = Object.keys(grouped).sort();
  return { audiosByGenerationType: grouped, generationTypes };
};

interface UseAudiosDataReturn {
  audios: Partial<IAudio>[];
  audiosByGenerationType: Record<string, Partial<IAudio>[]>;
  generationTypes: string[];
  loading: boolean;
  error: string | null;
}

export function useAudiosData(): UseAudiosDataReturn {
  const [audios, setAudios] = useState<Partial<IAudio>[]>(AUDIOS);
  const [audiosByGenerationType, setAudiosByGenerationType] = useState<Record<string, Partial<IAudio>[]>>({});
  const [generationTypes, setGenerationTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiEnabled = import.meta.env.VITE_AUDIOS_API_ENABLED === "true";

  useEffect(() => {
    const updateAudiosData = (audiosList: Partial<IAudio>[]) => {
      setAudios(audiosList);
      const { audiosByGenerationType, generationTypes } = groupAudiosByGenerationType(audiosList);
      setAudiosByGenerationType(audiosByGenerationType);
      setGenerationTypes(generationTypes);
    };

    if (!isApiEnabled) {
      updateAudiosData(AUDIOS);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAudios = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiAudios = await fetchAudiosFromAPI();

        if (apiAudios.length > 0) {
          updateAudiosData(apiAudios);
          console.log(`✅ Loaded ${apiAudios.length} audios from API`);
        } else {
          console.warn("API returned no audios, falling back to static data");
          updateAudiosData(AUDIOS);
        }
      } catch (err) {
        console.warn("Failed to fetch audios from API, using static fallback:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch audios");
        updateAudiosData(AUDIOS);
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, [isApiEnabled]);

  return { audios, audiosByGenerationType, generationTypes, loading, error };
}
