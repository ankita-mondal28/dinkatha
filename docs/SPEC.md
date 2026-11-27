You are setting up the project skeleton for "Dinkatha", a voice-first diary web app for parents of autistic children in India. Read docs/SPEC.md for context, but build ONLY what is listed below. Do not add features, pages, libraries, tests, or files that are not listed.

STRUCTURE
- client/ : React + Vite (JavaScript, no TypeScript, no Tailwind)
- server/ : Node 20 + Express (ES modules)
- docker-compose.yml, Dockerfile, .dockerignore, .gitignore, .env.example, README.md at the root

SERVER
- Listens on PORT (default 3000).
- GET /api/health returns { "status": "ok", "aiConfigured": <true only if the env var GROQ_API_KEY is set> }.
- In production it serves client/dist as static files and falls back to index.html for other non-/api routes.
- Must start with no .env file and no API keys.

CLIENT
- One placeholder screen: the word "Dinkatha" in the Latin font, "দিনকথা" in the Bengali font, "दिनकथा" in the Devanagari font, and one line: "A voice diary for parents."
- Fonts bundled locally with @fontsource packages: noto-sans, noto-sans-bengali, noto-sans-devanagari. No Google Fonts CDN links.
- Put design tokens in client/src/styles/tokens.css as CSS variables: --paper #FBF7F0, --ink #2A2420, --clay #B5532E, --sage #4F6F57, --sand #EDE4D3, --line #D9CDB8. Base text size 20px, min tap target 56px.
- Vite dev server on port 5173 with a proxy for /api to http://localhost:3000.

DOCKER
- Dockerfile: multi-stage. Stage 1 builds the client. Stage 2 installs server production dependencies, copies client/dist, and runs the server.
- docker-compose.yml: one service "dinkatha", ports "3000:3000", env_file optional (the app must start without a .env file), and a healthcheck on /api/health.
- .env.example with placeholders only: PORT=3000 and GROQ_API_KEY= (empty), each with a one-line comment saying it is optional.

README.md: title, one-line description, and a "Quick start" section with only `docker compose up` and "open http://localhost:3000". Nothing else.

VERIFY (Docker is not installed on this machine, so do NOT run docker commands)
1. npm install in client/ and server/.
2. Build the client, start the server, and confirm http://localhost:3000 shows the placeholder screen and /api/health returns the JSON above.

RULES
- Do not run any git commands. I will commit and push myself.
- Do not create sample data, extra routes, comments explaining the obvious, or placeholder TODO files.
- Write clean, readable code in a natural style, and keep it short.
- When finished, reply with only: the list of files created, and the exact commands to run the app locally.