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
    googleWebRiskApiKey: (process.env.GOOGLE_WEB_RISK_API_KEY || '').trim(),
    webRiskTimeoutMs: Number(process.env.WEB_RISK_TIMEOUT_MS) || 8000,
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 20,
  };
}
