import { callPrimaryAppAPI } from "@/services/api";
import { IAudio } from "@designcombo/types";

const shouldProxy = (src: string): boolean => {
  const proxyFlag = import.meta.env.VITE_PROXY_AUDIOS_ENABLED === "true";
  try {
    const u = new URL(src);
    const sameOrigin = u.origin === window.location.origin;
    return proxyFlag || !sameOrigin;
  } catch {
    return proxyFlag;
  }
};

const toProxyUrl = (src: string): string => `/proxy?url=${encodeURIComponent(src)}`;

export async function fetchAudiosFromAPI(): Promise<Partial<IAudio>[]> {
  try {
    const response = await callPrimaryAppAPI(
      "/workspaces/assets/list?type=audio",
      undefined,
      "GET"
    );
    return normalizeAudiosResponse(response);
  } catch (error) {
    console.warn("Failed to fetch audios from API, will use fallback:", error);
    throw error;
  }
}

function normalizeAudiosResponse(raw: any): Partial<IAudio>[] {
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
      if (
        item &&
        typeof item.id !== "undefined" &&
        item?.details?.src &&
        (item?.name || item?.title)
      ) {
        const src = String(item.details.src);
        // Use proxy URL if needed to handle CORS issues
        const finalSrc = shouldProxy(src) ? toProxyUrl(src) : src;
        return {
          id: String(item.id),
          details: { src: finalSrc },
          name: String(item.name ?? item.title ?? "Untitled Audio"),
          type: "audio" as const,
          metadata: {
            author: item.metadata?.author ?? item.author ?? item.artist ?? "Unknown Artist",
          },
          source: item.source || "unknown",
          generation_type: item.generation_type || "unknown",
        };
      }

      const id = item?.id ?? item?.uuid ?? item?._id ?? item?.file_id;
      const rawSrc =
        item?.details?.src ??
        item?.src ??
        item?.url ??
        item?.file_url ??
        item?.path ??
        item?.location ??
        item?.file_path;

      if (!id || !rawSrc) {
        console.warn("Missing required fields for audio item:", item);
        return null;
      }

      const src = String(rawSrc);
      // Use proxy URL if needed to handle CORS issues
      const finalSrc = shouldProxy(src) ? toProxyUrl(src) : src;

      const name = item?.name ?? item?.title ?? item?.filename ?? "Untitled Audio";
      const author = item?.metadata?.author ?? item?.author ?? item?.artist ?? "Unknown Artist";

      return {
        id: String(id),
        details: { src: finalSrc },
        name: String(name),
        type: "audio" as const,
        metadata: {
          author: String(author),
        },
        source: item.source || "unknown",
        generation_type: item.generation_type || "unknown",
      };
    })
    .filter(Boolean) as Partial<IAudio>[];
}
