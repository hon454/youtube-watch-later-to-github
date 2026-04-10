# youtube-watch-later-to-github

An open-source Cloudflare Workers template that turns YouTube links shared from Telegram into GitHub issues.

This project is for people who want a simple "send it now, watch it later" workflow without running a full app backend. Share a YouTube link in Telegram, and the Worker turns it into a tracked item in GitHub with optional Project V2 sync and daily reminders.

## Why use this template

- Capture videos from Telegram without copy-pasting into GitHub manually
- Keep your watch-later queue in plain GitHub issues
- Avoid duplicate entries for the same YouTube video
- Optionally manage progress in GitHub Project V2
- Get daily Telegram reminders from GitHub Actions

## Who this is for

This repository fits best if you want a self-hosted personal workflow or a small shared setup:

- one Telegram bot
- one allowed Telegram chat
- one target GitHub repository
- Cloudflare Workers for deployment

It is not designed as a multi-user SaaS service.

## How it works

1. Telegram sends a webhook update to the Worker.
2. The Worker verifies the webhook secret and allowed chat ID.
3. The Worker normalizes the YouTube URL, fetches metadata when possible, and checks for duplicates.
4. The Worker creates a `watch-later` issue in GitHub.
5. If configured, the issue is also added to GitHub Project V2 with `Status = To Watch`.
6. Telegram receives a success, duplicate, or error message.

## Features

- `POST /telegram/webhook` to ingest Telegram updates
- `GET /healthz` for deployment and local health checks
- Telegram webhook secret validation
- Allowed chat ID restriction
- YouTube URL normalization for common link formats
- YouTube oEmbed metadata lookup with fallback behavior
- Duplicate detection before issue creation
- Optional GitHub Project V2 sync
- Daily reminder and issue status sync GitHub Actions workflows

## Quick start

### Prerequisites

- Node.js 20 or newer
- An active Cloudflare account with Wrangler configured
- A Telegram bot token
- A GitHub personal access token for the target repository

If you plan to use GitHub Project V2, make sure the token also has the required project access.

### 1. Fork and install

```bash
npm install
```

### 2. Configure local secrets

Use the example files as your starting point:

- [`.dev.vars.example`](./.dev.vars.example) for Worker-local development
- [`.env.example`](./.env.example) for setup scripts and GitHub Actions-style local runs

Required variables:

| Variable | Required | Description |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Secret validated from `X-Telegram-Bot-Api-Secret-Token` |
| `TELEGRAM_ALLOWED_CHAT_ID` | Yes | Only this Telegram chat ID can create issues |
| `GITHUB_TOKEN` | Yes | GitHub token for issue creation |
| `GITHUB_OWNER` | Yes | GitHub user or organization name |
| `GITHUB_REPO` | Yes | Target repository name |
| `GITHUB_PROJECT_NUMBER` | No | Enables optional Project V2 sync |

### 3. Generate Worker types

```bash
npm run cf-typegen
```

### 4. Run locally

```bash
npm run dev
```

Then confirm the Worker is healthy at `http://127.0.0.1:8787/healthz`.

Verified local development commands are tracked in [`docs/development.md`](./docs/development.md).

## Deployment

The repository includes scripts for deployment and setup:

- `npm run deploy` to publish the Worker
- `npm run setup:webhook` to register the Telegram webhook
- `npm run setup:project` to validate optional Project V2 configuration

For webhook setup, provide:

- `PUBLIC_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

For production, keep Worker secrets in Cloudflare rather than local files.

## GitHub Project V2 support

Project integration is optional. If you set `GITHUB_PROJECT_NUMBER`, the Worker will try to:

- add newly created issues to the project
- set `Status = To Watch` on create
- support `Done` sync when issues are closed

The target project should expose a `Status` single-select field with at least `To Watch` and `Done`.

## Included GitHub Actions

This repository ships with three workflows:

- [`ci.yml`](./.github/workflows/ci.yml) for type generation, type-checking, and tests
- [`daily-reminder.yml`](./.github/workflows/daily-reminder.yml) for Telegram watch-later reminders
- [`issue-sync.yml`](./.github/workflows/issue-sync.yml) for Project V2 close and reopen sync

GitHub Actions secrets:

- `GH_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GITHUB_PROJECT_NUMBER` for optional Project V2 sync

## Development and testing

Use the verified local commands below:

```bash
npm run check
npm test
```

Coverage currently includes YouTube parsing, Telegram validation, duplicate detection, GitHub issue creation, Project V2 mutations, reminder formatting, and Worker orchestration.

## Contributing

Issues and pull requests are welcome. For contributor workflow and repository conventions, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Project docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`docs/development.md`](./docs/development.md)
- [`docs/design-docs/index.md`](./docs/design-docs/index.md)
- [`docs/SECURITY.md`](./docs/SECURITY.md)
- [`docs/RELIABILITY.md`](./docs/RELIABILITY.md)

## License

[MIT](./LICENSE)
