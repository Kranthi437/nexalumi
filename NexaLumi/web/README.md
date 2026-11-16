# NEXALUMI — Your Digital Safety Partner

NEXALUMI is a consumer digital-safety product concept. This repository currently contains a **JavaScript + React UI prototype**. The screens and sample data are for design review only.

## Current scope

- Responsive public homepage and product navigation
- Workspace dashboard and sidebar navigation
- Link, message, email and QR checker screens
- Scan history, security alerts and Safety Academy screens
- Login, registration and forgot-password screen designs
- Profile, account, privacy and notification settings
- Admin dashboard preview, help, contact, legal pages and custom 404
- Reusable layout, brand, form, badge and panel components

## Important prototype boundaries

- No real security analysis or threat-intelligence lookup is connected.
- No submitted URL is fetched or opened by the prototype.
- No real login, registration, password reset, email delivery or admin operation exists.
- No backend, database or external AI provider is connected.
- Sample activity, counts, results and learning progress are illustrative.
- Never interpret a demo result as proof that a link, message or website is safe.

## Technology

- React with JavaScript (`.jsx` / `.js`)
- Vite
- React Router
- Responsive visual system authored in `src/App.css` and `src/index.css`.
- Vitest and Testing Library for UI checks

## Run locally

Use Node.js 22.22.2+ or a current supported Node.js 24 release.

```bash
cd web
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Validation commands

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Project structure

```text
web/
  src/
    components/       Shared brand, badges and layouts
    pages/            Public pages and workspace screens
    test/             Test setup
    App.jsx           Application routes
    main.jsx          React entry point
    App.css           Responsive application styling
    index.css         Global styles and theme
```

## Next phase

Review and approve the UI before connecting functionality. Future live scanning requires a separately designed secure backend, threat-intelligence sources, privacy controls, abuse prevention, independent security review and clear limitations. Do not add URL fetching to the browser prototype.
