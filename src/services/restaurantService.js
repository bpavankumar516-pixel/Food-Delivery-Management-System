import api from './api';

export const restaurantService = {
  // GET all restaurants (Network tab: GET /api/restaurants)
  async getRestaurants(params = {}) {
    return await api.get('/restaurants', { params });
  },

  // GET restaurant by ID (Network tab: GET /api/restaurants/:id)
  async getRestaurantById(id) {
    return await api.get(`/restaurants/${id}`);
  },

  // POST create new restaurant (Network tab: POST /api/restaurants)
  async createRestaurant(restaurantData) {
    return await api.post('/restaurants', restaurantData);
  },

  // PUT update restaurant details (Network tab: PUT /api/restaurants/:id)
  async updateRestaurant(id, updatedFields) {
    return await api.put(`/restaurants/${id}`, updatedFields);
  },

  // DELETE remove restaurant (Network tab: DELETE /api/restaurants/:id)
  async deleteRestaurant(id) {
    return await api.delete(`/restaurants/${id}`);
  },

  // PATCH toggle operational status (Network tab: PATCH /api/restaurants/:id/status)
  async toggleStatus(id, status) {
    return await api.patch(`/restaurants/${id}/status`, { status });
  },

  // PATCH toggle favorite heart (Network tab: PATCH /api/restaurants/:id/favorite)
  async toggleFavorite(id, isFavorite) {
    return await api.patch(`/restaurants/${id}/favorite`, { isFavorite });
  },
};

export default restaurantService;
