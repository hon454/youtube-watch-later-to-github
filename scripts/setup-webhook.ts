import { z } from "zod";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  PUBLIC_WEBHOOK_URL: z.string().url(),
});

async function main(): Promise<void> {
  const env = envSchema.parse(process.env);
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: env.PUBLIC_WEBHOOK_URL,
        secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram setWebhook failed: ${response.status} ${await response.text()}`);
  }

  console.log(`Webhook registered for ${env.PUBLIC_WEBHOOK_URL}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
