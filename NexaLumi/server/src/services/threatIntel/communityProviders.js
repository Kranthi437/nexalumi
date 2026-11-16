const DEFAULT_TIMEOUT_MS = 7000;

function result(provider, status, matched = false, categories = []) {
  return { provider, ok: status === 'completed', status, matched, categories };
}

async function requestJson(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    let body = {};
    try { body = await response.json(); } catch { /* invalid provider payload */ }
    if (response.status === 429 || response.status === 509) return { status: 'rate_limited', body };
    if (!response.ok) return { status: 'unavailable', body };
    return { status: 'completed', body };
  } catch (error) {
    return { status: error?.name === 'AbortError' ? 'timeout' : 'unavailable', body: {} };
  } finally {
    clearTimeout(timer);
  }
}

export function createPhishTankProvider({ fetchImpl = fetch, appKey = '', timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return {
    name: 'PhishTank',
    async lookup(url) {
      const form = new URLSearchParams({ url, format: 'json' });
      if (appKey) form.set('app_key', appKey);
      const response = await requestJson(fetchImpl, 'https://checkurl.phishtank.com/checkurl/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'User-Agent': 'NexaLumi-LinkChecker/1.0 (security reputation lookup)' },
        body: form.toString(),
      }, timeoutMs);
      if (response.status !== 'completed') return result('PhishTank', response.status);
      const data = response.body?.results;
      if (!data || typeof data.in_database !== 'boolean') return result('PhishTank', 'unavailable');
      const matched = data.in_database === true && data.verified === true && data.valid === true;
      return result('PhishTank', 'completed', matched, matched ? ['PHISHING'] : []);
    },
  };
}

export function createUrlhausProvider({ fetchImpl = fetch, authKey = '', timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return {
    name: 'URLhaus',
    async lookup(url) {
      if (!authKey) return result('URLhaus', 'not_configured');
      const response = await requestJson(fetchImpl, 'https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Auth-Key': authKey, Accept: 'application/json' },
        body: new URLSearchParams({ url }).toString(),
      }, timeoutMs);
      if (response.status !== 'completed') return result('URLhaus', response.status);
      const queryStatus = response.body?.query_status;
      if (queryStatus === 'no_results') return result('URLhaus', 'completed');
      if (queryStatus === 'ok') return result('URLhaus', 'completed', true, ['MALWARE']);
      return result('URLhaus', 'unavailable');
    },
  };
}

export function createOtxProvider({ fetchImpl = fetch, apiKey = '', timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return {
    name: 'AlienVault OTX',
    async lookup(url) {
      if (!apiKey) return result('AlienVault OTX', 'not_configured');
      const encoded = encodeURIComponent(url);
      const response = await requestJson(fetchImpl, `https://otx.alienvault.com/api/v1/indicators/url/${encoded}/general`, {
        method: 'GET', headers: { 'X-OTX-API-KEY': apiKey, Accept: 'application/json' },
      }, timeoutMs);
      if (response.status !== 'completed') return result('AlienVault OTX', response.status);
      const pulses = response.body?.pulse_info?.count;
      if (typeof pulses !== 'number') return result('AlienVault OTX', 'unavailable');
      return result('AlienVault OTX', 'completed', pulses > 0, pulses > 0 ? ['THREAT_INTELLIGENCE'] : []);
    },
  };
}

export function createCommunityProviders(config = {}, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  return [
    createPhishTankProvider({ fetchImpl, appKey: config.phishTankAppKey, timeoutMs }),
    createUrlhausProvider({ fetchImpl, authKey: config.urlhausAuthKey, timeoutMs }),
    createOtxProvider({ fetchImpl, apiKey: config.otxApiKey, timeoutMs }),
  ];
}
