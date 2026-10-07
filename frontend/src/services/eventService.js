import { request } from './api';

export const eventService = {
  async getEvents(params = {}) {
    let query = [];
    if (params.category_id) query.push(`category_id=${params.category_id}`);
    if (params.venue_id) query.push(`venue_id=${params.venue_id}`);
    if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
    const qStr = query.length > 0 ? `?${query.join('&')}` : '';
    return await request(`/events${qStr}`);
  },

  async getEventById(id) {
    return await request(`/events/${id}`);
  },

  async getCategories() {
    return await request('/categories');
  },

  async getVenues() {
    return await request('/venues');
  },

  async createEvent(eventData) {
    return await request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async deleteEvent(id) {
    return await request(`/events/${id}`, { method: 'DELETE' });
  },

  async createCategory(catData) {
    return await request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData)
    });
  },

  async createVenue(venueData) {
    return await request('/venues', {
      method: 'POST',
      body: JSON.stringify(venueData)
    });
  }
};
