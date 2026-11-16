import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { inspectEmailAuthentication } from '../src/services/emailAuth.js';

describe('email authentication DNS inspection', () => {
  it('checks SPF and DMARC record presence for the From domain', async () => {
    const resolver = async (name) => name === 'example.com' ? [['v=spf1 include:_spf.example.com ~all']] : [['v=DMARC1; p=quarantine']];
    const result = await inspectEmailAuthentication('From: Security <notice@example.com>\nSubject: Hello', resolver);
    assert.equal(result.senderDomain, 'example.com');
    assert.equal(result.spf.status, 'record_found');
    assert.equal(result.dmarc.status, 'record_found');
  });
  it('does not claim verification without a From header', async () => {
    const result = await inspectEmailAuthentication('Subject: Hello', async () => []);
    assert.equal(result.checked, false);
  });
});
