# Reliability

## Current phase

This repository does not yet have runtime code, so reliability work is currently about preserving correct future behavior through plans, boundaries, and visible constraints.

## Baseline expectations

- Webhook handling must prefer fast acknowledgement and background work where appropriate.
- Duplicate detection should protect against accidental issue spam.
- Optional integrations must fail without breaking the core issue-creation path.
- Reminder delivery must account for Telegram message size limits.
- Reliability claims should not appear in docs until they are backed by verified behavior.

## Reliability checkpoints to add after scaffolding

- unit tests for URL parsing, duplicate detection, and formatter edge cases
- integration tests for webhook request flow
- smoke validation for `GET /healthz`
- CI coverage for the primary happy path and critical fallbacks

## Current gap

None of the checkpoints above are automated yet. Treat this document as a contract for future implementation, not as proof of existing coverage.
