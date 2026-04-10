export interface ParsedYouTubeUrl {
  rawUrl: string;
  canonicalUrl: string;
  videoId: string;
}

export interface YouTubeOEmbedMetadata {
  title: string;
  authorName?: string;
  thumbnailUrl?: string;
}

const VALID_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeUrl(rawUrl: string): ParsedYouTubeUrl | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = extractIdFromPathSegment(url.pathname);
    } else if (isYouTubeHost(host)) {
      const segments = url.pathname.split("/").filter(Boolean);

      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live") {
        videoId = segments[1] ?? null;
      } else if (segments[0] === "watch") {
        videoId = url.searchParams.get("v");
      }
    }

    if (!videoId || !VALID_VIDEO_ID.test(videoId)) {
      return null;
    }

    return {
      rawUrl,
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return null;
  }
}

export async function fetchYouTubeOEmbedMetadata(
  canonicalUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<YouTubeOEmbedMetadata | null> {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", canonicalUrl);
  endpoint.searchParams.set("format", "json");

  try {
    const response = await fetchImpl(endpoint.toString(), {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };

    if (!payload.title) {
      return null;
    }

    return {
      title: payload.title,
      authorName: payload.author_name,
      thumbnailUrl: payload.thumbnail_url,
    };
  } catch {
    return null;
  }
}

function isYouTubeHost(hostname: string): boolean {
  return [
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
  ].includes(hostname);
}

function extractIdFromPathSegment(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];

  return segment ?? null;
}
