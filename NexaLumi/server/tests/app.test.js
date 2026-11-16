import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { CLASSIFICATIONS } from '../../shared/classifications.js';
import { createApp } from '../src/app.js';
import { createLinkChecker } from '../src/services/linkChecker.js';

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

const cleanProvider = {
  name: 'Test threat provider',
  async lookup() {
    return {
      ok: true,
      status: 'completed',
      matched: false,
      categories: [],
      provider: 'Test threat provider',
    };
  },
};

describe('link check HTTP API', () => {
  const servers = [];

  after(async () => {
    await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
  });

  async function start(options) {
    const started = await listen(createApp(options));
    servers.push(started.server);
    return started.url;
  }

  it('accepts a valid HTTPS URL', async () => {
    const base = await start({ checker: createLinkChecker({ provider: cleanProvider }) });
    const response = await fetch(`${base}/api/link-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/path?q=1' }),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.classification, CLASSIFICATIONS.NO_KNOWN_THREAT);
    assert.equal(body.hostname, 'example.com');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });

  it('rejects an empty URL', async () => {
    const base = await start({ checker: createLinkChecker({ provider: cleanProvider }) });
    const response = await fetch(`${base}/api/link-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.classification, CLASSIFICATIONS.UNKNOWN);
  });

  it('rejects unsupported protocols', async () => {
    const base = await start({ checker: createLinkChecker({ provider: cleanProvider }) });
    const response = await fetch(`${base}/api/link-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'javascript:alert(1)' }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.error, /http and https/i);
  });

  it('rejects a missing url field', async () => {
    const base = await start({ checker: createLinkChecker({ provider: cleanProvider }) });
    const response = await fetch(`${base}/api/link-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 400);
  });

  it('supports bulk checks with per-URL results', async () => {
    const checker = { async check(url) { return { statusCode: 200, result: { submittedUrl: url, hostname: new URL(url).hostname, classification: 'No Known Threat Found' } }; } };
    const base = await start({ checker });
    const response = await fetch(`${base}/api/link-check/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: ['https://example.com', 'https://example.org'] }) });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.count, 2);
    assert.equal(body.results.length, 2);
  });

  it('rate limits repeated requests', async () => {
    const base = await start({
      checker: createLinkChecker({ provider: cleanProvider }),
      config: {
        corsOrigins: ['http://localhost:5173'],
        rateLimitWindowMs: 60_000,
        rateLimitMax: 2,
      },
    });
    const payload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    };
    assert.equal((await fetch(`${base}/api/link-check`, payload)).status, 200);
    assert.equal((await fetch(`${base}/api/link-check`, payload)).status, 200);
    const limited = await fetch(`${base}/api/link-check`, payload);
    assert.equal(limited.status, 429);
  });
});
