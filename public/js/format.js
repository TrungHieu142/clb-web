export function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function seatsLeft(capacity, registered) {
  const cap = Number(capacity) || 0;
  const reg = Number(registered) || 0;
  return Math.max(0, cap - reg);
}

export function formatDateTime(s) {
  if (!s) return '';
  const d = new Date(String(s).replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

