export function createRateLimiter({
  windowMs = 60_000,
  max = 20,
  now = () => Date.now(),
} = {}) {
  const hits = new Map();

  function prune(current) {
    for (const [key, bucket] of hits) {
      if (current - bucket.start >= windowMs) hits.delete(key);
    }
  }

  return function rateLimit(req, res, next) {
    const current = now();
    prune(current);
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const bucket = hits.get(key) || { start: current, count: 0 };

    if (current - bucket.start >= windowMs) {
      bucket.start = current;
      bucket.count = 0;
    }

    bucket.count += 1;
    hits.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));

    if (bucket.count > max) {
      return res.status(429).json({
        error: 'Too many checks from this address. Please wait a moment and try again.',
        retryable: true,
        classification: 'Unknown / Unable to Check',
      });
    }

    return next();
  };
}
