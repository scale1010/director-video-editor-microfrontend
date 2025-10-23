import { useEffect, useState } from "react";
import { IImage } from "@designcombo/types";
import { IMAGES } from "./images";
import { fetchImagesFromAPI } from "./fetch-images";

interface UseImagesDataReturn {
  images: Partial<IImage>[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch images from API with fallback to static data
 * Controlled by VITE_IMAGES_API_ENABLED environment variable
 */
export function useImagesData(): UseImagesDataReturn {
  const [images, setImages] = useState<Partial<IImage>[]>(IMAGES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiEnabled = import.meta.env.VITE_IMAGES_API_ENABLED === "true";

  useEffect(() => {
    // If API is not enabled, use static data
    if (!isApiEnabled) {
      setImages(IMAGES);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch images from API
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiImages = await fetchImagesFromAPI();
        
        if (apiImages.length > 0) {
          setImages(apiImages);
          console.log(`✅ Loaded ${apiImages.length} images from API`);
        } else {
          console.warn("API returned no images, falling back to static data");
          setImages(IMAGES);
        }
      } catch (err) {
        console.warn("Failed to fetch images from API, using static fallback:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch images");
        setImages(IMAGES); // Fallback to static data
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [isApiEnabled]);

  return { images, loading, error };
}
