# Architecture

## Status

As of 2026-04-10, the repository contains a runnable Cloudflare Worker scaffold, setup scripts, automated tests, and CI workflows aligned with the v1 implementation plan.

## System intent

The project provides an open-source template that turns YouTube links shared from Telegram into GitHub issues, with Cloudflare Workers handling ingestion and orchestration.

## Runtime flow

1. Telegram sends a webhook update to `POST /telegram/webhook`.
2. The Worker validates the Telegram secret token header.
3. The Worker extracts the message context and verifies the configured chat ID.
4. The Worker parses and normalizes the YouTube URL.
5. The Worker returns `200 Accepted` quickly and continues background processing with `ctx.waitUntil()`.
6. The background task fetches YouTube oEmbed metadata when available.
7. The Worker searches GitHub for an existing matching `watch-later` issue.
8. The Worker creates a new issue when no duplicate exists.
9. The Worker optionally adds the issue to GitHub Project V2 and sets `Status = To Watch`.
10. The Worker sends a Telegram confirmation or error message back to the user.

## Implemented code boundaries

- [src/config.ts](/D:/youtube-watch-later-to-github/src/config.ts): environment parsing and typed configuration
- [src/telegram.ts](/D:/youtube-watch-later-to-github/src/telegram.ts): webhook verification, update parsing, and Telegram messaging
- [src/youtube.ts](/D:/youtube-watch-later-to-github/src/youtube.ts): YouTube URL parsing and oEmbed lookup
- [src/github/issues.ts](/D:/youtube-watch-later-to-github/src/github/issues.ts): duplicate detection, label management, issue creation, reminder listing
- [src/github/project.ts](/D:/youtube-watch-later-to-github/src/github/project.ts): optional Project V2 lookup and status mutations
- [src/formatters.ts](/D:/youtube-watch-later-to-github/src/formatters.ts): issue body and reminder formatting
- [src/index.ts](/D:/youtube-watch-later-to-github/src/index.ts): route handling and orchestration

## Automation surfaces

- [scripts/setup-webhook.ts](/D:/youtube-watch-later-to-github/scripts/setup-webhook.ts): registers the Telegram webhook with `secret_token`
- [scripts/setup-project.ts](/D:/youtube-watch-later-to-github/scripts/setup-project.ts): validates Project V2 configuration
- [scripts/daily-reminder.ts](/D:/youtube-watch-later-to-github/scripts/daily-reminder.ts): sends daily Telegram reminders
- [scripts/sync-project-status.ts](/D:/youtube-watch-later-to-github/scripts/sync-project-status.ts): syncs Project V2 status after issue close or reopen

## Reliability and enforcement surfaces

- [test](/D:/youtube-watch-later-to-github/test): unit and orchestration coverage for critical paths
- [worker-configuration.d.ts](/D:/youtube-watch-later-to-github/worker-configuration.d.ts): generated Cloudflare runtime types
- [ci.yml](/D:/youtube-watch-later-to-github/.github/workflows/ci.yml): type generation, type-checking, and Vitest on push and pull request
- [daily-reminder.yml](/D:/youtube-watch-later-to-github/.github/workflows/daily-reminder.yml): scheduled reminder delivery
- [issue-sync.yml](/D:/youtube-watch-later-to-github/.github/workflows/issue-sync.yml): Project V2 status sync

## Architecture rules

- Keep boundaries explicit and boring. Prefer narrow modules over clever abstractions.
- Treat Telegram, YouTube, and GitHub as fault-prone boundaries with validation and fallback behavior.
- Keep Project V2 optional so the required path still works with issue-only tracking.
- Update docs together with code when routes, commands, or operational behavior change.
