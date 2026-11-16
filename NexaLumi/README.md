# NEXALUMI

NEXALUMI is a web toolkit for digital-safety checks. The current source package includes a React/Vite frontend and an Express API.

## Implemented in this update

- Live URL reputation checks using PhishTank, URLhaus and AlienVault OTX adapters.
- Google Web Risk adapter source retained but intentionally disabled/commented in the active provider registry.
- URL normalization, URL heuristics including Punycode warnings, parallel provider calls, in-process and optional Upstash Redis caching.
- Provider-by-provider result visibility, bulk URL-check API (up to 10 URLs), daily check allowance and per-IP rate limiting.
- Optional Upstash Redis-backed distributed rate limiting and daily budget.
- Message content heuristic checker.
- Email content heuristics and sender-domain SPF/DMARC TXT-record presence inspection; no DKIM signature verification.
- QR image decoding using the browser BarcodeDetector API where supported, followed by URL reputation checking.
- Browser-local scan history.
- Backend unit/API tests and CI workflow.

## Quick start

Use Node.js 22.22.2 or newer.

```bash
cd server
npm ci
cp .env.example .env
npm test
npm start
```

In another terminal:

```bash
cd web
npm ci
npm test
npm run build
npm run dev
```

Configure `VITE_API_BASE_URL` only for deployed frontend builds. Locally, Vite proxies `/api` to port 3001.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/PRIVACY.md`
- `docs/TEST_PLAN.md`

## Important limitations

This is an implementation candidate, not a guarantee of production readiness. Provider availability and free-tier terms can change. A clean result is not proof that a URL is safe. Message and email analysis are heuristics; email authentication only checks DNS record presence and does not verify a message's SPF/DKIM/DMARC pass. QR image decoding depends on browser support. Scan history is browser-local. Accounts, database-backed history, real admin controls, subscriptions and full notification workflows remain under development. Configure Redis for shared limits/cache before running multiple backend instances, and complete the release checklist in `docs/DEPLOYMENT.md`.
