import { request } from './api';

export const authService = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('eventhub_token', data.access_token);
    localStorage.setItem('eventhub_user', JSON.stringify(data.user));
    return data;
  },

  async register(fullName, email, password, role = 'attendee') {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
    localStorage.setItem('eventhub_token', data.access_token);
    localStorage.setItem('eventhub_user', JSON.stringify(data.user));
    return data;
  },

  async getMe() {
    const token = localStorage.getItem('eventhub_token');
    if (!token) return null;
    try {
      const user = await request('/auth/me');
      localStorage.setItem('eventhub_user', JSON.stringify(user));
      return user;
    } catch {
      localStorage.removeItem('eventhub_token');
      localStorage.removeItem('eventhub_user');
      return null;
    }
  },

  logout() {
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_user');
  },

  async forgotPassword(email) {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token, newPassword) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    });
  }
};
