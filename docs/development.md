# Development

## Status

As of 2026-04-10, the Cloudflare Worker scaffold, Vitest suite, and GitHub Actions workflows are present in this repository.

This document remains intentionally conservative. Only commands that were executed successfully in this repository are listed below.

## Verification rule

Before adding or editing a canonical command in this file:

1. Run it locally in this repository.
2. Confirm the expected outcome.
3. Update this document in the same change.

## Verified commands

### Install dependencies

```bash
npm install
```

### Generate Cloudflare runtime types

```bash
npm run cf-typegen
```

This generates [worker-configuration.d.ts](/D:/youtube-watch-later-to-github/worker-configuration.d.ts). Rerun it after changing [wrangler.toml](/D:/youtube-watch-later-to-github/wrangler.toml).

### Run the local Worker

```bash
npm run dev
```

Verified by starting the Worker locally and confirming `GET /healthz` returned `{"ok":true}`.

### Type-check the project

```bash
npm run check
```

### Run tests

```bash
npm test
```

## Local secrets

- Copy [.dev.vars.example](/D:/youtube-watch-later-to-github/.dev.vars.example) to `.dev.vars` for Worker development.
- Use [.env.example](/D:/youtube-watch-later-to-github/.env.example) for setup scripts and GitHub Actions-style local runs.
- Never commit `.dev.vars`, `.env`, tokens, or account-specific IDs.
