---
name: typeorm-migration
description: Generate a new TypeORM migration from current entity changes, or scaffold the TypeORM CLI DataSource config if it doesn't exist yet. Use whenever an entity changes and a versioned migration is needed (STATEMENT.md requires migrations, not synchronize:true, outside local dev).
argument-hint: <migration-name> (e.g. "AddTaskTable")
---

Goal: produce a versioned TypeORM migration for the current entity state,
per [STATEMENT.md](${CLAUDE_PROJECT_DIR}/STATEMENT.md) §11 ("use TypeORM
migrations; no `synchronize: true` in the production environment").

1. Check whether a TypeORM CLI `DataSource` file already exists (commonly
   `src/common/config/data-source.ts` or similar — search for
   `new DataSource(` under `src/`). The app currently only has
   `TypeOrmModuleAsyncOptions` via `registerAs` in
   `src/common/config/db.config.ts`, which the CLI *cannot* use directly —
   it needs a plain `DataSource` instance exported from a `.ts` file.

2. If it doesn't exist, create one (e.g.
   `src/common/config/typeorm-cli.data-source.ts`) that:
   - Reuses the same env vars as `db.config.ts` (`DB_TYPE`, `DB_USERNAME`,
     `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) for consistency — don't duplicate
     defaults that could drift from `db.config.ts`.
   - Sets `entities` to glob the compiled/ts entities and `migrations` to a
     `src/migrations/*.ts` (or `migrations/`) directory.
   - Sets `synchronize: false` explicitly.
   - Add an npm script, e.g.
     `"typeorm": "typeorm-ts-node-esm -d src/common/config/typeorm-cli.data-source.ts"`
     (adjust the runner for this project's ESM + TS setup — check what's
     already available, e.g. `tsx`, before assuming `ts-node`).
   Confirm this setup with the user before adding new devDependencies.

3. Generate the migration:
   `npm run typeorm -- migration:generate src/migrations/$0`
   (or the equivalent via whatever script/runner ends up configured in step
   2). Show the generated SQL to the user before considering the task done —
   TypeORM's auto-generated migrations can include destructive statements
   (drops/renames misdetected as drop+create) that need a human check,
   especially for column renames.

4. Remind the user: never rely on `synchronize: true` once migrations are in
   use, including in local dev if that dev database's data matters — keep
   both in sync deliberately, and re-run `migration:generate` whenever an
   entity changes rather than editing the DB by hand.
