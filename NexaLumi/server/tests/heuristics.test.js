import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateHeuristics } from '../src/services/heuristics.js';

describe('evaluateHeuristics', () => {
  it('returns no warnings for a typical example.com address', () => {
    const warnings = evaluateHeuristics(new URL('https://example.com/about'));
    assert.deepEqual(warnings, []);
  });

  it('flags concerning URL characteristics as heuristic warnings', () => {
    const warnings = evaluateHeuristics(new URL('https://secure-login.paypal.tk:8088/update'));
    const codes = warnings.map((item) => item.code);
    assert.ok(codes.includes('BRAND_KEYWORD'));
    assert.ok(codes.includes('SUSPICIOUS_TLD'));
    assert.ok(codes.includes('NONSTANDARD_PORT'));
    assert.ok(warnings.every((item) => item.source === 'NEXALUMI heuristics'));
  });
});
