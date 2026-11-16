# Security notes

## Implemented

- Backend validates submitted URLs independently; only HTTP and HTTPS are accepted.
- The backend never fetches, opens or crawls submitted destinations.
- API credentials remain server-side and are never returned by `/api/providers`.
- Provider calls have timeouts and malformed/provider-error responses do not become a clean verdict.
- Punycode, userinfo, IP hostnames, suspicious suffixes, unusual ports and other URL patterns can produce heuristic warnings.
- A SHA-256 hash of the normalized URL is used as the local/shared cache key; the raw URL is not the cache key.
- Request bodies and URL lengths are limited.
- Per-IP rate limiting and a daily link-check allowance are implemented. Upstash Redis REST can provide shared counters across backend replicas.
- Optional Upstash Redis stores shared threat lookup cache entries.
- API responses use `Cache-Control: no-store` and baseline security headers.
- React renders user-submitted text as text, not HTML.
- Email DNS checks use the parsed From domain; they do not execute arbitrary network requests to the submitted URL.

## Important limitations / required hardening

- Without Upstash configured, rate limiting, daily budget and reputation cache are process-local and reset on restart. Do not scale horizontally without Redis.
- Redis failures fall back to local limits/cache and are surfaced with response headers; monitor these fallback headers.
- `TRUST_PROXY` must match the actual trusted reverse-proxy chain. Do not blindly trust arbitrary client-supplied forwarded headers.
- The service forwards submitted URLs to third-party reputation providers. Avoid sensitive/private URLs and clearly disclose provider sharing.
- Email SPF/DMARC functionality checks DNS record presence only. It does not prove an email passed authentication. DKIM cryptographic verification is not implemented.
- Message and email content analysis is heuristic and may have false positives/negatives.
- QR decoding depends on browser BarcodeDetector support.
- User authentication, authorization, database-backed user data, admin operations, audit logs, WAF/bot protection and centralized security monitoring are not implemented.
- Formal penetration testing, independent audit and compliance certification are not performed.

## Launch guidance

- Review every provider's terms, fair-use policy and commercial rights. URLhaus community API usage by for-profit businesses may require its enhanced commercial API.
- Configure Upstash Redis and monitor `X-RateLimit-Mode` / `X-Daily-Budget-Mode` fallback headers.
- Keep CORS origins restricted to actual frontend domains and use HTTPS.
- Configure proxy trust correctly for your host.
- Do not log raw URLs, email bodies or request bodies in access logs, analytics or error trackers.
- Apply provider API quotas, alerting, and independent security/load testing before broad public traffic.

NEXALUMI is a decision-support tool, not a guarantee of safety. No-match results can miss new, targeted or unlisted threats.
