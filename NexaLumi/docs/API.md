# API reference

Base path: `/api`. JSON requests use `Content-Type: application/json`.

## `GET /health`
Returns service health and a timestamp.

## `GET /providers`
Returns provider names and configuration status. It never returns API credentials.

## `POST /link-check`
Request: `{ "url": "https://example.com" }`

Returns submitted URL, normalized hostname, classification, aggregate threat-intelligence status, provider-by-provider results, heuristic warnings, timestamp and recommendations. Accepted protocols are HTTP and HTTPS. Maximum URL length is 2048 characters.

Classifications:
- `Known Malicious`: at least one responding threat-intelligence provider confirmed a match.
- `Suspicious`: no provider match, but local URL heuristics found warning signs.
- `No Known Threat Found`: at least one active provider completed and no active provider reported a match.
- `Unknown / Unable to Check`: no active provider returned a usable result. Never interpret as safe.

## `POST /link-check/bulk`
Request: `{ "urls": ["https://example.com", "https://example.org"] }`

Accepts 1–10 URL strings. Each item returns an individual result. The route consumes the daily allowance by number of URLs.

## `POST /message-check`
Request: `{ "text": "message content" }`

Returns a heuristic classification and findings. It is not an ML model and cannot prove a message is phishing or legitimate.

## `POST /email-check`
Request: `{ "text": "From: Sender <person@example.com>\\nSubject: Hello\\n..." }`

Returns content findings and, when a valid From header is present, SPF and DMARC DNS TXT record-presence results. DKIM selector DNS presence may be inspected only when selector data is available in Authentication-Results. No cryptographic DKIM validation, SPF evaluation against the sending IP, DMARC alignment evaluation or message provenance validation is performed.

## Limits

The API applies per-IP rate limits and a daily link-check allowance. In-memory mode is process-local. Configure Upstash Redis REST URL/token for shared rate limiting and shared reputation cache. The body parser limit is 32 KB; message/email content is capped by `MAX_MESSAGE_LENGTH` (default 12,000 characters).
