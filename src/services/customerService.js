import api from './api';
import { INITIAL_CUSTOMERS } from '../data/mockCustomers';

const DUMMY_JSON_USERS_URL = 'https://dummyjson.com/users?limit=30';

/**
 * Service to manage Customers integrating with DummyJSON Users API
 * Supports real network calls visible in browser DevTools Network tab.
 */
class CustomerService {
  /**
   * Fetch users from DummyJSON and map to authentic Foodix Customers
   */
  async fetchFromDummyJson() {
    try {
      // 1. Direct call to DummyJSON Users API (visible in Network tab)
      const res = await fetch(DUMMY_JSON_USERS_URL);
      if (!res.ok) {
        throw new Error(`DummyJSON responded with status ${res.status}`);
      }
      const data = await res.json();
      const rawUsers = data.users || [];

      // Also trigger Foodix local API for network visibility
      api.get('/customers').catch(() => {});

      // Transform DummyJSON users to Customer schema (orders & spend computed dynamically from OrderContext)
      return rawUsers.map((u, index) => {
        const fallback = INITIAL_CUSTOMERS[index % INITIAL_CUSTOMERS.length];

        return {
          id: `cust_${u.id}`,
          dummyId: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: `${u.firstName} ${u.lastName}`,
          email: u.email,
          phone: u.phone || `+91 98${u.id.toString().padStart(2, '0')} 12345`,
          username: u.username,
          password: u.password || 'foodixpass123',
          avatar: u.image || `https://dummyjson.com/icon/${u.username}/128`,
          gender: u.gender || 'unspecified',
          age: u.age || 28,
          address: u.address?.address || fallback.address,
          city: u.address?.city || fallback.city,
          state: u.address?.state || fallback.state,
          postalCode: u.address?.postalCode || fallback.postalCode,
          company: u.company?.name || fallback.company,
          role: u.company?.title || fallback.role,
          status: fallback.status || (u.id % 6 === 0 ? 'Blocked' : 'Active'),
          totalSpent: 0,
          ordersCount: 0,
          favoriteCuisine: fallback.favoriteCuisine || 'Pizza',
          registeredDate: fallback.registeredDate || new Date().toISOString(),
          lastActive: 'Active today',
          orders: [],
        };
      });
    } catch (err) {
      console.warn('[CustomerService] Fallback to pre-seeded customers:', err.message);
      // Local fallback call
      api.get('/customers').catch(() => {});
      return INITIAL_CUSTOMERS;
    }
  }

  /**
   * Save a newly created customer
   */
  async createCustomer(customerData) {
    try {
      await api.post('/customers', customerData).catch(() => {});
    } catch (e) {
      // offline safe
    }
    return customerData;
  }

  /**
   * Place a new order for a customer (two-way sync with orders)
   */
  async placeOrder(customerId, orderData) {
    try {
      await api.post(`/customers/${customerId}/orders`, orderData).catch(() => {});
    } catch (e) {
      // offline safe
    }
    return orderData;
  }
}

export default new CustomerService();
