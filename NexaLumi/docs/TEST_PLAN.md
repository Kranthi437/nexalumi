# Test plan

From `web/`:

```bash
npm test
```

Coverage in this phase:

- URL parsing and local analysis rules
- Message indicator rules
- Link Check screen: hostname preview, demo result, Demo label

Later phases should add API authorization tests, rate-limit tests, and Playwright journeys from the product brief. Tests must keep using fictional fixtures, never live malware URLs.
