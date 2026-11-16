import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGoogleWebRiskProvider } from '../src/services/threatIntel/googleWebRisk.js';

describe('Google Web Risk provider', () => {
  it('returns missing_api_key without calling fetch', async () => {
    let called = false;
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => '',
      fetchImpl: async () => {
        called = true;
        return new Response('{}');
      },
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(called, false);
    assert.equal(result.status, 'missing_api_key');
    assert.equal(result.ok, false);
  });

  it('maps a timeout to an unknown-capable status', async () => {
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => 'test-key',
      timeoutMs: 10,
      fetchImpl: async (_url, options) => {
        await new Promise((_, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      },
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(result.status, 'timeout');
    assert.equal(result.ok, false);
    assert.equal(result.matched, false);
  });

  it('sends the API key in a header instead of the request URL', async () => {
    let requestUrl = '';
    let requestHeaders = {};
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => 'private-test-key',
      fetchImpl: async (url, options) => {
        requestUrl = String(url);
        requestHeaders = options.headers;
        return new Response('{}', { status: 200 });
      },
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(result.status, 'completed');
    assert.equal(requestUrl.includes('private-test-key'), false);
    assert.equal(requestHeaders['X-Goog-Api-Key'], 'private-test-key');
  });

  it('does not treat an unexpected provider payload as a clean result', async () => {
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => 'test-key',
      fetchImpl: async () => new Response('{"unexpected":true}', { status: 200 }),
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(result.status, 'unavailable');
    assert.equal(result.ok, false);
  });

  it('treats malformed threat categories as unavailable', async () => {
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => 'test-key',
      fetchImpl: async () => new Response('{\"threat\":{\"threatTypes\":[123]}}', { status: 200 }),
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(result.status, 'unavailable');
    assert.equal(result.ok, false);
  });

  it('maps provider errors to unavailable', async () => {
    const provider = createGoogleWebRiskProvider({
      getApiKey: () => 'test-key',
      fetchImpl: async () => new Response('nope', { status: 503 }),
    });
    const result = await provider.lookup('https://example.com/');
    assert.equal(result.status, 'unavailable');
  });
});
