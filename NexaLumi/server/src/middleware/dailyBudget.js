export function createDailyBudget({ limit = 5000, redisUrl = '', redisToken = '', fetchImpl = fetch, now = () => new Date() } = {}) {
  let localDay = '';
  let localCount = 0;
  return async function dailyBudget(req, res, next) {
    const date = now().toISOString().slice(0, 10);
    const weight = Array.isArray(req.body?.urls) ? req.body.urls.length : 1;
    let count;
    if (redisUrl && redisToken) {
      try {
        const key = `nexalumi:daily-check-budget:${date}`;
        const response = await fetchImpl(`${redisUrl.replace(/\/$/, '')}/pipeline`, {
          method: 'POST', headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([['INCRBY', key, weight], ['EXPIRE', key, 172800, 'NX']]),
        });
        if (!response.ok) throw new Error('Daily budget store unavailable');
        const payload = await response.json();
        count = Number(payload?.[0]?.result);
        if (!Number.isFinite(count)) throw new Error('Invalid daily budget response');
      } catch {
        res.setHeader('X-Daily-Budget-Mode', 'local-fallback');
        if (localDay !== date) { localDay = date; localCount = 0; }
        localCount += weight; count = localCount;
      }
    } else {
      if (localDay !== date) { localDay = date; localCount = 0; }
      localCount += weight; count = localCount;
    }
    res.setHeader('X-Daily-Check-Limit', String(limit));
    res.setHeader('X-Daily-Check-Remaining', String(Math.max(0, limit - count)));
    if (count > limit) return res.status(429).json({ error: 'The daily link-check allowance has been reached. Please try again tomorrow.', retryable: false, classification: 'Unknown / Unable to Check' });
    return next();
  };
}
