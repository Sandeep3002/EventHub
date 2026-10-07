const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const getAuthHeader = () => {
  const token = localStorage.getItem('eventhub_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function request(endpoint, options = {}, fallback = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
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
