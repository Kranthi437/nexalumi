const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function requestLinkCheck(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response;
  try {
    response = await fetch(`${API_BASE}/api/link-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('The request took too long. Please try again.');
      timeoutError.retryable = true;
      throw timeoutError;
    }
    const networkError = new Error('NEXALUMI could not reach the checking service. Please try again.');
    networkError.retryable = true;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.error || 'The check could not be completed.');
    error.status = response.status;
    error.retryable = Boolean(data.retryable) || response.status >= 500 || response.status === 429;
    error.result = data.classification ? data : null;
    throw error;
  }

  return data;
}
