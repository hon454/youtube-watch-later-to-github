import { describe, expect, it } from "vitest";
import { fetchYouTubeOEmbedMetadata, parseYouTubeUrl } from "../src/youtube.js";

describe("parseYouTubeUrl", () => {
  it("normalizes standard watch URLs", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      rawUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it("supports short URLs and shorts URLs", () => {
    expect(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=10")?.videoId).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeUrl("https://m.youtube.com/shorts/dQw4w9WgXcQ")?.videoId).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("rejects non-youtube URLs and playlist-only links", () => {
    expect(parseYouTubeUrl("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYouTubeUrl("https://www.youtube.com/playlist?list=PL123")).toBeNull();
  });
});

describe("fetchYouTubeOEmbedMetadata", () => {
  it("returns metadata for successful responses", async () => {
    const metadata = await fetchYouTubeOEmbedMetadata(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      async () =>
        new Response(
          JSON.stringify({
            title: "Video title",
            author_name: "Channel name",
            thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          }),
          { status: 200 },
        ),
    );

    expect(metadata).toEqual({
      title: "Video title",
      authorName: "Channel name",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
  });

  it("falls back to null on fetch errors", async () => {
    await expect(
      fetchYouTubeOEmbedMetadata(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        async () => {
          throw new Error("network");
        },
      ),
    ).resolves.toBeNull();
  });
});
