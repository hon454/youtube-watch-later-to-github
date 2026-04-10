export interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
}

export interface TelegramChat {
  id: number;
  type?: string;
}

export interface TelegramMessage {
  message_id: number;
  chat: TelegramChat;
  text?: string;
  caption?: string;
  entities?: TelegramMessageEntity[];
  caption_entities?: TelegramMessageEntity[];
}

export interface TelegramUpdate {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

export interface TelegramMessageContext {
  chatId: string;
  messageText: string;
  extractedUrl?: string;
}

const TELEGRAM_SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
const URL_REGEX = /https?:\/\/[^\s<>()]+/i;

export function verifyTelegramWebhookSecret(
  request: Request,
  expectedSecret: string,
): boolean {
  return request.headers.get(TELEGRAM_SECRET_HEADER) === expectedSecret;
}

export function extractTelegramMessageContext(
  update: TelegramUpdate,
): TelegramMessageContext | null {
  const message =
    update.message ??
    update.edited_message ??
    update.channel_post ??
    update.edited_channel_post;

  if (!message) {
    return null;
  }

  const messageText = message.text ?? message.caption ?? "";
  const entities = message.entities ?? message.caption_entities ?? [];

  return {
    chatId: String(message.chat.id),
    messageText,
    extractedUrl:
      extractUrlFromEntities(messageText, entities) ?? extractUrlFromText(messageText),
  };
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(
        `Telegram sendMessage failed with status ${response.status}: ${await response.text()}`,
      );
    } catch (error) {
      lastError = error;
    }

    if (attempt === 0) {
      await delay(250);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Telegram sendMessage failed");
}

function extractUrlFromEntities(
  text: string,
  entities: TelegramMessageEntity[],
): string | undefined {
  for (const entity of entities) {
    if (entity.type === "text_link" && entity.url) {
      return entity.url;
    }

    if (entity.type === "url") {
      return cleanExtractedUrl(text.slice(entity.offset, entity.offset + entity.length));
    }
  }

  return undefined;
}

function extractUrlFromText(text: string): string | undefined {
  const match = text.match(URL_REGEX);

  return match ? cleanExtractedUrl(match[0]) : undefined;
}

function cleanExtractedUrl(value: string): string {
  return value.replace(/[)\],.!?]+$/, "");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
