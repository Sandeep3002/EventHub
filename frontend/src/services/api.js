const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
      const errBody = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(errBody.detail || `Error ${response.status}`);
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
