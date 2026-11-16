import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_URL_LENGTH, normalizeAndValidateUrl } from '../../shared/url.js';

describe('normalizeAndValidateUrl', () => {
  it('accepts a valid HTTP URL', () => {
    const result = normalizeAndValidateUrl('http://example.com/path');
    assert.equal(result.ok, true);
    assert.equal(result.hostname, 'example.com');
    assert.equal(result.protocol, 'http:');
  });

  it('accepts a valid HTTPS URL', () => {
    const result = normalizeAndValidateUrl('https://example.com');
    assert.equal(result.ok, true);
    assert.match(result.normalizedUrl, /^https:\/\/example\.com\/?/);
  });

  it('rejects an empty URL', () => {
    const result = normalizeAndValidateUrl('   ');
    assert.equal(result.ok, false);
    assert.equal(result.code, 'EMPTY');
  });

  it('rejects an invalid URL', () => {
    const result = normalizeAndValidateUrl('https://');
    assert.equal(result.ok, false);
    assert.equal(result.code, 'INVALID');
  });

  it('rejects unsupported protocols', () => {
    for (const value of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,hi', 'ftp://example.com']) {
      const result = normalizeAndValidateUrl(value);
      assert.equal(result.ok, false);
      assert.equal(result.code, 'UNSUPPORTED_PROTOCOL');
    }
  });

  it('keeps query parameters, paths and fragments', () => {
    const result = normalizeAndValidateUrl('https://example.com/a/b?q=1&x=2#section');
    assert.equal(result.ok, true);
    assert.match(result.normalizedUrl, /q=1/);
    assert.match(result.normalizedUrl, /x=2/);
    assert.match(result.normalizedUrl, /#section/);
  });

  it('normalizes incomplete hostnames onto https', () => {
    const result = normalizeAndValidateUrl('example.com/help');
    assert.equal(result.ok, true);
    assert.equal(result.protocol, 'https:');
    assert.equal(result.hostname, 'example.com');
  });

  it('supports internationalized domain names where the URL parser does', () => {
    const result = normalizeAndValidateUrl('https://münchen.example');
    assert.equal(result.ok, true);
    assert.ok(result.hostname.includes('xn--') || result.hostname.includes('münchen'));
  });

  it('rejects extremely long input', () => {
    const result = normalizeAndValidateUrl(`https://example.com/${'a'.repeat(MAX_URL_LENGTH)}`);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'TOO_LONG');
  });

  it('removes credentials from returned display and lookup URLs', () => {
    const result = normalizeAndValidateUrl('https://user:secret@example.com/login');
    assert.equal(result.ok, true);
    assert.equal(result.normalizedUrl.includes('secret'), false);
    assert.equal(result.parsed.username, 'user');
  });
});
