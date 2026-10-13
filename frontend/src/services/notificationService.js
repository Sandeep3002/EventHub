import { request } from './api';

export const notificationService = {
  async getNotifications() {
    return await request('/notifications', {}, []);
  },

  async markRead(id) {
    return await request(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllRead() {
    return await request('/notifications/read-all', { method: 'PUT' });
  },
};
