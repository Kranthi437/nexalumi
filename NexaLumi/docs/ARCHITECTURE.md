# Architecture

## Current prototype

The current frontend uses React + JavaScript with Vite and React Router. Reusable UI components live under `web/src/components/`; screen components live under `web/src/pages/`; global and application styling lives in `web/src/index.css` and `web/src/App.css`.

All current checker results, metrics and activity rows are illustrative UI content. There is no backend, database, threat-intelligence provider, AI provider, authentication service or external URL fetch.

## Future architecture (not implemented)

A future production service may add a Node.js API, PostgreSQL, managed authentication and approved threat-intelligence providers. Any URL analysis service must be isolated and protected against SSRF, DNS rebinding, unsafe redirects and access to private network destinations. The browser must not fetch submitted suspicious URLs directly.
