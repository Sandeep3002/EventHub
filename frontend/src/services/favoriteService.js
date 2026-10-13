import { request } from './api';

export const favoriteService = {
  async getFavorites() {
    return await request('/favorites', {}, []);
  },

  async addFavorite(eventId) {
    return await request(`/favorites/${eventId}`, { method: 'POST' });
  },

  async removeFavorite(eventId) {
    return await request(`/favorites/${eventId}`, { method: 'DELETE' });
  },
};
