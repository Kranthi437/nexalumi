import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDailyBudget } from '../src/middleware/dailyBudget.js';

describe('daily link-check budget', () => {
  it('counts a bulk request by URL count and blocks over the limit', async () => {
    const middleware = createDailyBudget({ limit: 3, now: () => new Date('2026-11-16T00:00:00.000Z') });
    const first = { body: { urls: ['a', 'b'] } };
    const res1 = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    let called = false;
    await middleware(first, res1, () => { called = true; });
    assert.equal(called, true);
    const second = { body: { url: 'c' } };
    const res2 = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await middleware(second, res2, () => { called = true; });
    const third = { body: { url: 'd' } };
    const res3 = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await middleware(third, res3, () => {});
    assert.equal(res3.code, 429);
    assert.match(res3.body.error, /daily link-check allowance/i);
  });
});
