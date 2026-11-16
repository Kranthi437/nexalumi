import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { createApp } from '../src/app.js';

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
  });
}

describe('message and email checker API', () => {
  const servers = [];
  after(async () => Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve)))));
  async function start() { const result = await listen(createApp({ emailAuthInspector: async () => ({ checked: true, senderDomain: 'example.com', spf: { status: 'not_found' }, dmarc: { status: 'not_found' } }), config: { corsOrigins: ['*'], rateLimitWindowMs: 60000, rateLimitMax: 100 } })); servers.push(result.server); return result.url; }
  it('detects urgency and credential language in a message', async () => {
    const base = await start();
    const response = await fetch(`${base}/api/message-check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Urgent! Your account is blocked. Send your OTP immediately.' }) });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.classification, 'Suspicious');
    assert.ok(body.findings.some((finding) => finding.code === 'CREDENTIAL_REQUEST'));
  });
  it('returns a non-verification disclaimer for email checks', async () => {
    const base = await start();
    const response = await fetch(`${base}/api/email-check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'From: security@example.com\nSubject: Verify your account immediately\nClick https://example.invalid' }) });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.match(body.disclaimer, /no sender authentication/i);
    assert.equal(body.headerAnalysis.authentication.checked, true);
  });
});
