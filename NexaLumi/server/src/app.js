import express from 'express';
import { CLASSIFICATIONS } from '../../shared/classifications.js';
import { MAX_URL_LENGTH } from '../../shared/url.js';
import { getConfig } from './config.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { createLinkChecker } from './services/linkChecker.js';

function applyCors(req, res, origins) {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && origins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  } else if (origins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

export function createApp(options = {}) {
  const config = options.config || getConfig();
  const checker =
    options.checker ||
    createLinkChecker({
      ...options,
      timeoutMs: config.webRiskTimeoutMs,
      getApiKey: () => config.googleWebRiskApiKey,
    });
  const app = express();

  app.disable('x-powered-by');
  // The API is intended to sit behind one trusted hosting proxy in production.
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cache-Control', 'no-store');
    if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  app.use(express.json({ limit: '8kb' }));

  app.use((req, res, next) => {
    applyCors(req, res, config.corsOrigins);
    if (req.method === 'OPTIONS') return res.status(204).end();
    return next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'nexalumi-link-checker' });
  });

  app.post(
    '/api/link-check',
    createRateLimiter({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
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
