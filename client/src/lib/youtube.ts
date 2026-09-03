/**
 * Converts any common YouTube URL format into an embeddable /embed/ URL.
 * Handles:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/live/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID (already embeddable, passed through)
 *  - https://www.youtube.com/shorts/VIDEO_ID
 * Falls back to returning the original URL unchanged if it isn't recognized
 * as YouTube (e.g. a direct video file or another streaming provider), so
 * non-YouTube video URLs keep working too.
 */
export function toEmbeddableVideoUrl(url: string): string {
  if (!url) return url;

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  if (!isYouTube) return url;

  let videoId: string | null = null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      // https://youtu.be/VIDEO_ID
      videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
    } else if (parsed.pathname.startsWith("/watch")) {
      // https://www.youtube.com/watch?v=VIDEO_ID
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/live/")) {
      // https://www.youtube.com/live/VIDEO_ID
      videoId = parsed.pathname.split("/live/")[1]?.split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      // https://www.youtube.com/shorts/VIDEO_ID
      videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/embed/")) {
      // Already an embed URL
      return url;
    }
  } catch {
    // Not a valid absolute URL - fall through and return as-is
    return url;
  }

  if (!videoId) return url;
  return `https://www.youtube.com/embed/${videoId}`;
}

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}
