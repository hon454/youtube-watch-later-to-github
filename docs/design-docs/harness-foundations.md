# Harness Foundations

## Status

Proposed and adopted for the current documentation-first phase on 2026-04-10.

## Why this exists

The repository already has a product plan, but it did not yet have a dedicated harness-oriented documentation shape. This document defines the minimum harness scaffolding that helps agents and contributors operate without relying on hidden context.

## Core principles

- `AGENTS.md` should stay short and work as a navigation map.
- Durable knowledge belongs in versioned markdown inside the repository.
- Verified commands should live in one place and remain conservative until scaffolding exists.
- Execution plans should be easy to find, categorized by state, and linked from a single index.
- Quality, reliability, and security expectations should exist before the first implementation files appear.

## What "harness" means in this repository right now

At the current phase, harnessing means making the repository operable for future agent and contributor work, not shipping runtime automation yet. The immediate goal is to provide:

- clear entrypoints for architecture and plans
- a visible backlog of known gaps
- places to record future acceptance loops and guardrails
- a way to evolve docs into automated checks once code exists

## Immediate constraints

- Do not invent application commands that have not been run successfully here.
- Do not imply test harness coverage that does not exist yet.
- Do not bury important decisions in hidden directories or chat-only context.
- Keep the scaffolding small enough to remain credible in a pre-scaffold repository.

## Follow-up triggers

When application scaffolding begins, strengthen this harness by adding:

- verified install, dev, lint, test, and deploy commands in `docs/development.md`
- concrete execution plans under `docs/exec-plans/`
- automated doc or structural checks in CI
- runtime smoke checks and test fixtures aligned with the Worker entrypoints
