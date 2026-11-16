const KEY = 'nexalumi.scanHistory.v1';
export function saveScan(entry) {
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || '[]');
    const next = [{ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, ...entry, checkedAt: new Date().toISOString() }, ...current].slice(0, 100);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* Storage-disabled environments do not block a scan. */ }
}
export function getScans() {
  try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
export function clearScans() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
