# NEXALUMI UI implementation notes

## Scope delivered

The frontend is now JavaScript-only (`.js` and `.jsx`). The screens are intended for product and design review before any backend or security functionality is developed.

### Public pages

- Home
- About
- Contact
- Help
- Privacy notice
- Terms of use
- Login
- Registration
- Forgot password

### Workspace pages

- Overview dashboard
- Link checker
- Message checker
- Email checker
- QR code checker
- Scan history
- Security alerts
- Safety Academy
- Profile
- Account settings
- Privacy settings
- Notification preferences
- Admin dashboard preview
- Custom 404 page

## Shared UI components

- `BrandLogo.jsx`: reusable brand mark and wordmark
- `DemoBadge.jsx`: consistent prototype indicator
- `PublicLayout.jsx`: public navigation and footer
- `AppLayout.jsx`: workspace sidebar, top bar and page outlet
- Shared page, card, field, button and notice components in `PrototypePages.jsx`

## Demo interaction boundaries

Forms may show local preview messages, filters may change visible sample rows, and tabs/lesson previews may update local component state. Nothing is sent to a server. No submitted URL is fetched. No real account, email, scan, alert, admin or privacy operation is performed.

## Validation performed during preparation

- Parsed all 10 JavaScript/JSX source files successfully with a JavaScript parser.
- Verified all relative imports resolve to local source files.
- Confirmed no `.ts` or `.tsx` source files remain.
- Added Vitest/Testing Library UI tests.

A full Vite build and Vitest run could not be completed in the preparation environment because the uploaded `node_modules` contained Windows-specific native packages, while the validation environment is Linux. Install dependencies on the target machine using `npm install`, then run the validation commands in `web/README.md`.
