# AGENTS.md

## Purpose

This file is the root operating manual for coding agents and contributors working in this repository.

## Project status

- Repository phase: pre-scaffold, documentation-first.
- Contributor workflow: `CONTRIBUTING.md`
- Verified development commands: `docs/development.md`

## Source of truth

Use the following priority order when instructions overlap:

1. Direct user or maintainer instructions
2. `AGENTS.md`
3. `docs/development.md`
4. `README.md`

If two sources disagree, follow the higher-priority source and update the stale document in the same change when practical.

## Working rules

- Check active design or planning docs when a task depends on project-specific decisions.
- Do not invent build, run, test, or debug commands before they have been scaffolded and verified in this repository.
- Use `npm` as the default package manager unless the repository later adopts another tool explicitly.
- Prefer mainstream, low-friction tooling that is easy for open-source contributors to run on Windows, macOS, and Linux.
- Keep changes small, legible, and aligned with the current implementation phase.
- Update docs together with code whenever behavior, commands, architecture, or workflow changes.
- Never commit secrets, tokens, `.dev.vars`, or account-specific IDs.
- Prefer explicit, boring abstractions over cleverness. Optimize for readability and agent legibility.
- When a task depends on missing scaffolding, document the gap instead of inventing conventions.

## Commands

- Canonical development commands live in `docs/development.md`.
- Only add a command there after running it successfully in this repository.
- If a documented command stops working, fix the command or update the doc in the same change.

## Git workflow

- Follow Conventional Commits.
- Commit subjects must be written in English.
- Prefer one focused change per commit.
- Keep branches and pull requests narrow enough for quick review.
- Before merging, make sure docs and examples still match the current repository state.

## Definition of done

- Code, tests, and docs are updated together when all three are relevant.
- Verified commands are documented if they changed.
- New behavior has tests when a fitting test harness exists.
- The repo remains understandable to a new contributor without out-of-band context.
