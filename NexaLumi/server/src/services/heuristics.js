const DEFAULT_HEURISTICS = {
  ipHostname: true,
  userinfo: true,
  atInUrl: true,
  punycode: true,
  manySubdomains: { enabled: true, maxLabels: 5 },
  suspiciousTlds: [
    '.xyz',
    '.top',
    '.tk',
    '.ml',
    '.ga',
    '.cf',
    '.gq',
    '.click',
    '.zip',
    '.mov',
    '.country',
  ],
  brandKeywordsInHostname: [
    'login',
    'signin',
    'verify',
    'secure',
    'account',
    'update',
    'paypal',
    'appleid',
    'banking',
    'unlock',
    'password',
  ],
  nonStandardPort: true,
  veryLongUrl: 180,
};

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^\[?[0-9a-fA-F:]+\]?$/;

export function evaluateHeuristics(parsedUrl, options = {}) {
  const rules = { ...DEFAULT_HEURISTICS, ...options.rules };
  const warnings = [];
  const href = parsedUrl.toString();
  const hostname = parsedUrl.hostname || '';
  const hostForTld = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (rules.userinfo && (parsedUrl.username || parsedUrl.password)) {
    warnings.push({
      code: 'USERINFO',
      source: 'NEXALUMI heuristics',
      message: 'The address includes a username or password, which is unusual for a normal website link.',
    });
  }

  if (rules.atInUrl && href.includes('@')) {
    warnings.push({
      code: 'AT_SYMBOL',
      source: 'NEXALUMI heuristics',
      message: 'The address contains an @ symbol, which can hide the real destination.',
    });
  }

  if (rules.ipHostname && (IPV4.test(hostname) || (hostname.includes(':') && IPV6.test(hostname)))) {
    warnings.push({
      code: 'IP_HOSTNAME',
      source: 'NEXALUMI heuristics',
      message: 'The address uses an IP address instead of a website name.',
    });
  }

  if (rules.punycode && hostname.toLowerCase().includes('xn--')) {
    warnings.push({
      code: 'PUNYCODE',
      source: 'NEXALUMI heuristics',
      message: 'The domain uses encoded international characters, which can imitate a familiar brand.',
    });
  }

  const labels = hostForTld.split('.').filter(Boolean);
  if (rules.manySubdomains?.enabled && labels.length > rules.manySubdomains.maxLabels) {
    warnings.push({
      code: 'MANY_SUBDOMAINS',
      source: 'NEXALUMI heuristics',
      message: 'The website name has an unusually long chain of subdomains.',
    });
  }

  const tld = labels.length ? `.${labels[labels.length - 1]}` : '';
  if (Array.isArray(rules.suspiciousTlds) && tld && rules.suspiciousTlds.includes(tld)) {
    warnings.push({
      code: 'SUSPICIOUS_TLD',
      source: 'NEXALUMI heuristics',
      message: `The domain uses a top-level suffix (${tld}) that often appears in unsolicited or low-trust links.`,
    });
  }

  const keywordHost = hostForTld.replace(/[^a-z0-9.-]/g, '');
  if (Array.isArray(rules.brandKeywordsInHostname)) {
    const matched = rules.brandKeywordsInHostname.find((word) => keywordHost.includes(word));
    if (matched) {
      warnings.push({
        code: 'BRAND_KEYWORD',
        source: 'NEXALUMI heuristics',
        message: 'The website name includes words often used to impersonate a login or account page.',
      });
    }
  }

  const port = parsedUrl.port;
  if (rules.nonStandardPort && port && port !== '80' && port !== '443') {
    warnings.push({
      code: 'NONSTANDARD_PORT',
      source: 'NEXALUMI heuristics',
      message: `The address uses an uncommon port (${port}).`,
    });
  }

  if (typeof rules.veryLongUrl === 'number' && href.length >= rules.veryLongUrl) {
    warnings.push({
      code: 'VERY_LONG_URL',
      source: 'NEXALUMI heuristics',
      message: 'The address is unusually long, which can hide the real destination.',
    });
  }

  return warnings;
}

export { DEFAULT_HEURISTICS };
