# Reliability

## Current phase

The repository now includes runtime code, tests, and GitHub Actions. Reliability work is no longer just planned; key protections are implemented.

## Implemented expectations

- Webhook handling acknowledges quickly and delegates background work via `ctx.waitUntil()`.
- Duplicate detection checks GitHub Search before issue creation.
- Project V2 failures do not block the core issue-creation path.
- Reminder formatting limits detail to five recent items and splits long Telegram messages.
- `GET /healthz` is available for local and deployed smoke checks.

## Automated checkpoints

- Unit coverage for YouTube parsing, Telegram parsing, duplicate detection, Project V2 payloads, and formatter edge cases
- Worker orchestration test covering accepted webhook flow and async follow-up behavior
- CI workflow that runs Worker type generation, `tsc --noEmit`, and Vitest

## Remaining gap

- There is no deployed smoke test yet for the live Worker endpoint.
- External API retries remain intentionally conservative and are limited to Telegram `sendMessage`.
- Project V2 item lookup currently scans the first 100 project items, which is acceptable for the single-user v1 template but not intended as a multi-tenant scaling strategy.
