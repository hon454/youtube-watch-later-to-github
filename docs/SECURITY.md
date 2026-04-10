# Security

## Baseline rules

- Never commit secrets, tokens, `.dev.vars`, or account-specific IDs.
- Keep required secrets documented, but store actual values outside the repository.
- Minimize GitHub token permissions to the scopes required by the chosen feature set.
- Verify Telegram webhook authenticity before processing updates.
- Restrict message handling to the configured allowed chat.

## Implemented controls

- The Worker validates `X-Telegram-Bot-Api-Secret-Token` before processing webhook payloads.
- The Worker rejects updates from chats other than `TELEGRAM_ALLOWED_CHAT_ID`.
- Local secret files are ignored in [.gitignore](/D:/youtube-watch-later-to-github/.gitignore).
- Project V2 integration remains optional behind `GITHUB_PROJECT_NUMBER`.
- Webhook secret validation is covered by tests.

## Secret inventory

Worker runtime:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_ALLOWED_CHAT_ID`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_PROJECT_NUMBER` optional

GitHub Actions:

- `GH_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GITHUB_PROJECT_NUMBER` optional

## Current limitation

- GitHub token scope enforcement is documented but not programmatically validated.
- The scheduled workflows assume repository secrets are configured correctly; they do not self-heal missing secrets.
