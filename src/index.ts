import { getGitHubRepoConfig, loadWorkerConfig, type AppConfig, type Env } from "./config.js";
import {
  formatDuplicateMessage,
  formatGitHubErrorMessage,
  formatIssueBody,
  formatSuccessMessage,
  formatUnsupportedUrlMessage,
  formatUrlOnlySuccessMessage,
} from "./formatters.js";
import { createIssue, findDuplicateIssue } from "./github/issues.js";
import { addIssueToProject } from "./github/project.js";
import {
  extractTelegramMessageContext,
  sendTelegramMessage,
  verifyTelegramWebhookSecret,
  type TelegramUpdate,
} from "./telegram.js";
import { fetchYouTubeOEmbedMetadata, parseYouTubeUrl } from "./youtube.js";

interface WorkerDependencies {
  fetch: typeof fetch;
  now: () => Date;
  log: Pick<Console, "error" | "info" | "warn">;
}

const defaultDependencies: WorkerDependencies = {
  fetch,
  now: () => new Date(),
  log: console,
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handleRequest(request, env, ctx, defaultDependencies);
  },
} satisfies ExportedHandler<Env>;

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  dependencies: WorkerDependencies = defaultDependencies,
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/healthz") {
    return Response.json({ ok: true });
  }

  if (url.pathname !== "/telegram/webhook") {
    return new Response("Not found", { status: 404 });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let config: AppConfig;

  try {
    config = loadWorkerConfig(env);
  } catch (error) {
    dependencies.log.error("Invalid worker configuration", error);
    return new Response("Invalid worker configuration", { status: 500 });
  }

  if (!verifyTelegramWebhookSecret(request, config.telegramWebhookSecret)) {
    return new Response("Forbidden", { status: 403 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const messageContext = extractTelegramMessageContext(update);

  if (!messageContext) {
    return new Response("Ignored", { status: 200 });
  }

  if (messageContext.chatId !== config.telegramAllowedChatId) {
    return new Response("Forbidden", { status: 403 });
  }

  const parsedUrl = messageContext.extractedUrl
    ? parseYouTubeUrl(messageContext.extractedUrl)
    : null;

  if (!parsedUrl) {
    ctx.waitUntil(
      sendUserMessage(
        config.telegramBotToken,
        messageContext.chatId,
        formatUnsupportedUrlMessage(),
        dependencies,
      ),
    );

    return new Response("Accepted", { status: 200 });
  }

  ctx.waitUntil(
    processTelegramLink(
      messageContext.chatId,
      messageContext.messageText,
      parsedUrl,
      config,
      dependencies,
    ),
  );

  return new Response("Accepted", { status: 200 });
}

async function processTelegramLink(
  chatId: string,
  telegramMessage: string,
  parsedUrl: NonNullable<ReturnType<typeof parseYouTubeUrl>>,
  config: AppConfig,
  dependencies: WorkerDependencies,
): Promise<void> {
  const repoConfig = getGitHubRepoConfig(config);

  try {
    const metadata = await fetchYouTubeOEmbedMetadata(parsedUrl.canonicalUrl, dependencies.fetch);
    const duplicate = await findDuplicateIssue(repoConfig, parsedUrl.videoId, dependencies.fetch);

    if (duplicate) {
      await sendUserMessage(
        config.telegramBotToken,
        chatId,
        formatDuplicateMessage({
          issueNumber: duplicate.number,
          state: duplicate.state,
        }),
        dependencies,
      );
      return;
    }

    const issue = await createIssue(
      repoConfig,
      metadata?.title ?? parsedUrl.videoId,
      formatIssueBody({
        canonicalUrl: parsedUrl.canonicalUrl,
        rawUrl: parsedUrl.rawUrl,
        videoId: parsedUrl.videoId,
        title: metadata?.title ?? parsedUrl.videoId,
        channelName: metadata?.authorName,
        thumbnailUrl: metadata?.thumbnailUrl,
        collectedAt: dependencies.now().toISOString(),
        telegramMessage,
      }),
      dependencies.fetch,
    );

    if (config.githubProjectNumber) {
      try {
        await addIssueToProject(
          config.githubToken,
          config.githubOwner,
          config.githubProjectNumber,
          issue.nodeId,
          "To Watch",
          dependencies.fetch,
        );
      } catch (error) {
        dependencies.log.warn("Project V2 registration failed", error);
      }
    }

    await sendUserMessage(
      config.telegramBotToken,
      chatId,
      metadata?.title
        ? formatSuccessMessage(metadata.title, issue.number)
        : formatUrlOnlySuccessMessage(issue.number),
      dependencies,
    );
  } catch (error) {
    dependencies.log.error("Failed to process Telegram link", error);

    await sendUserMessage(
      config.telegramBotToken,
      chatId,
      formatGitHubErrorMessage(),
      dependencies,
    );
  }
}

async function sendUserMessage(
  botToken: string,
  chatId: string,
  text: string,
  dependencies: WorkerDependencies,
): Promise<void> {
  try {
    await sendTelegramMessage(botToken, chatId, text, dependencies.fetch);
  } catch (error) {
    dependencies.log.error("Failed to send Telegram message", error);
  }
}
