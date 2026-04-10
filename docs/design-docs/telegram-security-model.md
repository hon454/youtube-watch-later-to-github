# Telegram Security Model

## Trust boundaries

The Worker treats Telegram as a trusted sender only when two checks pass:

1. `X-Telegram-Bot-Api-Secret-Token` matches `TELEGRAM_WEBHOOK_SECRET`
2. the message chat ID matches `TELEGRAM_ALLOWED_CHAT_ID`

Both checks must pass before issue creation work is scheduled.

## Why both checks exist

- The webhook secret protects against arbitrary public requests to the Worker endpoint.
- The allowed chat ID prevents valid bot traffic from other chats from creating issues in the configured repository.

## Response behavior

- Invalid secret: return `403` and stop.
- Disallowed chat ID: return `403` and stop.
- Allowed chat with invalid or missing YouTube link: return `200` and send a Telegram error message.

## Operational notes

- Register the webhook with [scripts/setup-webhook.ts](/D:/youtube-watch-later-to-github/scripts/setup-webhook.ts) so the same secret is configured on both sides.
- Rotate the webhook secret and re-run the setup script if you suspect exposure.
