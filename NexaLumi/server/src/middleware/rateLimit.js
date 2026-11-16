import { createHash } from 'node:crypto';

export function createRateLimiter({ windowMs = 60_000, max = 20, now = () => Date.now(), redisUrl = '', redisToken = '', fetchImpl = fetch } = {}) {
  const hits = new Map();
  function localHit(key, current) {
    for (const [storedKey, bucket] of hits) if (current - bucket.start >= windowMs) hits.delete(storedKey);
    const bucket = hits.get(key) || { start: current, count: 0 };
    if (current - bucket.start >= windowMs) { bucket.start = current; bucket.count = 0; }
    bucket.count += 1;
    hits.set(key, bucket);
    return { count: bucket.count, resetMs: Math.max(0, windowMs - (current - bucket.start)), distributed: false };
  }
  return async function rateLimit(req, res, next) {
    const current = now();
    const client = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = createHash('sha256').update(`${req.baseUrl || ''}${req.path || ''}:${client}`).digest('hex');
    let hit;
    if (redisUrl && redisToken) {
      try {
        const response = await fetchImpl(`${redisUrl.replace(/\/$/, '')}/pipeline`, {
          method: 'POST', headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([['INCR', `nexalumi:ratelimit:${key}`], ['PEXPIRE', `nexalumi:ratelimit:${key}`, windowMs, 'NX'], ['PTTL', `nexalumi:ratelimit:${key}`]]),
        });
        if (!response.ok) throw new Error('Redis rate-limit request failed');
        const payload = await response.json();
        const count = Number(payload?.[0]?.result);
        const ttl = Number(payload?.[2]?.result);
        if (!Number.isFinite(count) || !Number.isFinite(ttl)) throw new Error('Invalid Redis rate-limit response');
        hit = { count, resetMs: Math.max(0, ttl), distributed: true };
      } catch {
        hit = localHit(key, current);
        res.setHeader('X-RateLimit-Mode', 'local-fallback');
      }
    } else hit = localHit(key, current);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - hit.count)));
    res.setHeader('X-RateLimit-Reset-Ms', String(hit.resetMs));
    if (hit.count > max) return res.status(429).json({ error: 'Too many checks from this address. Please wait a moment and try again.', retryable: true, classification: 'Unknown / Unable to Check' });
    return next();
  };
}
