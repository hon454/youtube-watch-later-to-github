import { z } from "zod";

const optionalProjectNumberSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().regex(/^\d+$/).optional(),
);

const workerEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  TELEGRAM_ALLOWED_CHAT_ID: z.string().regex(/^-?\d+$/),
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_OWNER: z.string().min(1),
  GITHUB_REPO: z.string().min(1),
  GITHUB_PROJECT_NUMBER: optionalProjectNumberSchema,
});

export interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TELEGRAM_ALLOWED_CHAT_ID?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_PROJECT_NUMBER?: string;
}

export interface AppConfig {
  telegramBotToken: string;
  telegramWebhookSecret: string;
  telegramAllowedChatId: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubProjectNumber?: number;
}

export interface GitHubRepoConfig {
  token: string;
  owner: string;
  repo: string;
}

export function loadWorkerConfig(env: Env): AppConfig {
  const parsed = workerEnvSchema.parse(env);

  return {
    telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: parsed.TELEGRAM_WEBHOOK_SECRET,
    telegramAllowedChatId: parsed.TELEGRAM_ALLOWED_CHAT_ID,
    githubToken: parsed.GITHUB_TOKEN,
    githubOwner: parsed.GITHUB_OWNER,
    githubRepo: parsed.GITHUB_REPO,
    githubProjectNumber: parsed.GITHUB_PROJECT_NUMBER
      ? Number(parsed.GITHUB_PROJECT_NUMBER)
      : undefined,
  };
}

export function getGitHubRepoConfig(
  config: Pick<AppConfig, "githubToken" | "githubOwner" | "githubRepo">,
): GitHubRepoConfig {
  return {
    token: config.githubToken,
    owner: config.githubOwner,
    repo: config.githubRepo,
  };
}
