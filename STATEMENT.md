# Exercise 1 — Task Management API

**Database:** MySQL — **ORM:** TypeORM — **Language:** TypeScript

## 1. Context

You must build the backend API of a "mini personal Trello" task management application. Each registered user manages their own tasks; an administrator can oversee all tasks from all users.

## 2. Learning objectives

- Set up JWT authentication with roles (`USER`, `ADMIN`).
- Structure a Nest API into modules/controllers/services/repositories with TypeORM on MySQL.
- Apply middleware, interceptors, validation pipes (class-validator + JSON Schema) and a global exception filter.
- Deliver a project with tests (unit + e2e) and containerization.

## 3. Data model

### `User`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| email | string | unique, required |
| password | string | hashed (bcrypt), never returned in responses |
| fullName | string | required |
| role | enum(`USER`,`ADMIN`) | default `USER` |
| createdAt / updatedAt | timestamp | auto |

### `Task`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| title | string | required, 3-120 characters |
| description | text | optional |
| status | enum(`TODO`,`IN_PROGRESS`,`DONE`) | default `TODO` |
| priority | enum(`LOW`,`MEDIUM`,`HIGH`) | default `MEDIUM` |
| dueDate | date | optional |
| ownerId | UUID | FK → User, required |
| createdAt / updatedAt | timestamp | auto |

Relation: a `User` owns many `Task` (1-N). A task belongs to a single owner.

## 4. Expected architecture

```
src/
├── auth/            # JWT strategy, guards, decorators (@Public, @Roles)
├── users/           # module, controller, service, repository, entity
├── tasks/           # module, controller, service, repository, entity
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── interceptors/logging.interceptor.ts
│   ├── interceptors/transform-response.interceptor.ts
│   ├── middlewares/request-logger.middleware.ts
│   ├── pipes/json-schema-validation.pipe.ts
│   └── schemas/create-task.schema.json
```

## 5. Endpoints

### Public routes

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Account creation (`USER` by default) |
| POST | `/auth/login` | Authentication, returns a JWT |
| GET | `/health` | Application status and MySQL connection check |

### Private routes (JWT required)

| Method | Route | Required role | Description |
|---|---|---|---|
| GET | `/users/me` | USER, ADMIN | Profile of the logged-in user |
| GET | `/tasks` | USER, ADMIN | List of tasks (USER: own tasks only, ADMIN: all, with `?ownerId=` filter) |
| GET | `/tasks/:id` | USER, ADMIN | Task detail (USER: own task only, otherwise 403) |
| POST | `/tasks` | USER, ADMIN | Create a task for the logged-in user (JSON Schema validation) |
| PATCH | `/tasks/:id` | USER, ADMIN | Update a task (owner or ADMIN) |
| DELETE | `/tasks/:id` | USER, ADMIN | Delete a task (owner or ADMIN) |
| GET | `/tasks/stats` | ADMIN | Number of tasks per status, across all users |

Pagination is expected on `GET /tasks` via `?page=&limit=` (defaults: page=1, limit=20), with pagination metadata in the response.

## 6. Authentication & authorization

- `passport-jwt` strategy, `AuthGuard('jwt')` applied globally (`APP_GUARD`), with a `@Public()` decorator to mark public routes (using a `Reflector`).
- `@Roles(...)` decorator + `RolesGuard` to restrict `/tasks/stats` to `ADMIN`.
- Passwords hashed with `bcrypt` (never plain text, never exposed in output — use a `ClassSerializerInterceptor` or a dedicated output DTO).

## 7. Middleware

Implement a `RequestLoggerMiddleware` applied to all routes via `configure(consumer)` in `AppModule` (not via a bare `app.use`). It must log: HTTP method, URL, IP, status code and processing duration (ms), using the Nest `Logger`.

## 8. Interceptors

1. `LoggingInterceptor`: measures and logs the execution time of every handler (before/after).
2. `TransformResponseInterceptor`: wraps every successful response in a standard format: `{ "success": true, "data": ..., "timestamp": "..." }`.

