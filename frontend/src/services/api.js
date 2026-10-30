const rawBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBase
  ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`)
  : '/api/v1';

export function getToken() {
  return localStorage.getItem('eventhub_token') || sessionStorage.getItem('eventhub_token');
}

export function getUser() {
  const raw = localStorage.getItem('eventhub_user') || sessionStorage.getItem('eventhub_user');
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('eventhub_token', token);
  storage.setItem('eventhub_user', JSON.stringify(user));
  // Clear the other storage
  const other = remember ? sessionStorage : localStorage;
  other.removeItem('eventhub_token');
  other.removeItem('eventhub_user');
}

export function clearAuth() {
  localStorage.removeItem('eventhub_token');
  localStorage.removeItem('eventhub_user');
  sessionStorage.removeItem('eventhub_token');
  sessionStorage.removeItem('eventhub_user');
}

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function request(endpoint, options = {}, fallback = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...getAuthHeader(),
      ...options.headers
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      let detail = 'Request failed';
      const bodyText = await response.text().catch(() => '');
      try {
        const errBody = JSON.parse(bodyText);
        const raw = errBody.detail || errBody.message || errBody.error;
        if (Array.isArray(raw)) {
          detail = raw.map(e => e.msg || (typeof e === 'object' ? JSON.stringify(e) : String(e))).join(', ');
        } else if (raw && typeof raw === 'object') {
          detail = JSON.stringify(raw);
        } else if (raw) {
          detail = String(raw);
        } else {
          detail = `Error ${response.status}`;
        }
      } catch {
        const text = bodyText.slice(0, 300);
        if (response.status === 405) {
          detail = 'Error 405 (Method Not Allowed): The API request hit the static frontend host instead of the live backend server. Make sure VITE_API_URL is configured.';
        } else {
          detail = text || `Error ${response.status}${response.statusText ? ': ' + response.statusText : ''}`;
        }
      }
      throw new Error(detail);
    }
    return await response.json();
  } catch (err) {
    if (fallback !== null) {
      console.warn(`API endpoint ${endpoint} unreachable, serving local fallback data:`, err.message);
      return fallback;
    }
    throw err;
  }
}
