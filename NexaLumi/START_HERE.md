# Start NEXALUMI locally (Windows PowerShell)

## 1. Install the required Node.js version

Install Node.js 22.22.2 or newer in the supported 22.x line. Close and reopen PowerShell, then verify:

```powershell
node --version
npm --version
```

## 2. Configure the backend

Open PowerShell in the project folder:

```powershell
cd .\server
Copy-Item .env.example .env
notepad .env
```

Add your provider keys in `server/.env`:

- `PHISHTANK_APP_KEY` — get a free app key after registering at https://phishtank.org/
- `URLHAUS_AUTH_KEY` — get an abuse.ch key at https://auth.abuse.ch/
- `OTX_API_KEY` — get an OTX key at https://otx.alienvault.com/

PhishTank can allow limited lookups without an app key; the key is recommended for an application. URLhaus requires its Auth-Key. OTX requires its API key. Review each provider's current terms and usage policy before commercial use. URLhaus community API is subject to fair-use principles and commercial/for-profit usage may require its enhanced paid API.

Google Web Risk is intentionally disabled. Its adapter source remains in `server/src/services/threatIntel/googleWebRisk.js`; the registry import and environment example are commented out.

For shared cache/rate limits across multiple API instances, configure both:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without Redis, these controls are process-local and reset when the API restarts. For local testing, Redis is optional.

## 3. Start the backend

Still in `server`:

```powershell
npm ci
npm test
npm run dev
```

The API listens on http://localhost:3001. Check http://localhost:3001/api/health and http://localhost:3001/api/providers.

## 4. Start the frontend

Open a second PowerShell window in the project root:

```powershell
cd .\web
npm ci
npm test
npm run build
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## 5. Production deployment

Follow `docs/DEPLOYMENT.md`. Set the frontend's `VITE_API_BASE_URL` to the deployed backend origin. Set the backend CORS allowlist to the exact frontend origins. Never put threat-provider keys in frontend environment variables or commit `.env`.

## 6. Safe verification

Use benign URLs for ordinary checks and mock provider responses in automated tests. Do not visit or click real phishing/malware destinations. A no-known-threat result is not proof that a URL is safe.

The frontend test/build commands must be run on Node.js 22.22.2+ after `npm ci`. The supplied development environment used for preparing this ZIP did not have the required Node version or a compatible Linux Vite/Rolldown optional binary, so the frontend build is not certified by this package preparation.
