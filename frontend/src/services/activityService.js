import { request } from './api';

export const activityService = {
  async getActivities(limit = 50, skip = 0, actorId = null) {
    let url = `/activities?limit=${limit}&skip=${skip}`;
    if (actorId) url += `&actor_id=${actorId}`;
    return await request(url, {}, { activities: [], total: 0 });
  },

  async getRecentActivities(limit = 20) {
    return await request(`/activities/recent?limit=${limit}`, {}, []);
  },
};
