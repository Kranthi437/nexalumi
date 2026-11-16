# NEXALUMI demo readiness

## What can be demonstrated in this update

- Public NEXALUMI landing page and responsive workspace UI.
- Link Checker with active PhishTank, URLhaus and AlienVault OTX adapters when configured.
- Google Web Risk adapter source retained but commented out/disabled in the active registry.
- Four Link Checker outcomes: Known Malicious, Suspicious, No Known Threat Found, and Unknown / Unable to Check.
- Provider-by-provider evidence and local URL heuristics.
- Message Checker using server-side content heuristics.
- Email Checker using content heuristics and sender-domain SPF/DMARC DNS record-presence checks (not full authentication).
- QR Checker using browser-native QR decoding where supported, followed by URL reputation lookup.
- Browser-local scan history.
- No submitted website is fetched, opened or crawled by the NEXALUMI backend.

## Must remain clearly labelled as prototype / under development

- Dashboard counts and safety snapshot (illustrative metrics).
- Login, signup and password reset (no authentication service).
- Profile, account settings and notifications (not persisted to a database).
- Admin console (visual concept only; no admin operations or authorization).
- Learning progress and some content metrics (illustrative).
- Cross-device scan history, account-backed storage, subscriptions, organization dashboards and enterprise reporting.

## Before a live company demonstration

1. Deploy the API and verify `/api/health` and `/api/providers`.
2. Configure PhishTank app key, URLhaus Auth-Key and OTX API key where available.
3. Verify actual provider status in the Link Checker; do not interpret a result with all providers unavailable as safe.
4. Configure Upstash Redis for shared rate limits, daily budget and cache before scaling to multiple instances.
5. Confirm frontend API URL and backend CORS origins.
6. Run benign URL checks and mocked provider tests. Use only provider-approved safe test indicators; do not visit live malicious destinations.
7. Confirm no API credentials appear in browser source, network requests or built assets.
8. Explain provider data sharing, free-tier/fair-use limits and that a no-match result is not a safety guarantee.
9. Keep demo-only modules visibly marked until real authentication, persistence, authorization and operations exist.

## Commercial launch gaps

This is an implementation candidate, not a fully audited commercial cybersecurity service. Before broad public or enterprise use, plan an independent security assessment, legal/privacy review, provider commercial-use review, monitoring, abuse protection, incident response, persistent user-data design, service-level objectives and a support process.
