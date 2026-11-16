# NEXALUMI

**Your Digital Safety Partner**

NEXALUMI is a consumer-facing digital safety MVP. The current functional module is the Link Checker.

## Current release

- React + Vite frontend (`web/`)
- Node.js + Express API (`server/`)
- Shared JavaScript URL validation and result classifications (`shared/`)
- Google Web Risk Lookup integration (backend environment variable required)
- No database, authentication or persistent scan history
- Message, Email and QR Checker pages remain interface previews

## Requirements

- Node.js `22.22.2` or newer
- npm

## Run locally

Terminal 1 — backend:

```bash
cd server
npm install
cp .env.example .env
# Add your Google Web Risk API key to server/.env
npm run dev
```

Terminal 2 — frontend:

```bash
cd web
npm install
npm run dev
```

Open the local Vite URL, normally `http://localhost:5173`, then choose **Open workspace → Link checker**.

The Vite development server proxies `/api` to `http://127.0.0.1:3001`. Leave `VITE_API_BASE_URL` empty for local development.

## Tests

From the project root:

```bash
node --test --test-reporter=spec server/tests/*.test.js
```

Frontend tests:

```bash
cd web
npm test
```

Production frontend build:

```bash
cd web
npm run build
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the Vercel frontend + Express API deployment steps and environment variables.

See [docs/DEMO_READINESS.md](docs/DEMO_READINESS.md) for the current demo scope, company presentation guidance and commercial launch gaps.

## Important

A `No Known Threat Found` result is not a guarantee that a website is safe. The backend does not fetch or crawl submitted websites. The Google Web Risk API key must remain on the backend and must never be added to a `VITE_` variable.
