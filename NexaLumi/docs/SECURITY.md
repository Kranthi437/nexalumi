# Security notes

## Implemented in the Link Checker

- The backend validates submitted URLs independently of frontend validation.
- Only HTTP and HTTPS schemes are accepted.
- The backend never fetches, opens or crawls the submitted website.
- Google Web Risk credentials stay in backend environment variables and are sent in an HTTP header.
- Request bodies and URL lengths are limited.
- An in-memory per-process rate limiter protects the endpoint.
- Provider timeouts, rate limits, missing credentials and malformed responses produce an unknown result.
- Raw submitted URLs are not written to application logs by this code.
- URL userinfo credentials are removed before returning the display value and before provider lookup.
- API responses use `Cache-Control: no-store` and baseline security headers.
- React renders submitted values as text, not HTML.

## Not implemented in this release

- Authentication, user accounts, database, scan history or persistent storage
- Distributed rate limiting / WAF / bot management
- Centralized security monitoring and alerting
- Formal penetration testing, independent audit or compliance certification
- Message, email and QR threat analysis

## Launch guidance

- Restrict the Google API key to the Web Risk API and monitor its quota.
- Keep CORS origins limited to the production frontend domains.
- Use HTTPS for both frontend and backend.
- Do not expose raw URLs in application logs, analytics or error trackers.
- Use a production Node.js host and keep dependencies patched.
- Add a WAF or managed abuse protection before broad public traffic.
- Complete privacy, terms, data handling and incident response reviews before commercial use.

NEXALUMI is an assistance tool, not a guarantee of safety. Google Web Risk no-match results can miss new, targeted or otherwise unlisted threats.
