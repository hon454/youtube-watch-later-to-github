import { describe, expect, it } from "vitest";
import { formatIssueBody, formatReminderMessages } from "../src/formatters.js";

describe("formatIssueBody", () => {
  it("embeds a duplicate-detection marker and metadata", () => {
    const body = formatIssueBody({
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      rawUrl: "https://youtu.be/dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      title: "Example video",
      channelName: "Example channel",
      thumbnailUrl: "https://img.youtube.com/example.jpg",
      collectedAt: "2026-04-10T00:00:00.000Z",
      telegramMessage: "watch later",
    });

    expect(body).toContain("youtube-watch-later-video-id:dQw4w9WgXcQ");
    expect(body).toContain("Example channel");
    expect(body).toContain("```text");
  });
});

describe("formatReminderMessages", () => {
  it("formats empty reminders", () => {
    expect(
      formatReminderMessages([], "owner/repo", "https://github.com/owner/repo"),
    ).toEqual(["📭 오늘은 열려 있는 watch-later 이슈가 없습니다.\nRepo: owner/repo"]);
  });

  it("shows five detailed items and summarizes the rest", () => {
    const issues = Array.from({ length: 7 }, (_, index) => ({
      number: index + 1,
      title: `Issue ${index + 1}`,
      htmlUrl: `https://github.com/owner/repo/issues/${index + 1}`,
      createdAt: "2026-04-10T00:00:00.000Z",
    }));

    const messages = formatReminderMessages(
      issues,
      "owner/repo",
      "https://github.com/owner/repo",
      4096,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain("Open items: 7");
    expect(messages[0]).toContain("Issue #5");
    expect(messages[0]).toContain("외 2개 더 있습니다.");
    expect(messages[0]).not.toContain("Issue #6 ·");
  });

  it("splits long messages at the telegram size boundary", () => {
    const issues = Array.from({ length: 50 }, (_, index) => ({
      number: index + 1,
      title: `Very long title ${"x".repeat(120)}`,
      htmlUrl: `https://github.com/owner/repo/issues/${index + 1}`,
      createdAt: "2026-04-10T00:00:00.000Z",
    }));

    const messages = formatReminderMessages(
      issues,
      "owner/repo",
      "https://github.com/owner/repo",
      300,
    );

    expect(messages.length).toBeGreaterThan(1);
    expect(messages.every((message) => message.length <= 300)).toBe(true);
  });
});
