const DEFAULT_ENDPOINT = 'https://webrisk.googleapis.com/v1/uris:search';
const THREAT_TYPES = ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'];

export function createGoogleWebRiskProvider(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis);
  const timeoutMs = options.timeoutMs || 8000;
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const getApiKey = options.getApiKey || (() => process.env.GOOGLE_WEB_RISK_API_KEY);

  return {
    name: 'Google Web Risk',
    async lookup(normalizedUrl) {
      const apiKey = String(getApiKey?.() || '').trim();
      if (!apiKey) {
        return {
          ok: false,
          status: 'missing_api_key',
          matched: false,
          categories: [],
          provider: 'Google Web Risk',
        };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const params = new URLSearchParams({ uri: normalizedUrl });
        for (const type of THREAT_TYPES) params.append('threatTypes', type);

        const response = await fetchImpl(`${endpoint}?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
        });

        if (response.status === 429) {
          return {
            ok: false,
            status: 'rate_limited',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        }

        if (!response.ok) {
          return {
            ok: false,
            status: 'unavailable',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        }

        let data = {};
        try {
          data = await response.json();
        } catch {
          return {
            ok: false,
            status: 'unavailable',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          return {
            ok: false,
            status: 'unavailable',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        }

        // An empty object is Google's valid no-match response. Any non-empty
        // response must contain a correctly shaped threat object.
        if (Object.keys(data).length > 0 &&
            (!data.threat ||
              !Array.isArray(data.threat.threatTypes) ||
              data.threat.threatTypes.length === 0 ||
              !data.threat.threatTypes.every((item) => typeof item === 'string'))) {
          return {
            ok: false,
            status: 'unavailable',
            matched: false,
            categories: [],
            provider: 'Google Web Risk',
          };
        }

        const categories = data.threat?.threatTypes || [];

        return {
          ok: true,
          status: 'completed',
          matched: categories.length > 0,
          categories,
          provider: 'Google Web Risk',
        };
      } catch (error) {
        const timedOut = error?.name === 'AbortError';
        return {
          ok: false,
          status: timedOut ? 'timeout' : 'unavailable',
          matched: false,
          categories: [],
          provider: 'Google Web Risk',
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
