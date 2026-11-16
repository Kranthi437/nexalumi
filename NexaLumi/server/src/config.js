import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnv(cwd = process.cwd()) {
  const envPath = resolve(cwd, '.env');
  if (!existsSync(envPath)) return;

  const text = readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function getConfig() {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return {
    port: Number(process.env.PORT) || 3001,
    corsOrigins: origin.split(',').map((item) => item.trim()).filter(Boolean),
    // Google Web Risk is retained in googleWebRisk.js but disabled in the active provider registry.
    // googleWebRiskApiKey: (process.env.GOOGLE_WEB_RISK_API_KEY || '').trim(),
    phishTankAppKey: (process.env.PHISHTANK_APP_KEY || '').trim(),
    urlhausAuthKey: (process.env.URLHAUS_AUTH_KEY || '').trim(),
    otxApiKey: (process.env.OTX_API_KEY || '').trim(),
    cacheTtlMs: Number(process.env.LINK_CACHE_TTL_MS) || 600000,
    threatProviderTimeoutMs: Number(process.env.THREAT_PROVIDER_TIMEOUT_MS) || 8000,
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 20,
    trustProxy: process.env.TRUST_PROXY === undefined ? 1 : (/^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY),
    upstashRedisRestUrl: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
    upstashRedisRestToken: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim(),
    maxMessageLength: Number(process.env.MAX_MESSAGE_LENGTH) || 12000,
    maxLinkChecksPerDay: Number(process.env.MAX_LINK_CHECKS_PER_DAY) || 5000,
  };
}
