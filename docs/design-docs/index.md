# Design Docs Index

## Purpose

This directory stores durable design decisions that agents and contributors can discover incrementally. Keep each document narrow and easy to scan.

## Current docs

- [Harness foundations](./harness-foundations.md): repository-level harnessing principles for the pre-scaffold phase
- [Worker request lifecycle](./worker-request-lifecycle.md): request routing and `ctx.waitUntil()` behavior in the Worker runtime
- [Telegram security model](./telegram-security-model.md): webhook secret and allowed-chat enforcement rules

## Planned additions

Add focused design docs here as implementation starts, for example:

- GitHub integration boundaries
- Reminder delivery behavior
- Failure handling and fallback rules
