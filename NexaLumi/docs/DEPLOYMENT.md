# NEXALUMI deployment guide

This source package contains a React/Vite frontend and an Express API. The Link Checker queries reputation providers; it does not open or crawl submitted URLs.

## Runtime

Use Node.js `22.22.2` or newer in the supported 22.x line. The original project declares this minimum. Install dependencies independently in `server/` and `web/` using `npm ci`.

## Backend deployment (Render or equivalent)

- Root directory: `server`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/api/health`

Set these backend environment variables:

| Variable | Required | Purpose |
|---|---:|---|
| `CORS_ORIGIN` | Yes | Comma-separated exact frontend origins |
| `PHISHTANK_APP_KEY` | Recommended | Free PhishTank app key; limited API requests may work without it |
| `URLHAUS_AUTH_KEY` | Optional | Free abuse.ch Auth-Key for URLhaus community API; subject to fair-use and commercial terms |
| `OTX_API_KEY` | Optional | AlienVault OTX API key |
| `THREAT_PROVIDER_TIMEOUT_MS` | No | Provider timeout; default 8000 ms |
| `LINK_CACHE_TTL_MS` | No | In-process cache lifetime; default 600000 ms |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window; default 60000 ms |
| `RATE_LIMIT_MAX` | No | Requests per window and client IP; default 20 |
| `TRUST_PROXY` | Yes in hosted deployment | Number or expression matching the actual trusted proxy chain; default 1 |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST endpoint for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token |
| `MAX_MESSAGE_LENGTH` | No | Maximum pasted message/email length; default 12000 |

Never commit `.env` or expose provider keys in a `VITE_` variable. Use `server/.env.example` as a template.

The Google Web Risk implementation is retained in `server/src/services/threatIntel/googleWebRisk.js`. Its import/registration and environment-variable example are commented out intentionally; it is not called by the active provider chain. To re-enable it later, restore the import and add it to the provider registry after reviewing current pricing and terms.

## Frontend deployment (Vercel or equivalent)

- Root directory: `web`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://YOUR-API-HOST` (origin only, no `/api` suffix)

Keep the backend CORS allowlist aligned with the deployed frontend origins.

## Local execution

Terminal 1:

```bash
cd server
npm ci
cp .env.example .env
# Add provider keys to .env as desired
npm run dev
```

Terminal 2:

```bash
cd web
npm ci
npm run dev
```

The Vite development server proxies `/api` to `http://127.0.0.1:3001`.

## Provider behavior

- PhishTank: phishing URL database; free API key recommended. An entry is treated as a confirmed match only when it is in the database, verified and valid.
- URLhaus: malware-distribution URL database; requires an abuse.ch Auth-Key. Community API is free under fair-use principles; companies or for-profit needs may require the enhanced commercial API. Review its terms before using it in a revenue-generating service.
- AlienVault OTX: community threat-intelligence indicator lookup; requires an OTX API key.
- Google Web Risk: retained but disabled/commented in the active chain.

Provider calls run in parallel. A positive match from any responding provider yields `Known Malicious`. If at least one provider successfully returns no match and none reports a threat, the result can be `No Known Threat Found`; the UI shows how many configured providers responded. If all active providers fail, the result is `Unknown / Unable to Check`, never a clean verdict. NEXALUMI heuristics can additionally classify a no-match URL as `Suspicious`.

## Caching and rate limiting

The current URL reputation cache and default rate limiter are in-memory and apply to a single Node process. They are useful for development/single-instance use but are not durable or shared across replicas. Configure Upstash Redis REST variables to enable distributed per-IP rate limiting. For multi-instance production, replace the in-memory reputation cache with a shared cache (for example Redis) before relying on cache hit rates or global cost controls. The in-memory cache stores SHA-256 cache keys, not raw URLs.

## Implemented checkers and limitations

- Link Checker: live multi-provider reputation lookups plus URL heuristics.
- Message Checker: server-side heuristic analysis only; not an ML classifier or definitive phishing detector.
- Email Checker: content heuristics plus SPF/DMARC DNS record-presence checks for a supplied From domain. DKIM signature verification and actual message authentication are not performed. A pasted `Authentication-Results` header can be forged; only trust headers from a known receiving mail system.
- QR Checker: uses the browser `BarcodeDetector` API where supported to decode a local image or camera stream, then submits the decoded URL to Link Checker. Unsupported browsers can paste decoded text instead.
- Scan History: stored in local browser storage only; not synchronized or backed up.
- Dashboard, profile, notifications, admin, learning content, accounts and subscription workflows: remain marked as prototype/under development. They are not backed by a production database or authentication system.

## Release checklist — required before production

1. Deploy to staging and configure provider credentials; test `/api/health` and `/api/providers`.
2. Test known benign URLs and safe test indicators from each provider's official documentation. Do not visit live malware/phishing URLs.
3. Verify provider outages and missing credentials produce `Unknown`, not a clean verdict.
4. Verify provider terms, fair-use limits and commercial licensing for your business model.
5. Configure Upstash Redis for distributed rate limiting and implement a shared Redis cache/global daily budget before multi-instance scaling.
6. Review DNS/proxy trust settings, CORS, TLS, secrets, privacy notice, data retention and abuse monitoring.
7. Run frontend tests/build with Node 22.22.2+ and browser E2E tests on the deployment environment.
8. Perform independent security testing and load testing. This package is not a certification of production readiness.
