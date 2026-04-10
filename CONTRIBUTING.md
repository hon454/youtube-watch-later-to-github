# Contributing

## Current phase

This repository is still in a documentation-first stage. Before adding implementation code, check any active design or planning docs and keep changes aligned with the current phase.

## Working principles

- Prefer small, reviewable changes over broad refactors.
- Keep the repository friendly to first-time contributors.
- Record new canonical commands only after verifying them locally.
- Update user-facing docs whenever behavior or setup changes.
- Do not introduce undocumented environment variables, scripts, or workflows.
- Do not commit secrets or machine-specific credentials.

## Conventional Commits

Use Conventional Commits for every commit. Commit subjects must be in English.

Recommended format:

```text
<type>(<optional-scope>): <short imperative summary>
```

Examples:

```text
feat(worker): add Telegram webhook handler
docs(agents): add shared agent operating guide
chore(ci): add vitest workflow
fix(youtube): normalize shorts URLs
```

Recommended types:

- `feat`: user-facing functionality
- `fix`: bug fixes
- `docs`: documentation-only changes
- `refactor`: internal code changes without behavior change
- `test`: test additions or updates
- `chore`: tooling, maintenance, or repository housekeeping
- `ci`: CI workflow changes
- `build`: packaging or build-system changes

## Pull request expectations

- Keep the title aligned with the main change.
- Explain why the change exists, not just what changed.
- Mention test coverage or explain why tests were not run.
- Call out any follow-up work or known limitations.

## Documentation expectations

When you change repository behavior, update the relevant docs in the same change:

- `AGENTS.md` for shared agent operating rules
- `CONTRIBUTING.md` for contributor workflow
- `docs/development.md` for verified commands
- `README.md` for user-facing setup or project overview
