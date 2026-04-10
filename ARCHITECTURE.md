# Architecture

## Status

As of 2026-04-10, this repository is still pre-scaffold. This document describes the intended system map and the repository-level harness surfaces that should exist before and during implementation.

## System intent

The project aims to provide an open-source template that turns shared YouTube links into GitHub issues, with Telegram as the ingestion channel and Cloudflare Workers as the runtime.

## Planned product flow

1. Telegram sends a webhook update containing a shared YouTube link.
2. The Worker validates request authenticity and allowed chat scope.
3. The Worker normalizes the YouTube URL and derives a video ID.
4. The Worker fetches metadata from YouTube oEmbed when available.
5. The Worker searches GitHub for an existing matching issue.
6. The Worker creates a new GitHub issue or reports the duplicate.
7. The Worker optionally adds the issue to GitHub Project V2.
8. A scheduled reminder flow summarizes open watch-later issues back to Telegram.

## Planned code boundaries

The current implementation plan in [.omc/plans/yt-to-issue-v1-revised.md](./.omc/plans/yt-to-issue-v1-revised.md) suggests the following modules once scaffolding begins:

- `config`: environment parsing, validation, and typed access
- `telegram`: webhook verification, update parsing, and user-facing responses
- `youtube`: URL normalization, video ID extraction, and oEmbed lookup
- `github/issues`: duplicate detection and issue creation
- `github/project`: optional Project V2 lookup and mutations
- `formatters`: issue body and reminder message formatting
- Worker entrypoint: routing, orchestration, and `ctx.waitUntil()` usage

## Harness surfaces

Before full application code exists, the repository should make the following harness surfaces explicit:

- Source-of-truth docs for architecture, plans, quality, reliability, and security
- A clear distinction between active plans, completed plans, and known tech debt
- A place to capture agent-readable design decisions instead of leaving them in chat
- A stable record of verified development commands, kept separate from proposed commands
- Future room for automated checks once scaffolding exists: tests, doc validation, CI, and smoke verification

## Near-term architecture rules

- Keep boundaries explicit and boring. Prefer modules with narrow responsibilities over clever abstractions.
- Treat external APIs as boundaries that need validation and fallback behavior.
- Keep optional integrations, such as GitHub Project V2, isolated from the required path.
- Encode durable decisions in versioned markdown before depending on memory or chat history.
- Add enforcement gradually. Document first, then automate once build and test scaffolding exist.
