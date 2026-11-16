# Privacy and data handling notice (engineering draft)

This document is an engineering description, not legal advice or a final privacy policy. Obtain legal review for applicable Indian and international privacy requirements before launch.

## Data sent for checks

- Link Checker: the submitted URL is sent to the NEXALUMI API and forwarded to configured third-party threat-intelligence providers (PhishTank, URLhaus and AlienVault OTX). The full URL, including its path and query string, may be visible to those providers. Do not submit private URLs, password-reset links, signed URLs, session tokens or other secrets.
- Message Checker: pasted message text is sent to the NEXALUMI API for heuristic analysis. Do not include personal, financial or confidential data.
- Email Checker: pasted email content and headers are sent to the NEXALUMI API. When a valid From header is provided, the backend performs DNS TXT lookups for the sender domain's SPF and DMARC records and may query a DKIM selector if it is present in Authentication-Results. This is not full message authentication.
- QR Checker: image decoding happens locally in the browser where BarcodeDetector is supported. The decoded destination is then sent to the Link Checker providers.

## Storage

- Link reputation results are cached in process memory, or in configured Upstash Redis. Cache keys are SHA-256 hashes of normalized URLs. Cached values contain provider verdict metadata, not the submitted URL itself.
- Scan history is stored in local browser storage only. It is not synced to a server or account.
- Server request logging should be configured not to record request bodies or full submitted URLs. Hosting providers may retain infrastructure logs under their own policies.

## Third-party providers

Review each provider's terms, retention policy, acceptable-use policy and commercial license before production use. URLhaus community API is subject to fair-use principles and commercial or for-profit use may require an enhanced paid API. PhishTank's terms describe API data as available for commercial use without charge, but accuracy is not warranted. Confirm all current terms before launch.

## User controls

Users can clear local scan history from the History screen or clear browser site data. A future authenticated product needs server-side retention controls and a user data deletion workflow.
