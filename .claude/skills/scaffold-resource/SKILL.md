---
name: scaffold-resource
description: Scaffold a new NestJS resource (module, controller, service, repository, entity, DTOs) in src/, following this repo's established conventions (ESM .js imports, custom repository pattern, class-validator DTOs). Use when adding a new domain resource such as tasks or auth.
argument-hint: <resource-name> (singular, e.g. "task")
---

Scaffold a new resource named `$0` (singular, kebab/camel as appropriate) under
`src/$0s/` (pluralize naturally, e.g. `task` → `src/tasks/`), matching the
architecture in [STATEMENT.md](${CLAUDE_PROJECT_DIR}/STATEMENT.md) and the
conventions in [CLAUDE.md](${CLAUDE_PROJECT_DIR}/CLAUDE.md).

Before generating anything:

1. Read `src/users/user.entity.ts` and `src/users/user.module.ts` as the
   reference style for this codebase (ESM `.js` import extensions, TypeORM
   decorator style, module shape).
2. Check `STATEMENT.md` for the exact fields/constraints/endpoints expected
   for this resource, if it's one of the resources already specified there
   (`users`, `tasks`, `auth`). Don't invent fields that aren't asked for.
3. Ask the user to confirm the resource's fields/relations if they are not
   already fully specified in STATEMENT.md.

Generate, in `src/<resource>s/`:

- `<resource>.entity.ts` — TypeORM entity, `@Entity({ name: '<resource>s' })`,
  UUID primary key (`@PrimaryColumn({ type: 'uuid', generated: 'uuid' })` to
  match the existing `User` entity), `@CreateDateColumn`/`@UpdateDateColumn`.
- `<resource>.repository.ts` — a class extending/wrapping
  `Repository<Entity>` (custom repository pattern per CLAUDE.md — services
  must never touch `QueryBuilder` directly).
- `dto/create-<resource>.dto.ts` and `dto/update-<resource>.dto.ts` — using
  `class-validator` decorators matching the field constraints from
  STATEMENT.md (e.g. length bounds, required/optional).
- `<resource>.service.ts` — business logic, uses the repository, throws the
  dedicated business exceptions named in STATEMENT.md §10 where applicable
  (e.g. `TaskNotFoundException`) rather than generic Nest exceptions.
- `<resource>.controller.ts` — routes per STATEMENT.md §5, applying
  `@Roles(...)`/guards where the spec requires them.
- `<resource>.module.ts` — `TypeOrmModule.forFeature([Entity])`, registers
  controller/service/repository as providers, matching
  `src/users/user.module.ts`'s shape.
- `<resource>.service.spec.ts` — unit test skeleton covering the
  STATEMENT.md §12 unit-test expectations for this resource, if any are
  listed.

Do not:
- Add the new module to `AppModule` silently — show the diff and let the
  user confirm before wiring it in, since that changes app bootstrap.
- Invent endpoints, roles, or fields beyond what STATEMENT.md specifies or
  the user explicitly asked for.

After generating, run `npm run lint` and `npm run format:check` on the new
files and fix anything they flag before handing back to the user.
