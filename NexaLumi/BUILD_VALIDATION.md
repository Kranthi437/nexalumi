# Build and test validation record

Prepared: 2026-11-16

## Backend

- `npm test` in `server/`: **40 passed, 0 failed**.
- `node --check` across backend and shared JavaScript files: passed.
- Tests use mocked threat-provider responses; they do not contact live threat feeds or visit malicious URLs.

## Frontend

- Frontend tests and production build were **not verified** in the preparation environment.
- The project requires Node.js `22.22.2` or newer; the preparation environment provided Node.js `22.16.0`.
- The ZIP supplied with the source contained Windows-native optional Vite/Rolldown packages. The Linux environment could not load the required Linux native binding, so Vitest startup failed before tests could run.
- Re-run `npm ci`, `npm test`, `npm run lint` and `npm run build` from `web/` using Node.js 22.22.2+ on your Windows/Linux deployment build environment.

## Live provider verification

- No live PhishTank, URLhaus or OTX requests were executed during packaging because no provider credentials were supplied and this environment is not being used to test live malicious URLs.
- Configure provider keys, then verify `/api/providers` and perform a benign URL lookup in staging.

This validation record is not a production certification. Complete `docs/DEPLOYMENT.md` and `docs/SECURITY.md` release checks before public launch.
