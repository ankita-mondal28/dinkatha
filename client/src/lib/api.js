import { t } from '../i18n';

const TIMEOUT = 25000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export async function translate(texts) {
  try {
    const res = await fetchWithTimeout('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) return { error: 'key_not_set' };
      if (res.status === 502) return { error: 'rejected' };
      return { error: data.error || 'network' };
    }
    return await res.json();
  } catch (e) {
    return { error: 'timeout' };
  }
}

export async function structure(text) {
  try {
    const res = await fetchWithTimeout('/api/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) return { error: 'key_not_set' };
      if (res.status === 502) return { error: 'rejected' };
      return { error: data.error || 'network' };
    }
    return await res.json();
  } catch (e) {
    return { error: 'timeout' };
  }
}

export async function classify(text) {
  try {
    const res = await fetchWithTimeout('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) return { error: 'key_not_set' };
      if (res.status === 502) return { error: 'rejected' };
      return { error: data.error || 'network' };
    }
    return await res.json();
  } catch (e) {
    return { error: 'timeout' };
  }
}
