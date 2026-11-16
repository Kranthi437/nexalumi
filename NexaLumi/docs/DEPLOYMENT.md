# NEXALUMI deployment guide

NEXALUMI is split into two deployable parts:

- `web/`: React + Vite static frontend (Vercel)
- `server/`: Express API (a Node.js host such as Render)

The Link Checker needs both services. A successful frontend deployment by itself does not provide threat checks.

## 1. Deploy the backend API

Create a Node.js web service from this repository with:

- Root directory: `server`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`
- Node.js: `22.22.2` or newer in the supported 22.x line

Set these backend environment variables in the hosting dashboard:

| Variable | Value |
| --- | --- |
| `GOOGLE_WEB_RISK_API_KEY` | Your restricted Google Web Risk API key |
| `CORS_ORIGIN` | `https://trynexalumi.com,https://www.trynexalumi.com,https://web-one-puce-97.vercel.app` |
| `WEB_RISK_TIMEOUT_MS` | `8000` |
| `RATE_LIMIT_WINDOW_MS` | `60000` |
| `RATE_LIMIT_MAX` | `20` |

Use the actual Vercel deployment hostname if it changes. Do not add a trailing slash to origins. Never commit the real API key or put it in a `VITE_` variable.

After deployment, open `https://YOUR-API-HOST/api/health`. It should return:

```json
{ "ok": true, "service": "nexalumi-link-checker" }
```

## 2. Configure the Vercel frontend

In the Vercel project settings, set:

`VITE_API_BASE_URL=https://YOUR-API-HOST`

Use the backend's HTTPS origin only, with no `/api` suffix and no trailing slash.

Set the Vercel project root directory to `web` and select Node.js `22.22.2` or newer in the project build settings, then redeploy. The Vite build command is `npm run build`; the output directory is `dist`.

Keep `trynexalumi.com` connected to the existing Vercel project that serves the correct frontend. Do not change DNS unless Vercel specifically reports that a record is missing or incorrect.

## 3. Local development

Terminal 1:

```bash
cd server
npm install
cp .env.example .env
# Add GOOGLE_WEB_RISK_API_KEY to server/.env
npm run dev
```

Terminal 2:

```bash
cd web
npm install
npm run dev
```

The Vite development server proxies `/api` to `http://127.0.0.1:3001`. Leave `VITE_API_BASE_URL` empty locally.

## 4. Google Web Risk setup

1. Select or create a Google Cloud project.
2. Enable the Web Risk API.
3. Create an API key and restrict it to the Web Risk API.
4. Store it only as `GOOGLE_WEB_RISK_API_KEY` in the backend environment.
5. Check the Google Cloud quota and billing settings before public launch.

The backend uses the `X-Goog-Api-Key` header. The submitted website is not fetched, opened or crawled by NEXALUMI.

## 5. Production release checks

Before sharing the public link:

- Verify `/api/health` on the deployed backend.
- Run one benign URL check and confirm the provider status is `Completed`.
- Verify that missing credentials or provider failures show `Unknown / Unable to Check`, never a clean result.
- Confirm browser developer tools do not show the Google API key in frontend assets or requests.
- Confirm the backend CORS list contains only the real frontend origins.
- Check rate limiting and hosting logs without logging submitted URLs.
- Review privacy notice, terms, data retention and support contact details.
- Perform an independent security review and load test before relying on the service commercially.

## Scope and limitations

This release implements the Link Checker only. Message Checker, Email Checker, QR Checker, accounts, history, notifications and admin screens remain interface previews. There is no database and no persistent scan history. The in-memory rate limiter is per backend process and is not a distributed abuse-prevention system.

A Google Web Risk no-match response means only that the provider did not report a known match at lookup time. It does not certify a website as safe.
