# Environment Variables

| Variable                | Description                                         | Default     | Required |
| ----------------------- | --------------------------------------------------- | ----------- | -------- |
| `PORT`                  | HTTP port the application listens on                | `3000`      | false    |
| `DB_TYPE`               | Database engine type                                | `mysql`     | false    |
| `DB_USERNAME`           | Database connection username                        | `root`      | false    |
| `DB_PASSWORD`           | Database connection password                        | `` (empty)  | false    |
| `DB_HOST`               | Database server host                                | `localhost` | false    |
| `DB_PORT`               | Database server port                                | `3306`      | false    |
| `DB_SYNCHRONIZE`        | Database synchronization                            | `false`     | false    |
| `DB_AUTO_LOAD_ENTITIES` | Database auto load entities                         | `false`     | false    |
| `PASSWORD_SALT`         | bcrypt salt rounds used to hash passwords           | `10`        | false    |
| `JWT_SECRET`            | Secret key used to sign and verify JWTs (non-empty) | -           | true     |
| `JWT_ISSUER`            | JWT `iss` claim, must be a valid URL                | -           | true     |
| `JWT_AUDIENCE`          | JWT `aud` claim, must be a valid URL                | -           | true     |
| `JWT_EXPIRES_IN`        | JWT lifetime with a unit (e.g. `15m`, `1h`, `7d`)   | -           | true     |
