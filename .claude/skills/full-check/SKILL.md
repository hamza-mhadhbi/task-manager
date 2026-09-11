---
name: full-check
description: Run the full local quality gate (lint, format check, unit tests with coverage, e2e tests, build) in sequence and report a clear pass/fail summary per step. Use before committing/pushing, or whenever asked to verify the repo is healthy.
allowed-tools: Bash
---

Run these steps in order, in `${CLAUDE_PROJECT_DIR}`, stopping to report
clearly (don't silently continue past a failure without flagging it):

1. `npm run lint`
2. `npm run format:check`
3. `npm run test:cov` (unit tests; this also enforces the 70% per-file
   coverage threshold on `**/*.service.ts` and `**/*.pipe.ts` — see
   [CLAUDE.md](${CLAUDE_PROJECT_DIR}/CLAUDE.md))
4. `npm run test:e2e` (only if a test database is reachable — if it fails to
   connect rather than failing assertions, say so explicitly rather than
   reporting it as a test failure)
5. `npm run build`

At the end, output a compact summary table: step name → pass/fail, and for
any failure, the specific error (not the full raw log) plus a one-line
diagnosis if obvious. This mirrors what a CI/PR gate and the `pre-commit`/
`pre-push` husky hooks would check, so it's meant to be run before pushing —
don't fix failures automatically unless asked, just report them (see
CLAUDE.md's "flag issues only, let you decide" review style).
