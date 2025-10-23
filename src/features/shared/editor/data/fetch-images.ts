import { callPrimaryAppAPI } from "@/services/api";
import { IImage } from "@designcombo/types";

const shouldProxy = (src: string): boolean => {
  const proxyFlag = import.meta.env.VITE_PROXY_IMAGES_ENABLED === "true";
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
 * Fetches images from the API and normalizes them to match the existing IImage interface
 * Falls back to static data if API fails
 */
export async function fetchImagesFromAPI(): Promise<Partial<IImage>[]> {
  try {
    const response = await callPrimaryAppAPI(
      "/workspaces/assets/list?type=image",
      undefined,
      "GET"
    );

    return normalizeImagesResponse(response);
  } catch (error) {
    console.warn("Failed to fetch images from API, will use fallback:", error);
    throw error;
  }
}

/**
 * Normalizes various possible API response shapes to match IImage interface
 */
function normalizeImagesResponse(raw: any): Partial<IImage>[] {
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
          type: "image" as const,
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
        console.warn("Missing required fields for image item:", item);
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

      return {
        id: String(id),
        details: { src: proxiedSrc }, // Proxy the source URL to avoid CORS issues
        preview: proxiedPreview, // Proxy the preview for display
        type: "image" as const,
      };
    })
    .filter(Boolean) as Partial<IImage>[];
}
