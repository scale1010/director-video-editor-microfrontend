import { callPrimaryAppAPI } from "@/services/api";
import { IVideo } from "@designcombo/types";

const shouldProxy = (src: string): boolean => {
  const proxyFlag = import.meta.env.VITE_PROXY_VIDEOS_ENABLED === "true";
  try {
    const u = new URL(src);
    const sameOrigin = u.origin === window.location.origin;
    return proxyFlag || !sameOrigin;
  } catch {
    return proxyFlag;
  }
};

const toProxyUrl = (src: string): string => `/proxy?url=${encodeURIComponent(src)}`;

/**
 * Fetches videos from the API and normalizes them to match the existing IVideo interface
 * Falls back to static data if API fails
 */
export async function fetchVideosFromAPI(): Promise<Partial<IVideo>[]> {
  try {
    const response = await callPrimaryAppAPI(
      "/workspaces/assets/list?type=video",
      undefined,
      "GET"
    );

    return normalizeVideosResponse(response);
  } catch (error) {
    console.warn("Failed to fetch videos from API, will use fallback:", error);
    throw error;
  }
}

/**
 * Normalizes various possible API response shapes to match IVideo interface
 */
function normalizeVideosResponse(raw: any): Partial<IVideo>[] {
  // Handle different possible response structures
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data?.assets)
    ? raw.data.assets
    : Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  if (!Array.isArray(list)) {
    console.warn("Unexpected API response structure:", raw);
    return [];
  }

  return list
    .map((item: any) => {
      // Fast-path: item already matches our shape
      if (
        item &&
        typeof item.id !== "undefined" &&
        item?.details?.src &&
        (item?.preview || item?.details?.src)
      ) {
      const src = String(item.details.src);
      const previewSrc = String(item.preview ?? src);
      const proxiedPreview = shouldProxy(previewSrc) ? toProxyUrl(previewSrc) : previewSrc;
      const proxiedSrc = shouldProxy(src) ? toProxyUrl(src) : src;
      return {
        id: String(item.id),
        details: { src: proxiedSrc }, // Proxy the source URL to avoid CORS issues
        preview: proxiedPreview, // Proxy the preview for display
        type: "video" as const,
        duration: item.duration || 5000, // Default 5 seconds if not provided
        source: item.source || "unknown", // Include the source field
      };
      }

      // Extract ID from various possible fields
      const id = item?.id ?? item?.uuid ?? item?._id ?? item?.file_id;
      
      // Extract source URL from various possible fields
      const rawSrc =
        item?.details?.src ??
        item?.src ?? 
        item?.url ?? 
        item?.file_url ?? 
        item?.path ?? 
        item?.location ?? 
        item?.file_path;

      if (!id || !rawSrc) {
        console.warn("Missing required fields for video item:", item);
        return null;
      }

      const src = String(rawSrc);

      // Extract preview/thumbnail from various possible fields
      const preview =
        item?.preview ??
        item?.thumbnail ??
        item?.thumbnail_url ??
        item?.thumb_url ??
        (String(src).includes("?") ? String(src) : `${src}?tr=w-190`);

      // Proxy both the source URL and preview URL to avoid CORS issues
      const proxiedPreview = shouldProxy(preview) ? toProxyUrl(preview) : preview;
      const proxiedSrc = shouldProxy(src) ? toProxyUrl(src) : src;

      // Extract duration from various possible fields
      const duration = 
        item?.duration ?? 
        item?.length ?? 
        item?.duration_ms ?? 
        item?.duration_seconds ? (item.duration_seconds * 1000) : 
        5000; // Default 5 seconds

      return {
        id: String(id),
        details: { src: proxiedSrc }, // Proxy the source URL to avoid CORS issues
        preview: proxiedPreview, // Proxy the preview for display
        type: "video" as const,
        duration: Number(duration),
        source: item?.source || "unknown", // Include the source field
      };
    })
    .filter(Boolean) as unknown as Partial<IVideo>[];
}
