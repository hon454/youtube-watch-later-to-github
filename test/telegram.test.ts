import { describe, expect, it } from "vitest";
import {
  extractTelegramMessageContext,
  verifyTelegramWebhookSecret,
} from "../src/telegram.js";

describe("verifyTelegramWebhookSecret", () => {
  it("accepts matching secret tokens", () => {
    const request = new Request("https://example.com", {
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "secret",
      },
    });

    expect(verifyTelegramWebhookSecret(request, "secret")).toBe(true);
    expect(verifyTelegramWebhookSecret(request, "different")).toBe(false);
  });
});

describe("extractTelegramMessageContext", () => {
  it("extracts URL from text entities", () => {
    const context = extractTelegramMessageContext({
      message: {
        message_id: 1,
        chat: { id: 123 },
        text: "watch this https://youtu.be/dQw4w9WgXcQ",
        entities: [
          {
            type: "url",
            offset: 11,
            length: 28,
          },
        ],
      },
    });

    expect(context).toEqual({
      chatId: "123",
      messageText: "watch this https://youtu.be/dQw4w9WgXcQ",
      extractedUrl: "https://youtu.be/dQw4w9WgXcQ",
    });
  });

  it("extracts URL from captions and text_link entities", () => {
    const context = extractTelegramMessageContext({
      message: {
        message_id: 1,
        chat: { id: 123 },
        caption: "caption",
        caption_entities: [
          {
            type: "text_link",
            offset: 0,
            length: 7,
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
        ],
      },
    });

    expect(context?.extractedUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("returns null when the update does not contain a message payload", () => {
    expect(extractTelegramMessageContext({ update_id: 1 })).toBeNull();
  });
});
