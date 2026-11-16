# Data model (prototype)

No database is used yet. Browser `localStorage` holds:

## DemoSession

- displayName, email, startedAt

Passwords from the forms are not stored.

## ScanRecord

- scanId, scanType, result, riskLevel, redactedSubject, checkedAt, findingCount

Raw URL query strings with credentials are not stored. Message history keeps a short redacted summary only.

Retention: up to 50 records on the device. Users can delete one record or clear all from Settings.
