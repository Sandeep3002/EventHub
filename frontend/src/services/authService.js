import { request, setAuth, clearAuth, getToken } from './api';

export const authService = {
  async login(email, password, remember = true) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuth(data.access_token, data.user, remember);
    return data;
  },

  async register(fullName, email, password, role = 'attendee') {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
    // Don't call setAuth() — user must login explicitly after registration
    return data;
  },

  async getMe() {
    const token = getToken();
    if (!token) return null;
    try {
      const user = await request('/auth/me');
      // Preserve in whichever storage has the token
      if (localStorage.getItem('eventhub_token')) {
        localStorage.setItem('eventhub_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('eventhub_user', JSON.stringify(user));
      }
      return user;
    } catch {
      clearAuth();
      return null;
    }
  },

  async updateProfile(updateData) {
    const data = await request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    if (localStorage.getItem('eventhub_token')) {
      localStorage.setItem('eventhub_user', JSON.stringify(data));
    } else {
      sessionStorage.setItem('eventhub_user', JSON.stringify(data));
    }
    return data;
  },

  logout() {
    clearAuth();
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
