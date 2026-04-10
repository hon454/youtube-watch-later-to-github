# youtube-watch-later-to-github

Cloudflare Workers template that turns YouTube links shared from Telegram into GitHub issues.

## What it does

- Accepts `POST /telegram/webhook` updates from Telegram
- Verifies the Telegram webhook secret and allowed chat ID
- Normalizes YouTube URLs and extracts the video ID
- Fetches YouTube oEmbed metadata when available
- Detects duplicates before creating a new issue
- Creates a `watch-later` issue in GitHub
- Optionally adds the issue to GitHub Project V2 with `Status = To Watch`
- Sends a Telegram confirmation or error message back to the user
- Includes GitHub Actions for daily reminders and issue close/reopen sync

## Routes

- `GET /healthz`
- `POST /telegram/webhook`

## Required environment variables

Put Worker secrets in `.dev.vars` for local development and `wrangler secret put` for deployment.

| Variable | Required | Description |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Shared secret validated from `X-Telegram-Bot-Api-Secret-Token` |
| `TELEGRAM_ALLOWED_CHAT_ID` | Yes | Only this Telegram chat ID is allowed to create issues |
| `GITHUB_TOKEN` | Yes | GitHub PAT with `repo` scope |
| `GITHUB_OWNER` | Yes | GitHub user or organization name |
| `GITHUB_REPO` | Yes | Target repository name |
| `GITHUB_PROJECT_NUMBER` | No | Project V2 number to enable optional board sync |

Reference files:

- [.dev.vars.example](/D:/youtube-watch-later-to-github/.dev.vars.example)
- [.env.example](/D:/youtube-watch-later-to-github/.env.example)

## Local setup

1. Copy [.dev.vars.example](/D:/youtube-watch-later-to-github/.dev.vars.example) to `.dev.vars` and fill in your secrets.
2. Install dependencies with `npm install`.
3. Generate runtime types with `npm run cf-typegen`.
4. Start the Worker locally with `npm run dev`.
5. Confirm the Worker is healthy at `http://127.0.0.1:8787/healthz`.

Verified local commands are tracked in [docs/development.md](/D:/youtube-watch-later-to-github/docs/development.md).

## Deployment flow

1. Authenticate Wrangler with your Cloudflare account.
2. Deploy the Worker with `npm run deploy`.
3. Register the Telegram webhook with `npm run setup:webhook`.

The webhook setup script expects:

- `PUBLIC_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

## Optional Project V2 setup

Set `GITHUB_PROJECT_NUMBER` to enable Project V2 integration. The Worker looks up the project and status field at runtime.

Use `npm run setup:project` to confirm that the configured project exposes:

- a `Status` single-select field
- a `To Watch` option
- a `Done` option

## GitHub Actions

This repository ships with three workflows:

- [ci.yml](/D:/youtube-watch-later-to-github/.github/workflows/ci.yml): generates Worker types, type-checks, and runs Vitest
- [daily-reminder.yml](/D:/youtube-watch-later-to-github/.github/workflows/daily-reminder.yml): sends a daily Telegram summary of open `watch-later` issues
- [issue-sync.yml](/D:/youtube-watch-later-to-github/.github/workflows/issue-sync.yml): syncs Project V2 status on issue close or reopen

GitHub Actions secrets:

- `GH_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GITHUB_PROJECT_NUMBER` for optional Project V2 sync

## Tests

- `npm run check`
- `npm test`

Current coverage includes:

- YouTube URL parsing and oEmbed fallback behavior
- Telegram update parsing and webhook secret validation
- GitHub duplicate detection and issue creation payloads
- Project V2 add/update mutations
- Reminder formatting and Telegram message splitting
- Worker orchestration with `ctx.waitUntil()`

## Repository docs

- [Implementation plan](/D:/youtube-watch-later-to-github/.omc/plans/yt-to-issue-v1-revised.md)
- [Agent instructions](/D:/youtube-watch-later-to-github/AGENTS.md)
- [Architecture map](/D:/youtube-watch-later-to-github/ARCHITECTURE.md)
- [Design docs index](/D:/youtube-watch-later-to-github/docs/design-docs/index.md)
- [Plan index](/D:/youtube-watch-later-to-github/docs/PLANS.md)
- [Quality snapshot](/D:/youtube-watch-later-to-github/docs/QUALITY_SCORE.md)
- [Reliability expectations](/D:/youtube-watch-later-to-github/docs/RELIABILITY.md)
- [Security baseline](/D:/youtube-watch-later-to-github/docs/SECURITY.md)
- [Contribution guide](/D:/youtube-watch-later-to-github/CONTRIBUTING.md)
- [Development commands](/D:/youtube-watch-later-to-github/docs/development.md)
