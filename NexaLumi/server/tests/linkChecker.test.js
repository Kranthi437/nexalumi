import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CLASSIFICATIONS } from '../../shared/classifications.js';
import { createLinkChecker } from '../src/services/linkChecker.js';

describe('link checker service', () => {
  it('classifies a mocked malicious response as Known Malicious', async () => {
    const checker = createLinkChecker({
      provider: {
        name: 'Google Web Risk',
        async lookup() {
          return {
            ok: true,
            status: 'completed',
            matched: true,
            categories: ['SOCIAL_ENGINEERING'],
            provider: 'Google Web Risk',
          };
        },
      },
    });
    const { result } = await checker.check('https://example.com/login');
    assert.equal(result.classification, CLASSIFICATIONS.KNOWN_MALICIOUS);
    assert.deepEqual(result.threatIntel.categories, ['Social engineering']);
    assert.equal(result.detectionSource, 'Google Web Risk');
    assert.match(result.explanation, /confirmed threat-intelligence/i);
  });

  it('classifies a clean provider response as No Known Threat Found', async () => {
    const checker = createLinkChecker({
      provider: {
        name: 'Google Web Risk',
        async lookup() {
          return {
            ok: true,
            status: 'completed',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        },
      },
    });
    const { result } = await checker.check('https://example.com');
    assert.equal(result.classification, CLASSIFICATIONS.NO_KNOWN_THREAT);
    assert.match(result.explanation, /does not guarantee safety/i);
  });

  it('classifies heuristic-only findings as Suspicious', async () => {
    const checker = createLinkChecker({
      provider: {
        name: 'Google Web Risk',
        async lookup() {
          return {
            ok: true,
            status: 'completed',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        },
      },
    });
    const { result } = await checker.check('https://secure-login.example.tk');
    assert.equal(result.classification, CLASSIFICATIONS.SUSPICIOUS);
    assert.equal(result.detectionSource, 'NEXALUMI heuristics');
    assert.ok(result.heuristicWarnings.length > 0);
    assert.match(result.explanation, /not confirmed detections/i);
  });

  it('does not treat a missing API key as a safe result', async () => {
    const checker = createLinkChecker({
      provider: {
        name: 'Google Web Risk',
        async lookup() {
          return {
            ok: false,
            status: 'missing_api_key',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        },
      },
    });
    const { result } = await checker.check('https://example.com');
    assert.equal(result.classification, CLASSIFICATIONS.UNKNOWN);
    assert.equal(result.threatIntel.status, 'missing_api_key');
  });

  it('does not treat provider timeouts as safe', async () => {
    const checker = createLinkChecker({
      provider: {
        name: 'Google Web Risk',
        async lookup() {
          return {
            ok: false,
            status: 'timeout',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        },
      },
    });
    const { result } = await checker.check('https://example.com');
    assert.equal(result.classification, CLASSIFICATIONS.UNKNOWN);
    assert.equal(result.retryable, true);
  });
});
