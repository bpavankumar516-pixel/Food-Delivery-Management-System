import api from './api';

export const dashboardService = {
  // GET dashboard metrics (Network tab: GET /api/dashboard/stats)
  async getStats() {
    return await api.get('/dashboard/stats');
  },

  // GET recent audit activities (Network tab: GET /api/dashboard/activities)
  async getActivities() {
    return await api.get('/dashboard/activities');
  },

  // GET recent customer orders (Network tab: GET /api/dashboard/orders)
  async getOrders() {
    return await api.get('/dashboard/orders');
  },
};

export default dashboardService;
