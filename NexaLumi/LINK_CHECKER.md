# NEXALUMI Link Checker

The Link Checker accepts HTTP/HTTPS URLs and checks their reputation against configured community threat-intelligence sources. It never opens or crawls the submitted destination.

## Active provider chain

- PhishTank: verified phishing URL lookups (free app key recommended; limited lookups may work without one).
- URLhaus: malware distribution URL lookups (free abuse.ch Auth-Key required; community API is fair-use and commercial use may require the paid enhanced API).
- AlienVault OTX: community threat-intelligence URL indicator lookup (API key required).
- Google Web Risk: implementation retained in `server/src/services/threatIntel/googleWebRisk.js`, but import/registration is commented out in the active registry. It is not called.

The providers are queried in parallel. A positive result from any successful provider produces `Known Malicious`. A no-match result is returned only when at least one configured provider successfully completed. If all active providers fail, the result is `Unknown / Unable to Check`.

## Architecture

```text
React/Vite
  -> POST /api/link-check { url }
     -> server-side URL validation (HTTP/HTTPS only)
     -> local URL heuristics (including Punycode)
     -> SHA-256 cache key / optional Upstash Redis cache
     -> parallel PhishTank + URLhaus + OTX lookups
     -> aggregate evidence + provider status
  <- classification, explanations, warnings, recommendations
```

The backend sends the URL to threat-intelligence providers. It does not make an HTTP request to the submitted host. Users should not submit private URLs, signed URLs or links containing tokens.

## Related checkers

- Message Checker: backend pattern-based analysis of pasted text.
- Email Checker: content heuristics and SPF/DMARC DNS record-presence checks. It does not cryptographically verify DKIM or evaluate full SPF/DMARC authentication.
- QR Checker: browser-native BarcodeDetector decoding where supported; decoded destination is sent to Link Checker.
- Scan History: browser-local storage, not account-backed.

Accounts, persistent server history, full admin operations, notifications, subscriptions and the sample dashboard metrics remain prototypes/under development.

See `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, and `docs/PRIVACY.md` for setup and limitations.
