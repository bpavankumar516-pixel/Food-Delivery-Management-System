import api from './api';

export const menuService = {
  // --- Central Menu Management API (Network Tab visible) ---
  // GET all menu items
  async getAllMenuItems() {
    return await api.get('/menu');
  },

  // POST create a new menu item
  async addMasterMenuItem(dishData) {
    return await api.post('/menu', dishData);
  },

  // PUT update a master menu item
  async updateMasterMenuItem(dishId, updatedFields) {
    return await api.put(`/menu/${dishId}`, updatedFields);
  },

  // PATCH toggle stock status
  async toggleMasterItemStock(dishId, inStock) {
    return await api.patch(`/menu/${dishId}/stock`, { inStock });
  },

  // PATCH toggle favorite
  async toggleMasterItemFavorite(dishId, isFavorite) {
    return await api.patch(`/menu/${dishId}/favorite`, { isFavorite });
  },

  // DELETE remove master menu item
  async deleteMasterMenuItem(dishId) {
    return await api.delete(`/menu/${dishId}`);
  },

  // --- Restaurant-Specific Menu API ---
  // GET dishes for a specific restaurant (Network tab: GET /api/restaurants/:id/menu)
  async getMenu(restaurantId) {
    return await api.get(`/restaurants/${restaurantId}/menu`);
  },

  // POST add new food item to restaurant (Network tab: POST /api/restaurants/:id/menu)
  async addDish(restaurantId, dishData) {
    return await api.post(`/restaurants/${restaurantId}/menu`, dishData);
  },

  // PUT update existing food item (Network tab: PUT /api/restaurants/:id/menu/:dishId)
  async updateDish(restaurantId, dishId, updatedFields) {
    return await api.put(`/restaurants/${restaurantId}/menu/${dishId}`, updatedFields);
  },

  // PATCH toggle in-stock / sold-out status (Network tab: PATCH /api/restaurants/:id/menu/:dishId/stock)
  async toggleStock(restaurantId, dishId, inStock) {
    return await api.patch(`/restaurants/${restaurantId}/menu/${dishId}/stock`, { inStock });
  },

  // DELETE remove food item from menu (Network tab: DELETE /api/restaurants/:id/menu/:dishId)
  async deleteDish(restaurantId, dishId) {
    return await api.delete(`/restaurants/${restaurantId}/menu/${dishId}`);
  },
};

export default menuService;
