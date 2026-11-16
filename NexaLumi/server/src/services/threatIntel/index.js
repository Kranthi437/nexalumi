import { createHash } from 'node:crypto';
import { createCommunityProviders } from './communityProviders.js';
// Google Web Risk implementation is intentionally retained for future re-enablement.
// import { createGoogleWebRiskProvider } from './googleWebRisk.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 5000;

export function createThreatIntelProvider(options = {}) {
  if (options.provider) return options.provider;
  const providers = options.providers || createCommunityProviders(options.config || {}, options);
  const cache = new Map();
  const inflight = new Map();
  const cacheTtlMs = Number(options.config?.cacheTtlMs) || CACHE_TTL_MS;
  const redisUrl = options.config?.upstashRedisRestUrl || '';
  const redisToken = options.config?.upstashRedisRestToken || '';
  const fetchImpl = options.fetchImpl || fetch;

  async function redisRead(cacheKey) {
    if (!redisUrl || !redisToken) return null;
    const response = await fetchImpl(`${redisUrl.replace(/\/$/, '')}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify([['GET', `nexalumi:link-cache:${cacheKey}`]]) });
    if (!response.ok) throw new Error('Redis cache read failed');
    const payload = await response.json();
    const raw = payload?.[0]?.result;
    return typeof raw === 'string' ? JSON.parse(raw) : null;
  }
  async function redisWrite(cacheKey, value) {
    if (!redisUrl || !redisToken) return;
    const response = await fetchImpl(`${redisUrl.replace(/\/$/, '')}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify([['SET', `nexalumi:link-cache:${cacheKey}`, JSON.stringify(value), 'EX', Math.max(60, Math.ceil(cacheTtlMs / 1000))]]) });
    if (!response.ok) throw new Error('Redis cache write failed');
  }

  async function lookup(normalizedUrl) {
    const now = Date.now();
    const cacheKey = createHash('sha256').update(normalizedUrl).digest('hex');
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) return { ...cached.value, cached: true };
    if (inflight.has(cacheKey)) return inflight.get(cacheKey);
    if (redisUrl && redisToken) {
      try { const remote = await redisRead(cacheKey); if (remote) { cache.set(cacheKey, { value: remote, expiresAt: now + cacheTtlMs }); return { ...remote, cached: true }; } }
      catch { /* Provider checks can continue if optional cache storage is unavailable. */ }
    }

    const task = Promise.all(providers.map(async (provider) => {
      try { return await provider.lookup(normalizedUrl); }
      catch { return { provider: provider.name || 'Threat provider', ok: false, status: 'unavailable', matched: false, categories: [] }; }
    })).then(async (checks) => {

      const successful = checks.filter(
        (item) => item.ok && item.status === 'completed'
      );

      // PhishTank is optional and does not block verification.
      const requiredChecks = checks.filter(
        (item) =>
          item.provider !== 'PhishTank' &&
          item.status !== 'not_configured'
      );

      const successfulRequired = requiredChecks.filter(
        (item) => item.ok && item.status === 'completed'
      );

      const matches = successful.filter((item) => item.matched);

      const categories = [
        ...new Set(matches.flatMap((item) => item.categories || [])),
      ];

      const matched = matches.length > 0;

      let status;

      if (requiredChecks.length === 0) {
        status = successful.length > 0 ? 'completed' : 'missing_api_key';
      } else if (successfulRequired.length === requiredChecks.length) {
        status = 'completed';
      } else if (successful.length > 0) {
        status = 'partial';
      } else if (checks.some((item) => item.status === 'rate_limited')) {
        status = 'rate_limited';
      } else if (checks.some((item) => item.status === 'timeout')) {
        status = 'timeout';
      } else {
        status = 'unavailable';
      }

      const value = {
        ok: successful.length > 0,
        status,
        matched,
        categories,
        provider:
          matches.map((item) => item.provider).join(', ') ||
          successful.map((item) => item.provider).join(', '),
        checks,
        successfulProviders: successfulRequired.length,
        configuredProviders: requiredChecks.length,
      };

      // const successful = checks.filter((item) => item.ok && item.status === 'completed');
      // const matches = successful.filter((item) => item.matched);
      // const categories = [...new Set(matches.flatMap((item) => item.categories || []))];
      // const matched = matches.length > 0;
      // const status = successful.length ? 'completed' : (checks.some((item) => item.status === 'rate_limited') ? 'rate_limited' : checks.some((item) => item.status === 'timeout') ? 'timeout' : 'unavailable');
      // const configured = checks.filter((item) => item.status !== 'not_configured');
      // const value = {
      //   ok: successful.length > 0,
      //   status,
      //   matched,
      //   categories,
      //   provider: matches.map((item) => item.provider).join(', ') || successful.map((item) => item.provider).join(', '),
      //   checks,
      //   successfulProviders: successful.length,
      //   configuredProviders: configured.length,
      // };
      if (value.ok) {
        if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
        cache.set(cacheKey, { value, expiresAt: now + cacheTtlMs });
        try { await redisWrite(cacheKey, value); } catch { /* Local cache remains usable if Redis is unavailable. */ }
      }
      return value;
    }).finally(() => inflight.delete(cacheKey));
    inflight.set(cacheKey, task);
    return task;
  }

  return { name: 'Community threat intelligence', lookup, clearCache: () => cache.clear() };
}

export { createCommunityProviders };
// export { createGoogleWebRiskProvider } from './googleWebRisk.js';
