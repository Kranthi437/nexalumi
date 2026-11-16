import express from 'express';
import { CLASSIFICATIONS } from '../../shared/classifications.js';
import { MAX_URL_LENGTH } from '../../shared/url.js';
import { getConfig } from './config.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { createDailyBudget } from './middleware/dailyBudget.js';
import { createLinkChecker } from './services/linkChecker.js';
import { inspectEmailAuthentication } from './services/emailAuth.js';

const MESSAGE_PATTERNS = [
  { code: 'URGENT_PRESSURE', severity: 'medium', pattern: /\b(urgent|immediately|within 24 hours|act now|final warning|account.{0,20}(suspend|blocked|close))\b/i, message: 'The message uses urgency or account-pressure language.' },
  { code: 'CREDENTIAL_REQUEST', severity: 'high', pattern: /\b(password|one[- ]time passcode|otp|verification code|pin)\b/i, message: 'The message mentions credentials or one-time codes. Never share these in response to an unsolicited message.' },
  { code: 'PAYMENT_PRESSURE', severity: 'high', pattern: /\b(gift card|crypto(currency)?|wire transfer|urgent payment|pay immediately)\b/i, message: 'The message requests an unusual or pressured payment method.' },
  { code: 'LINK_PRESENT', severity: 'low', pattern: /https?:\/\//i, message: 'The message contains a link. Check the destination independently before opening it.' },
  { code: 'IMPERSONATION_LANGUAGE', severity: 'medium', pattern: /\b(verify your (account|identity)|unusual activity|claim your prize|your parcel is held)\b/i, message: 'The wording resembles common impersonation or social-engineering lures.' },
];
function analyzeText(value) {
  return MESSAGE_PATTERNS.filter((item) => item.pattern.test(value)).map(({ code, severity, message }) => ({ code, severity, message }));
}

function applyCors(req, res, origins) {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && origins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  } else if (origins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

export function createApp(options = {}) {
  const config = options.config || getConfig();
  const dailyBudget = createDailyBudget({ limit: config.maxLinkChecksPerDay || 5000, redisUrl: config.upstashRedisRestUrl, redisToken: config.upstashRedisRestToken });
  const checker =
    options.checker ||
    createLinkChecker({
      ...options,
      timeoutMs: config.threatProviderTimeoutMs,
      config,
    });
  const app = express();

  app.disable('x-powered-by');
  // The API is intended to sit behind one trusted hosting proxy in production.
  app.set('trust proxy', config.trustProxy);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cache-Control', 'no-store');
    if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  app.use(express.json({ limit: '64kb' }));

  app.use((req, res, next) => {
    applyCors(req, res, config.corsOrigins);
    if (req.method === 'OPTIONS') return res.status(204).end();
    return next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'nexalumi-api', timestamp: new Date().toISOString() });
  });

  app.get('/api/providers', (_req, res) => {
    res.json({ providers: [
      { name: 'PhishTank', configured: true, apiKeyConfigured: Boolean(config.phishTankAppKey), keyOptional: true, coverage: 'Community-verified phishing URLs' },
      { name: 'URLhaus', configured: Boolean(config.urlhausAuthKey), coverage: 'Malware distribution URLs' },
      { name: 'AlienVault OTX', configured: Boolean(config.otxApiKey), coverage: 'Community threat intelligence' },
      // Google Web Risk adapter remains in source for future re-enablement; intentionally disabled.
    ] });
  });

  app.post('/api/link-check/bulk', dailyBudget, createRateLimiter({ windowMs: config.rateLimitWindowMs, max: Math.max(1, Math.floor(config.rateLimitMax / 2)), redisUrl: config.upstashRedisRestUrl, redisToken: config.upstashRedisRestToken }), async (req, res) => {
    const urls = req.body?.urls;
    if (!Array.isArray(urls) || urls.length < 1 || urls.length > 10 || !urls.every((item) => typeof item === 'string')) {
      return res.status(400).json({ error: 'Provide an array of 1 to 10 URL strings.' });
    }
    const results = await Promise.all(urls.map(async (url) => {
      if (url.length > MAX_URL_LENGTH) return { submittedUrl: url.slice(0, 100), classification: CLASSIFICATIONS.UNKNOWN, error: 'URL exceeds the maximum length.' };
      const checked = await checker.check(url);
      return checked.result;
    }));
    return res.json({ results, checkedAt: new Date().toISOString(), count: results.length });
  });

  app.post(
    '/api/link-check',
    dailyBudget,
    createRateLimiter({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      redisUrl: config.upstashRedisRestUrl,
      redisToken: config.upstashRedisRestToken,
    }),
    async (req, res) => {
      try {
        if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
          return res.status(400).json({
            error: 'Send a JSON object with a url field.',
            classification: CLASSIFICATIONS.UNKNOWN,
            retryable: false,
          });
        }

        if (typeof req.body.url !== 'string') {
          return res.status(400).json({
            error: 'Enter a website address to check.',
            classification: CLASSIFICATIONS.UNKNOWN,
            retryable: false,
          });
        }

        if (req.body.url.length > MAX_URL_LENGTH) {
          return res.status(400).json({
            error: `That address is too long to check. Use ${MAX_URL_LENGTH} characters or fewer.`,
            classification: CLASSIFICATIONS.UNKNOWN,
            retryable: false,
          });
        }

        const { statusCode, result } = await checker.check(req.body.url);
        return res.status(statusCode).json(result);
      } catch {
        return res.status(500).json({
          error: 'The check could not be completed.',
          classification: CLASSIFICATIONS.UNKNOWN,
          retryable: true,
        });
      }
    },
  );

  const maxMessageLength = config.maxMessageLength || 12000;
  app.post('/api/message-check', createRateLimiter({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax, redisUrl: config.upstashRedisRestUrl, redisToken: config.upstashRedisRestToken }), (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > maxMessageLength) return res.status(400).json({ error: `Enter message text (maximum ${maxMessageLength} characters).` });
    const findings = analyzeText(text);
    return res.json({ classification: findings.length >= 2 ? 'Suspicious' : findings.length ? 'Needs Review' : 'No obvious indicators found', findings, checkedAt: new Date().toISOString(), disclaimer: 'Heuristic guidance only; this is not a confirmed phishing verdict.' });
  });

  app.post('/api/email-check', createRateLimiter({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax, redisUrl: config.upstashRedisRestUrl, redisToken: config.upstashRedisRestToken }), async (req, res) => {
    const raw = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!raw || raw.length > maxMessageLength) return res.status(400).json({ error: `Enter email content (maximum ${maxMessageLength} characters).` });
    const findings = analyzeText(raw);
    const from = raw.match(/^From:\s*(.+)$/im)?.[1]?.trim() || null;
    const replyTo = raw.match(/^Reply-To:\s*(.+)$/im)?.[1]?.trim() || null;
    if (from && replyTo && from.toLowerCase() !== replyTo.toLowerCase()) findings.push({ code: 'REPLY_TO_MISMATCH', severity: 'medium', message: 'Reply-To differs from From. This can be legitimate, but verify the sender independently.' });
    const headerBlock = /^(from|to|subject|received|return-path|authentication-results):/im.test(raw);
    const authentication = headerBlock ? await (options.emailAuthInspector || inspectEmailAuthentication)(raw) : { checked: false, reason: 'Paste full email headers to inspect sender-domain DNS records.' };
    return res.json({ classification: findings.length >= 2 ? 'Suspicious' : findings.length ? 'Needs Review' : 'No obvious indicators found', findings, headerAnalysis: { headersProvided: headerBlock, from, replyTo, authenticationResultsPresent: /^Authentication-Results:/im.test(raw), authentication, note: 'SPF/DMARC DNS record presence is checked when a valid From header is provided. DKIM signature validation is not performed.' }, checkedAt: new Date().toISOString(), disclaimer: 'Content heuristics only; no sender authentication or mailbox verification was performed.' });
  });

  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'The request is too large.',
        classification: CLASSIFICATIONS.UNKNOWN,
        retryable: false,
      });
    }
    if (err instanceof SyntaxError) {
      return res.status(400).json({
        error: 'Send a JSON object with a url field.',
        classification: CLASSIFICATIONS.UNKNOWN,
        retryable: false,
      });
    }
    return res.status(500).json({
      error: 'The check could not be completed.',
      classification: CLASSIFICATIONS.UNKNOWN,
      retryable: true,
    });
  });

  return app;
}
