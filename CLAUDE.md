# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

A "mini personal Trello" task management API. Each `USER` manages their own
tasks; an `ADMIN` can see and manage tasks across all users.

**Stack:** NestJS, TypeScript (ESM, `type: "module"`), MySQL via TypeORM, JWT
auth (`passport-jwt`), class-validator + a custom AJV JSON-Schema pipe,
Vitest, Docker.

The full requirements (data model, endpoints, guards, interceptors,
required tests, Docker/Renovate deliverables) live in
[STATEMENT.md](STATEMENT.md) — treat it as the source of truth; this file
only summarizes it and adds conventions/workflow.

### Condensed architecture (see STATEMENT.md for full detail)

```
src/
├── auth/            # JWT strategy, guards, decorators (@Public, @Roles)
├── users/           # module, controller, service, repository, entity
├── tasks/           # module, controller, service, repository, entity
├── common/
│   ├── config/                              # e.g. db.config.ts (registerAs)
│   ├── filters/http-exception.filter.ts     # APP_FILTER, standardizes errors
│   ├── interceptors/logging.interceptor.ts
│   ├── interceptors/transform-response.interceptor.ts
│   ├── middlewares/request-logger.middleware.ts
│   ├── pipes/json-schema-validation.pipe.ts
│   └── schemas/create-task.schema.json
```

### Data model

- `User`: id (uuid), email (unique), password (bcrypt, never returned),
  fullName, role (`USER`|`ADMIN`, default `USER`), timestamps.
- `Task`: id (uuid), title, description, status
  (`TODO`|`IN_PROGRESS`|`DONE`), priority (`LOW`|`MEDIUM`|`HIGH`), dueDate,
  ownerId (FK → User), timestamps. One `User` has many `Task`.

### Environment variables

See [VARIABLES.md](VARIABLES.md). Loaded from `.env` / `.env.local` via
`@nestjs/config` (`ConfigModule.forRoot`).

## Conventions

- **ESM + TypeScript**: local imports use an explicit `.js` extension (e.g.
  `import { User } from './user.entity.js'`), matching `"type": "module"`.
  Follow this pattern in every new file.
- **Formatting**: Prettier (`.prettierrc`: single quotes, trailing commas
  everywhere). Run `npm run format` to fix, `npm run format:check` to verify.
- **Linting**: oxlint (`oxlint.json`). Run `npm run lint`.
- **Modules**: one Nest module per resource (`users/`, `tasks/`, `auth/`),
  each with its own controller/service/repository/entity, mirroring the
  existing `users/user.module.ts` / `users/user.entity.ts` layout.
- **Repositories**: services must go through a dedicated repository
  (custom repository pattern or `extends Repository`) — never manipulate
  TypeORM's `QueryBuilder` directly from a service (STATEMENT.md §11).
- **Config**: environment-driven config lives in `common/config/*.config.ts`
  using `registerAs`, following `db.config.ts`.
- **Migrations**: use TypeORM migrations, never `synchronize: true` outside
  local dev. See the `typeorm-migration` skill.

## Testing

- **Runner is Vitest, not Jest** — STATEMENT.md says "Jest" but the actual
  tooling (`package.json`, `vitest.config.ts`) is Vitest. Follow Vitest
  syntax/APIs (`vi.fn()`, `vi.mock()`, etc.), not Jest's.
- Unit tests: colocated `*.spec.ts` next to the file under test, run via
  `npm run test` / `npm run test:watch`.
- E2E tests: `test/*.e2e-spec.ts`, run via `npm run test:e2e` (separate
  Vitest config, `vitest.config.e2e.ts`), using a dedicated/reset MySQL test
  database.
- Coverage: `npm run test:cov`. A **70% threshold (statements/branches/
  functions/lines) is enforced per-file on `**/*.service.ts` and
  `**/*.pipe.ts`** via `vitest.config.ts` — matches STATEMENT.md §12. This
  runs automatically on `git push` (see Git hooks below); expect it to start
  failing loudly as soon as an under-tested service/pipe is added, by design.

## Git workflow

- **Branches**: `feature/<name>` for new functionality, `chore/<name>` for
  tooling/config, off `develop` (not `main`) unless told otherwise.
- **Commits**: Conventional Commits style, matching existing history:
  `type(scope): description` — e.g. `feat(tasks): add create endpoint`,
  `fix(auth): reject expired tokens`, `chore: update gitignore`,
  `test(users): cover duplicate email case`. Common types: `feat`, `fix`,
  `chore`, `test`, `refactor`, `docs`.
- **Git hooks (husky)**:
  - `pre-commit`: `npm run lint` + `npm run format:check` (whole repo, not
    just staged files).
  - `pre-push`: `npm run test:cov` (fails if the per-file service/pipe
    coverage threshold above isn't met, or any test fails).
  - Never bypass these with `--no-verify` without asking first.

## How to work with Hamza on this repo

- **Be cautious by default**: confirm before non-trivial actions (schema
  changes, new dependencies, config changes, anything beyond a small/obvious
  fix), not just for the standard destructive-git-operation cases.
- **Code review**: flag issues (bugs, NestJS/TypeORM anti-patterns, security
  gaps) but don't rewrite code unless asked — this is a learning exercise,
  he wants to make the fix himself unless he explicitly asks you to.
- **Language**: converse with Hamza in French. Everything written to the
  repo — `.md` files, code, variable/function names, scripts, commit
  messages, code comments — stays in English, no exceptions.
- Treat STATEMENT.md as the graded spec — when in doubt about a requirement
  (endpoint shape, status code, validation rule), check it before guessing.
