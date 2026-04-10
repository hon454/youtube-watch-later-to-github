# Security

## Baseline rules

- Never commit secrets, tokens, `.dev.vars`, or account-specific IDs.
- Keep required secrets documented, but store actual values outside the repository.
- Minimize GitHub token permissions to the scopes required by the chosen feature set.
- Verify Telegram webhook authenticity before processing updates.
- Restrict message handling to the configured allowed chat.

## Planned security checkpoints

- document all required environment variables before runtime scaffolding lands
- verify webhook secret handling in tests once a test harness exists
- keep optional GitHub Project V2 permissions separate from the required path
- review any scheduled automation for secret exposure or over-broad access

## Current limitation

Security requirements are documented, but no enforcement code or automated checks exist yet.
