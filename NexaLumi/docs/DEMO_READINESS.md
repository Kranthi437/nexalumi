# NEXALUMI company demo readiness

## What can be demonstrated in this release

- Public NEXALUMI landing page and responsive workspace UI
- Link Checker URL validation and backend request flow
- Google Web Risk Lookup integration when a valid backend API key is configured
- Four honest outcomes: Known Malicious, Suspicious, No Known Threat Found, and Unknown / Unable to Check
- Clear explanations, heuristic warnings and user recommendations
- No submitted website is fetched, opened or crawled by the NEXALUMI backend
- No user accounts, database or persistent scan history

## What must be described as roadmap / preview

- Message Checker, Email Checker and QR Checker analysis
- User accounts, saved scan history, notifications and admin operations
- Automated email/contact workflows and user profile persistence
- Multi-tenant company dashboards, organization management and enterprise reporting

## Before a live company demonstration

1. Deploy the Express API and verify `/api/health`.
2. Configure a restricted Google Web Risk API key on the backend only.
3. Configure the frontend `VITE_API_BASE_URL` and redeploy the Vercel frontend.
4. Confirm the browser can call the API and the backend CORS allowlist contains the frontend origin.
5. Run a normal benign URL through the live provider and confirm the status says `Completed`.
6. Run safe mocked test cases for malicious, suspicious, no-match, missing-key and timeout responses. Do not test with real harmful destinations.
7. Confirm no API key appears in the browser's source, network requests or built assets.
8. Explain that a no-match result is not a safety guarantee and that the other checker modules are not yet live.

## Suggested 60-second demo narrative

“NEXALUMI is a consumer-focused digital safety experience. A user can paste an unfamiliar website address, and the Link Checker validates it before sending it to our backend. The backend checks the address with Google Web Risk and returns a plain-language result. We do not open or crawl the submitted website, and we do not store scan history in this release. The result explains what was found and what the user should do next. A no-match result is not a guarantee of safety. Additional message, email and QR workflows are planned modules.”

## Commercial launch gaps

This is a working MVP, not a fully audited commercial cybersecurity service. Before broad public or enterprise use, plan an independent security assessment, privacy and legal review, service monitoring, abuse protection, incident response, API quota/cost controls, uptime commitments and a support process. Enterprise acquisition conversations should distinguish the current MVP from the roadmap.