## 9. Pipes & validation

- Global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`) with `class-validator` DTOs for `register`, `login`, `create-task`, `update-task`.
- A custom `JsonSchemaValidationPipe` based on `ajv`, applied explicitly on `POST /tasks`, validating the payload against a JSON schema (`common/schemas/create-task.schema.json`) — independent from the class-validator DTOs, as a double-validation exercise. On failure it must throw a `BadRequestException` with the ajv error details.

## 10. Error handling / exception filter

- Global `HttpExceptionFilter` (`APP_FILTER`) that standardizes every error into the format:
```json
{ "success": false, "statusCode": 404, "message": "...", "path": "/tasks/123", "timestamp": "..." }
```
- Dedicated business exceptions: `TaskNotFoundException` (404), `ForbiddenTaskAccessException` (403), `UserAlreadyExistsException` (409, thrown if the email already exists at registration).
- The filter must also catch TypeORM errors (`QueryFailedError`, e.g. a unique constraint) and translate them into proper HTTP responses instead of leaking a 500 with the SQL stack trace.

## 11. Persistence — MySQL + TypeORM

- Connection via `@nestjs/typeorm` + `mysql2`, configured through environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- TypeORM entities `User` and `Task` with `@OneToMany`/`@ManyToOne` relations.
- Use **TypeORM migrations** (no `synchronize: true` in the "production" environment of the docker-compose): provide at least one versioned initial migration.
- The `TasksRepository` must encapsulate TypeORM's `Repository<Task>` (custom repository pattern or `extends Repository`); the service must never directly manipulate the `QueryBuilder`.

## 12. Required tests

### Unit tests (Jest)
- `TasksService`: creation correctly assigns `ownerId`, a `USER` is denied access to another user's task, correct stats computation for `ADMIN`.
- `AuthService`: password hashing, login rejection on wrong password, JWT generation.
- `JsonSchemaValidationPipe`: valid payload passes, invalid payload throws an exception.
- Minimum expected coverage: **70% on services and pipes**.

### End-to-end tests (Supertest)
- Full scenario: register → login → create task → read → update → delete.
- Verify that a `USER` cannot access another user's task (403).
- Verify that a `USER` cannot call `/tasks/stats` (403) and that an `ADMIN` can.
- Verify the standardized error format on a 404 case and a 400 (validation) case.
- Use a dedicated MySQL test database (Docker container or separate "test" database), reset between runs.

## 13. Containerization

- **Dockerfile**: multi-stage build (`builder` stage with TypeScript compilation, then a lightweight `runtime` image such as `node:20-alpine`, running as a non-root user).
- **docker-compose.yaml**: services `app` (built from the Dockerfile, depends on `db` with a `healthcheck`) and `db` (MySQL 8, persistent volumes, environment variables). Expose the API on a port of your choice.
- **docker-compose-deps.yaml**: only the `db` service (+ optionally `phpmyadmin` or `adminer`), to develop the app locally with `npm run start:dev` connected to this containerized database.
- Provide an `.env.example` documenting every required variable.

## 14. Renovate

Provide a `renovate.json` at the project root that:
- extends the recommended base configuration (`config:recommended`),
- schedules updates (e.g. every Monday morning),
- groups `@nestjs/*` packages together,
- enables auto-merge for `patch`/`devDependencies` updates only,
- ignores or isolates major version bumps (manual review required).

## 15. Deliverables

- Full source code, project `README.md` with run instructions (local + Docker).
- Postman/Insomnia collection or `.http` file covering all endpoints.
- Test coverage report (`npm run test:cov`).

## 16. Bonus (optional)

- Token refresh (`refresh_token`).
- Advanced filtering/sorting on `GET /tasks` (`status`, `priority`, `dueDate`).
- Soft delete of tasks (`deletedAt`) instead of physical deletion.
