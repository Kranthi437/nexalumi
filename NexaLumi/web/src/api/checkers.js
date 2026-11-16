const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function post(path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The check could not be completed.');
    return data;
  } finally { clearTimeout(timeout); }
}
export const requestMessageCheck = (text) => post('/api/message-check', { text });
export const requestEmailCheck = (text) => post('/api/email-check', { text });
