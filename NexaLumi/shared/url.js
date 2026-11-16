export const MAX_URL_LENGTH = 2048;
export const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const UNSUPPORTED_PROTOCOL_MESSAGE =
  'Only http and https website addresses can be checked.';
const INVALID_URL_MESSAGE =
  'Enter a valid website address, such as https://example.com.';

export function normalizeAndValidateUrl(raw) {
  if (raw == null || String(raw).trim() === '') {
    return {
      ok: false,
      code: 'EMPTY',
      error: 'Enter a website address to check.',
    };
  }

  const submittedUrl = String(raw).trim();

  if (submittedUrl.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      code: 'TOO_LONG',
      error: `That address is too long to check. Use ${MAX_URL_LENGTH} characters or fewer.`,
    };
  }

  const schemeMatch = submittedUrl.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const protocol = `${schemeMatch[1].toLowerCase()}:`;
    if (!ALLOWED_PROTOCOLS.has(protocol)) {
      return {
        ok: false,
        code: 'UNSUPPORTED_PROTOCOL',
        error: UNSUPPORTED_PROTOCOL_MESSAGE,
      };
    }
  }

  let candidate = submittedUrl;
  if (!schemeMatch) {
    candidate = submittedUrl.startsWith('//')
      ? `https:${submittedUrl}`
      : `https://${submittedUrl}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, code: 'INVALID', error: INVALID_URL_MESSAGE };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      ok: false,
      code: 'UNSUPPORTED_PROTOCOL',
      error: UNSUPPORTED_PROTOCOL_MESSAGE,
    };
  }

  if (!parsed.hostname || parsed.hostname === '') {
    return { ok: false, code: 'INVALID', error: INVALID_URL_MESSAGE };
  }

  const lookupUrl = new URL(parsed.toString());
  lookupUrl.username = '';
  lookupUrl.password = '';
  const safeDisplayUrl = new URL(parsed.toString());
  safeDisplayUrl.username = '';
  safeDisplayUrl.password = '';

  return {
    ok: true,
    submittedUrl: safeDisplayUrl.toString(),
    normalizedUrl: lookupUrl.toString(),
    hostname: parsed.hostname,
    protocol: parsed.protocol,
    parsed,
  };
}
