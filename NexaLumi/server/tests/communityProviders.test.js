import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPhishTankProvider, createUrlhausProvider, createOtxProvider } from '../src/services/threatIntel/communityProviders.js';
import { createThreatIntelProvider } from '../src/services/threatIntel/index.js';

describe('community threat-intelligence providers', () => {
  it('recognizes a verified PhishTank match', async () => {
    const provider = createPhishTankProvider({ fetchImpl: async () => new Response(JSON.stringify({ results: { in_database: true, verified: true, valid: true } }), { status: 200 }) });
    const result = await provider.lookup('https://bad.example');
    assert.equal(result.matched, true);
    assert.deepEqual(result.categories, ['PHISHING']);
  });
  it('does not classify an unverified PhishTank entry as confirmed', async () => {
    const provider = createPhishTankProvider({ fetchImpl: async () => new Response(JSON.stringify({ results: { in_database: true, verified: false, valid: true } }), { status: 200 }) });
    assert.equal((await provider.lookup('https://example.test')).matched, false);
  });
  it('reports URLhaus as not configured without an Auth-Key', async () => {
    const provider = createUrlhausProvider({});
    assert.equal((await provider.lookup('https://example.test')).status, 'not_configured');
  });
  it('recognizes URLhaus malware matches', async () => {
    const provider = createUrlhausProvider({ authKey: 'test', fetchImpl: async () => new Response(JSON.stringify({ query_status: 'ok' }), { status: 200 }) });
    const result = await provider.lookup('https://bad.example/payload');
    assert.equal(result.matched, true);
    assert.deepEqual(result.categories, ['MALWARE']);
  });
  it('recognizes OTX pulse matches', async () => {
    const provider = createOtxProvider({ apiKey: 'test', fetchImpl: async () => new Response(JSON.stringify({ pulse_info: { count: 2 } }), { status: 200 }) });
    assert.equal((await provider.lookup('https://bad.example')).matched, true);
  });
  it('aggregates positive matches and reports provider details', async () => {
    const aggregate = createThreatIntelProvider({ providers: [
      { name: 'clean', lookup: async () => ({ provider: 'clean', ok: true, status: 'completed', matched: false, categories: [] }) },
      { name: 'bad', lookup: async () => ({ provider: 'bad', ok: true, status: 'completed', matched: true, categories: ['PHISHING'] }) },
    ] });
    const result = await aggregate.lookup('https://sample.test');
    assert.equal(result.matched, true);
    assert.equal(result.successfulProviders, 2);
    assert.equal(result.checks.length, 2);
  });
});
