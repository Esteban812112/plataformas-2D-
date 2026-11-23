# Rushbound backend

Kotlin API for Rushbound accounts and unlocked level. This project is separate from the Expo app and the Unity WebGL build. Those projects are not called by this service and are not modified here.

## Stack

- Kotlin 2.4
- Ktor 3.6 (Netty)
- PostgreSQL 16
- Exposed 1.6
- JWT (HMAC-SHA256)
- BCrypt password hashes

## Requirements

- JDK 21 or newer (this machine was verified with JDK 25)
- PostgreSQL 16 running locally, or Docker if you use the compose file
- No extra tools are required to run the automated tests. They start an embedded PostgreSQL.

## Configure

From `backend/`:

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env`.

Edit `.env` and replace `DATABASE_PASSWORD` and `JWT_SECRET`. `JWT_SECRET` must be at least 32 characters. `.env` is gitignored. Do not put real secrets in `.env.example`.

The API reads environment variables first. If a variable is missing, it reads `backend/.env`.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port. Default `8082`, so it does not use the Unity static server port `8080` or the Expo/Metro port `8081`. |
| `DATABASE_URL` | PostgreSQL JDBC URL. |
| `DATABASE_USER` | Database user. |
| `DATABASE_PASSWORD` | Database password. |
| `DB_POOL_SIZE` | Hikari pool size. Default `10`. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API. Default `http://localhost:8081,http://localhost:19006`. |
| `JWT_SECRET` | HMAC secret, at least 32 characters. |
| `JWT_ISSUER` | Token issuer. Default `rushbound`. |
| `JWT_AUDIENCE` | Token audience. Default `rushbound-api`. |
| `JWT_EXPIRATION_SECONDS` | Token lifetime. Default `86400`. |
| `BCRYPT_COST` | BCrypt cost factor. Default `12`. |

## Run PostgreSQL

### Docker

From `backend/`:

```bash
docker compose up -d
```

The compose file creates database `rushbound` with user `rushbound` and the placeholder password from `.env.example`. Change both together before you treat the machine as shared.

### Without Docker

Install PostgreSQL 16 and create the same database and user:

```sql
CREATE USER rushbound WITH PASSWORD 'your-password';
CREATE DATABASE rushbound OWNER rushbound;
```

Put that password in `.env` as `DATABASE_PASSWORD`. The `users` table and the level check constraint are created when the API starts.

## Run the API

From `backend/`:

```bash
gradlew.bat run
```

On macOS or Linux:

```bash
./gradlew run
```

The server listens on `http://localhost:8082`.

## API

Passwords are stored only as BCrypt hashes. `GET /users/me` and `PUT /users/me/level` require `Authorization: Bearer <token>`. The user id is taken from the token. A request cannot name another user.

New accounts start at unlocked level `1`. `PUT /users/me/level` accepts a level only when it is exactly the current level plus one, and only while that value is between 1 and 10. Jumps, repeats, lower levels, and values outside that range are rejected. The update locks the user row inside a transaction, so two concurrent requests cannot both advance the same level.

### `POST /auth/register`

```json
{ "email": "player@example.com", "password": "password123" }
```

`201` returns a JWT and the public profile. Password must be 8 to 72 characters and at most 72 bytes. Duplicate email returns `409`.

### `POST /auth/login`

Same JSON body. `200` returns a new JWT and the profile. Invalid credentials return `401` with the same message whether the email exists or not.

### `GET /users/me`

`200` returns `id`, `email`, `unlockedLevel`, and `createdAt`.

### `PUT /users/me/level`

```json
{ "level": 2 }
```

`200` returns the updated profile. `400` means the value is outside 1–10 or the body is invalid. `409` means the value is not the next level.

## Tests

From `backend/`:

```bash
gradlew.bat test
```

Tests cover registration, login, password hashing, JWT authorization, ownership of progress, level jumps, the 1–10 range, and concurrent unlocks. They use embedded PostgreSQL, not the database from `.env`.

## What this phase does not do

The Expo screens and the Unity build are unchanged. Nothing in the game reports a completed level yet, so this API can only enforce the next-level rule. It cannot prove that Unity actually finished that level. Frontend wiring, comments, and a signed result from the game are later work.
