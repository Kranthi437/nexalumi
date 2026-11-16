# NEXALUMI Link Checker

The Link Checker reviews an HTTP or HTTPS website address against Google Web Risk. It does not open, crawl or fetch the submitted website. No known threat found does not guarantee safety.

## Architecture

1. The React page validates the address in the browser for immediate feedback.
2. The same address is posted to `POST /api/link-check`.
3. The Express API validates again, applies NEXALUMI heuristics, and asks Google Web Risk about reputation.
4. The API returns a structured result. The frontend never receives the Google API key.

```
Browser (React / Vite)
  -> POST /api/link-check  { url }
     -> URL validation (http/https only)
     -> Heuristics (local, configurable)
     -> Google Web Risk Lookup API
  <- classification, explanations, recommendations
```

The threat intelligence provider lives in `server/src/services/threatIntel/`. Another provider can be added later without changing the page layout.

## Frontend and backend files

### Frontend

- `web/src/pages/LinkChecker.jsx` — Link Checker page, reused NEXALUMI layout
- `web/src/api/linkCheck.js` — browser request to the API
- `web/src/components/ui.jsx` — shared Card, Button, PageTitle, Field, Notice
- `web/src/pages/LinkChecker.test.jsx` — page tests
- `web/vite.config.js` — proxies `/api` to `http://127.0.0.1:3001` in development

### Shared

- `shared/url.js` — URL validation and normalisation
- `shared/classifications.js` — the four result labels

### Backend

- `server/src/index.js` — process entry
- `server/src/app.js` — Express app, CORS, size limits, rate limit, routes
- `server/src/config.js` — environment loading
- `server/src/services/linkChecker.js` — orchestration and result copy
- `server/src/services/heuristics.js` — suspicious-pattern warnings
- `server/src/services/threatIntel/googleWebRisk.js` — Google Web Risk client
- `server/src/services/threatIntel/index.js` — provider factory
- `server/src/middleware/rateLimit.js` — in-memory request limiter

Other modules (Message Checker, Email Checker, QR Checker, homepage, navigation) are unchanged.

## Result classifications

| Classification | Meaning |
| --- | --- |
| Known Malicious | Google Web Risk reported a matching threat |
| Suspicious | Web Risk reported no match, but NEXALUMI heuristics found concerning URL characteristics |
| No Known Threat Found | Web Risk completed a lookup and reported no matching threat |
| Unknown / Unable to Check | Invalid URL, missing API key, timeout, rate limit, or provider failure |

Heuristic warnings are always labelled as NEXALUMI heuristics, not confirmed detections. API failures are never treated as safe.

## Installation

From the repository:

```bash
cd NexaLumi/web
npm install

cd ../server
npm install
```

## Environment variables

Copy `server/.env.example` to `server/.env`:

```bash
cd NexaLumi/server
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_WEB_RISK_API_KEY` | Yes, for live lookups | Google Web Risk API key. Keep it on the server only. |
| `PORT` | No | API port. Default `3001`. |
| `CORS_ORIGIN` | No | Allowed browser origin. Default `http://localhost:5173`. Comma-separated for multiple origins. |
| `WEB_RISK_TIMEOUT_MS` | No | Lookup timeout. Default `8000`. |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window. Default `60000`. |
| `RATE_LIMIT_MAX` | No | Max checks per IP in that window. Default `20`. |
| `VITE_API_BASE_URL` | No | Frontend API origin. Leave empty when using the Vite proxy. |

If `GOOGLE_WEB_RISK_API_KEY` is missing, checks return **Unknown / Unable to Check**. The app does not invent a successful security result.

## Google Web Risk setup

1. Create or select a Google Cloud project.
2. Enable the Web Risk API.
3. Create an API key restricted to the Web Risk API.
4. Put the key in `NexaLumi/server/.env` as `GOOGLE_WEB_RISK_API_KEY`.
5. Do not prefix it with `VITE_` and do not commit `.env`.

The backend calls `https://webrisk.googleapis.com/v1/uris:search` with the normalised URL and sends the API key in the `X-Goog-Api-Key` header. It never fetches the submitted website. The API key is not included in the request URL.

## Local execution

Terminal 1 — API:

```bash
cd NexaLumi/server
npm run dev
```

Terminal 2 — UI:

```bash
cd NexaLumi/web
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`) and go to **Link checker** (`/app/link-check`).

Production-style API start:

```bash
cd NexaLumi/server
npm start
```

## Tests

Backend:

```bash
cd NexaLumi/server
npm test
```

Frontend:

```bash
cd NexaLumi/web
npm test
```

Tests use mock Google Web Risk responses. They never call a live malicious URL.

## Troubleshooting

**Unknown / Unable to Check with “not configured”**  
`GOOGLE_WEB_RISK_API_KEY` is missing or empty in `server/.env`. Restart the API after editing the file.

**The UI shows a network or retry error**  
Start the API on port 3001 before the Vite app. Confirm `GET http://127.0.0.1:3001/api/health` returns `{ "ok": true }`.

**CORS error in the browser**  
Set `CORS_ORIGIN` to the exact UI origin, for example `http://localhost:5173`. Restart the API.

**429 Too many checks**  
Wait for the rate-limit window, or raise `RATE_LIMIT_MAX` in local development only.

**Timeouts**  
Increase `WEB_RISK_TIMEOUT_MS` if Google Cloud is slow from your network. Timeouts are reported as Unknown, not safe.

**javascript:, file: or data: addresses**  
These are rejected. Only `http:` and `https:` are accepted.

**The check seems to do nothing with a very long paste**  
Input is limited to 2048 characters.
