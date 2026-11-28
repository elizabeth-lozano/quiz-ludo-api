# Development journey: Quiz Ludo API

Student: Elizabeth Lozano · Section: 3-1 · Group: Group 10

One entry per milestone, written the week you did it. Newest at the bottom.

## M1 · Accounts, passwords and tokens
- Dates worked: Nov 13, 2026 to Nov 17, 2026 · Time spent: 3 hours across 5 days
- Goal: Add real accounts with hashed passwords and login tokens, and replace the temporary demo-user authentication stand-in.
- What I built: I installed the Weeks 12-18 kit on feature/auth. I wrote two migrations (add-password-to-users and allow-admin-role) and two seeders (demo-passwords and demo-admin). I added bcryptRounds and the JWT settings to src/config/env.js. I wrote the auth validators, service, controller and routes (POST /auth/register, POST /auth/login, GET /auth/me) and the admin service, controller and routes (GET /users and PATCH /users/:id/role). I mapped the duplicate school ID and email constraints to 409. In Postman I built a log-in folder and an Accounts folder, so the collection now has 60 requests, and I replaced the previous demo authentication header with Authorization: Bearer in every Week 11 request and in the project README.
- Evidence: https://github.com/elizabeth-lozano/quiz-ludo-api/pull/3 · 597fd60 (chore: install the Weeks 12-18 kit) · fc1dcb6 (feat(auth): add the register and login service) · 6467b00 (feat(auth): map the duplicate school ID and email constraints)
- Problem I hit: npm run db:seed failed with "ERROR: Illegal arguments: string, undefined" when the demo-passwords seeder hashed a password. Later, npm run check also failed on one Postman request ("Identifier 'data' has already been declared"), although it had worked in the Postman app.
- How I solved it: For the seeder, I pasted the error to an AI assistant, which explained that bcryptjs was receiving undefined as its second argument. I opened src/security/password.js and saw that it uses env.bcryptRounds, then found that my src/config/env.js did not define it, or the JWT settings. I added bcryptRounds: 10 and a jwt object, ran the seeder again, and checked in pgAdmin that every hash starts with $2b$10$. For the check, I renamed the variable data to claims, because the command-line runner already uses the name data, and then exported the collection again.
- Decision I made and why: I made users.password_hash nullable, so the accounts I had already seeded could stay and a seeder could give them a password afterwards. The cost is that an account without a hash can never log in, so the seeder only fills empty hashes. I also followed the rule that an admin cannot change their own role; the cost is that handing over the admin role needs a second admin.
- Changes to my design set: users gets password_hash (VARCHAR(60), nullable), and the role rule now allows ADMIN (PLAYER, HOST, ADMIN). The endpoint table gets five new endpoints: POST /auth/register, POST /auth/login, GET /auth/me, GET /users and PATCH /users/{id}/role. The data dictionary also gets my validation
rules: a school ID like 2099-0001, an email up to 120 characters, and a password of 8 to 72 bytes with a letter and a number.
- What I would explain to a classmate: A password is never stored. bcrypt mixes it with a random salt and turns it into a 60-character hash that cannot be turned back. Because the salt is different each time, two students with the same password get different hashes. At login, bcrypt reads the salt inside the stored hash, hashes the typed password the same way, and compares the results.
- AI tools: I used an AI assistant to explain error messages, to draft code and Postman scripts that I then added to my project, ran and tested myself, and to check my results. I can explain what each file does. Claude AI.

## M2 · The question bank
- Dates worked: Nov 22, 2026 to Nov 28, 2026 · Time spent: 2 hours across 6 days
- Goal: Let hosts manage questions with choices, in lists with paging, sorting and search, and upload a cover picture.
- What I built: A migration that adds position to questions (backfilled for the existing rows, with a UNIQUE (set_id, position) rule) and a migration that adds a nullable cover to question_sets. The Question and Choice models. GET /question-sets now answers {data, meta} with page, limit, sort (an allow-list) and a search term. The nested routes /question-sets/:id/questions (list, create, patch, delete) with the rules: owner only, 2 to 4 choices with exactly one correct, positions set by the server, and a frozen set when a game used it. GET /question-sets/:id?include=questions loads the set, its questions and their choices in one query. PUT /question-sets/:id/cover with multer, and express.static to serve the pictures. A Question bank folder in Postman.
- Evidence: https://github.com/elizabeth-lozano/quiz-ludo-api/pull/4 · 3865fca feat(question-bank): show the cover address of a set · 643b077 test: add the cover upload requests to the Postman collection · ff06ae4 feat(question-bank): add the cover upload
- Problem I hit: Making questions.position required would have broken a fresh database, because my Week 10 seeder inserted questions without a position, and the check rebuilds everything from scratch.
- How I solved it: I searched the seeders with git grep for the lines that insert questions, gave each question the position i + 1 from its index in the list, then ran npm run db:reset and npm run check to prove a clean database still loads.
- Decision I made and why: Positions start at 1, because the gameplay milestone starts a game at position 1. When a question is deleted, the later ones move up by one in two steps (far away, then back down), so the UNIQUE rule is never broken in between. The cost is that a question's place can change when an earlier one is deleted, so the id is the stable identity.
- Changes to my design set: questions.position (INTEGER, required, unique with set_id), question_sets.cover (VARCHAR(120), nullable), the endpoint table for the question bank, and the {data, meta} list format.
- What I would explain to a classmate: A question and its choices are saved together. If one choice fails, nothing is saved, so I never get a question with half its choices.
- AI tools: I used an AI assistant to explain errors, to draft code and Postman scripts that I then added to my project, ran and tested myself, and to check my results. I can understand how everything works but it can be a little hard for me to explain to other people.

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
