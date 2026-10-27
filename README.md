# Quiz Ludo API

Backend API for **Quiz Ludo**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Elizabeth Lozano (elizabeth-lozano), BSCS 3-1
- Group and game concept: Group 10 Quiz Ludo

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone https://github.com/elizabeth-lozano/quiz-ludo-api.git
cd quiz-ludo-api
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | quiz_ludo | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## What "completed" means in my game

A player completed the game if they stayed until it ended and were not replaced by a
bot. A player who left or disconnected, so that a bot took over their seat, has
completed = false and rank = null.

## Tables

- users: accounts (school_id, name, email) with a role of HOST or PLAYER
- question_sets: host-written sets of questions, each with a category
- questions: the questions in a set, with a time limit of 5 to 60 seconds
- choices: the answer choices of a question; exactly one is marked correct
- game_sessions: one game, with its 6-digit join pin, status, and start and end times
- players: one seat per account per game (UNIQUE on session and user), with nickname,
  color, score and the positions of the two tokens
- answers: each answer a player gave, with whether it was correct and how fast

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |


## Question sets (Module 1)

Every request sends the header `X-Demo-User` with the school ID of a seeded account (login arrives in Week 12).

| Verb | URL | Who may call it | Success |
|---|---|---|---|
| GET | /api/v1/question-sets | A host (sees own sets) or an admin (sees all sets) | 200 |
| POST | /api/v1/question-sets | A host or an admin | 201 |
| GET | /api/v1/question-sets/{id} | The owner of that set, or an admin | 200 |
| PATCH | /api/v1/question-sets/{id} | The owner of that set, or an admin | 200 |
| DELETE | /api/v1/question-sets/{id} | The owner of that set, or an admin | 204 |

**Owner rule:** a host can read, change or delete only the question sets they created. Another host gets 403 FORBIDDEN, and a player cannot use any of these endpoints (403). The owner is always the caller: a client can never choose `host_id`.

**Delete rule:** a question set that a game already used cannot be deleted. The API answers 409 QUESTION_SET_IN_USE.

**Fields:** `title` (3 to 100 characters, required on create), `category` (1 to 40 characters, default General), `description` (optional, up to 500 characters).

## Sessions and players (Module 2)

| Verb | URL | Who may call it | Success |
|---|---|---|---|
| POST | /api/v1/sessions | A host or an admin | 201 |
| GET | /api/v1/sessions/{code} | Anyone | 200 |
| PATCH | /api/v1/sessions/{code} | The host of that game, or an admin | 200 |
| POST | /api/v1/sessions/{code}/players | Any known account | 201 new seat, 200 rejoin |
| GET | /api/v1/sessions/{code}/players | Anyone | 200 |

**Rules:**
- The server makes the six-digit join code (100000 to 999999). A client never chooses it.
- A game starts as LOBBY. It can become RUNNING or CLOSED. A RUNNING game can only become CLOSED, and a CLOSED game never changes. A bad change answers 409 INVALID_STATUS_CHANGE.
- Rejoin: an account that already has a seat in a game gets the same seat back (200), with the same score, even after the game has started.
- A new player can join only while the game is in the lobby (409 SESSION_NOT_JOINABLE or SESSION_ENDED) and only if there is room (409 SESSION_FULL, maximum 4 players).
- One game at a time: an account seated in a RUNNING game cannot join another (409 ALREADY_IN_GAME).
- A nickname is unique inside a game (409 NICKNAME_TAKEN, from the database constraint).
- Closing a game sets ended_at, and that makes it appear in /results.