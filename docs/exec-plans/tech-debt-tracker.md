# Tech Debt Tracker

## Purpose

Track known gaps that matter to harnessing and implementation readiness.

## Current items

| ID | Gap | Impact | Suggested next step |
| --- | --- | --- | --- |
| HD-001 | No application scaffold exists yet | blocks verified install, dev, test, and deploy commands | add Worker scaffold and record successful commands |
| HD-002 | No automated doc validation or CI guardrails exist | repo rules may drift as files multiply | add lightweight checks after build/test tooling exists |
| HD-003 | No test harness exists for webhook, duplicate detection, or reminder formatting | reliability claims cannot be verified | scaffold Vitest and Miniflare per the product plan |
| HD-004 | Main product execution plan lives in `.omc/` instead of `docs/exec-plans/` | plan discovery is split across locations | migrate or mirror active implementation plans when scaffolding starts |
