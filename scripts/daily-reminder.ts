import { z } from "zod";
import { getGitHubRepoConfig } from "../src/config.js";
import { formatReminderMessages } from "../src/formatters.js";
import { listOpenWatchLaterIssues } from "../src/github/issues.js";
import { sendTelegramMessage } from "../src/telegram.js";

const envSchema = z.object({
  GITHUB_OWNER: z.string().min(1),
  GITHUB_REPO: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().regex(/^-?\d+$/),
  GITHUB_TOKEN: z.string().min(1).optional(),
  GH_TOKEN: z.string().min(1).optional(),
});

async function main(): Promise<void> {
  const env = envSchema.parse(process.env);
  const githubToken = env.GITHUB_TOKEN ?? env.GH_TOKEN;

  if (!githubToken) {
    throw new Error("Set GITHUB_TOKEN or GH_TOKEN before running the reminder script");
  }

  const repoConfig = getGitHubRepoConfig({
    githubToken,
    githubOwner: env.GITHUB_OWNER,
    githubRepo: env.GITHUB_REPO,
  });
  const issues = await listOpenWatchLaterIssues(repoConfig);
  const messages = formatReminderMessages(
    issues,
    `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
    `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
  );

  for (const message of messages) {
    await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, message);
  }

  console.log(`Sent ${messages.length} reminder message(s) for ${issues.length} open issue(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
