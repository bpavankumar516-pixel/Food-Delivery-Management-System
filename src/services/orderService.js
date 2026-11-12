import api from './api';
import { INITIAL_RESTAURANTS } from '../data/mockRestaurants';
import { INITIAL_MENU_MANAGEMENT_ITEMS } from '../data/mockMenuManagementItems';

const DUMMY_JSON_CARTS_URL = 'https://dummyjson.com/carts?limit=15';

const PIPELINE_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const PAYMENT_METHODS = [
  'UPI (PhonePe)',
  'UPI (Google Pay)',
  'Credit Card (HDFC)',
  'UPI (Paytm)',
  'Cash on Delivery',
];

const DELIVERY_PARTNERS = [
  'Arun Kumar (Bike #KA-03-HF-9821)',
  'Mohammed Rizwan (Bike #KA-04-ED-4412)',
  'Venkatesh S (Bike #KA-01-XY-7710)',
  'Sunil Kumar (Live GPS: 1.2 km away)',
  'Ramesh V (Verified Partner)',
];

const COUPON_CODES = ['WELCOME50', 'FOOD100', 'SUMMER20', 'FESTIVE15', null];

/**
 * Helper to build timestamped operational history matching an order's current status.
 */
function buildStatusHistory(status, baseTimestamp) {
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const stages = [
    { status: 'Pending', note: 'Order placed by customer via Foodix API', offsetMin: 0 },
    { status: 'Confirmed', note: 'Merchant accepted order for preparation', offsetMin: 2 },
    { status: 'Preparing', note: 'Kitchen began cooking and assembling dishes', offsetMin: 6 },
    { status: 'Ready for Pickup', note: 'Order bagged and sealed at dispatch counter', offsetMin: 14 },
    { status: 'Out for Delivery', note: 'Delivery rider assigned and departed', offsetMin: 18 },
    { status: 'Delivered', note: 'Order delivered safely to customer', offsetMin: 28 },
  ];

  if (status === 'Cancelled') {
    return [
      {
        status: 'Pending',
        timestamp: formatTime(baseTimestamp),
        note: 'Order placed by customer via Foodix API',
      },
      {
        status: 'Cancelled',
        timestamp: formatTime(baseTimestamp + 4 * 60 * 1000),
        note: 'Order cancelled — refund initiated to original payment source',
      },
    ];
  }

  if (status === 'Rejected') {
    return [
      {
        status: 'Pending',
        timestamp: formatTime(baseTimestamp),
        note: 'Order placed by customer via Foodix API',
      },
      {
        status: 'Rejected',
        timestamp: formatTime(baseTimestamp + 2 * 60 * 1000),
        note: 'Rejected by merchant due to kitchen backlog',
      },
    ];
  }

  const targetIdx = Math.max(
    0,
    stages.findIndex((s) => s.status === status)
  );
  return stages.slice(0, targetIdx + 1).map((stage) => ({
    status: stage.status,
    timestamp: formatTime(baseTimestamp + stage.offsetMin * 60 * 1000),
    note: stage.note,
  }));
}

/**
 * Helper to resolve a customer object into the standardized Order customer snapshot.
 */
export function buildCustomerSnapshot(customer, fallback = {}) {
  if (!customer) {
    return {
      id: fallback.id || 'cust_guest',
      name: fallback.name || 'Guest Customer',
      email: fallback.email || 'guest@foodix.com',
      phone: fallback.phone || '+91 98765 00000',
      avatar:
        fallback.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fallback.name || 'Guest'
        )}&background=064e3b&color=fff&bold=true`,
      address: fallback.address || 'MG Road, Bengaluru',
      city: fallback.city || 'Bengaluru',
      state: fallback.state || 'Karnataka',
      tier: fallback.tier || 'Regular',
      status: fallback.status || 'Active',
      ordersCount: fallback.ordersCount || 1,
      totalSpent: fallback.totalSpent || 0,
    };
  }

  const fullAddress = [customer.address, customer.city, customer.state]
    .filter(Boolean)
    .join(', ');

  return {
    id: customer.id,
    dummyId: customer.dummyId,
    name: customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar,
    address: fullAddress || customer.address || 'Bengaluru, Karnataka',
    city: customer.city || 'Bengaluru',
    state: customer.state || 'Karnataka',
    tier: customer.tier || (customer.ordersCount >= 12 ? 'VIP' : customer.ordersCount >= 7 ? 'Gold' : 'Regular'),
    status: customer.status || 'Active',
    ordersCount: customer.ordersCount || 0,
    totalSpent: customer.totalSpent || 0,
  };
}

class OrderService {
  /**
   * Fetch live orders from DummyJSON Carts API + local Foodix /api/orders,
   * and combine with orders already placed by Customers in CustomerContext.
   */
  async fetchLiveOrders({
    customers = [],
    restaurants = INITIAL_RESTAURANTS,
    menuItems = INITIAL_MENU_MANAGEMENT_ITEMS,
  } = {}) {
    const activeRestaurants = restaurants.length > 0 ? restaurants : INITIAL_RESTAURANTS;
    const activeMenu = menuItems.length > 0 ? menuItems : INITIAL_MENU_MANAGEMENT_ITEMS;

    // 1. Trigger local Foodix /api/orders call (visible in DevTools Network tab)
    let localApiOrders = [];
    try {
      const apiRes = await api.get('/orders');
      if (Array.isArray(apiRes?.data)) {
        localApiOrders = apiRes.data;
      }
    } catch {
      // Safe fallback
    }

    // 2. Fetch live carts from DummyJSON Carts API (visible in DevTools Network tab)
    let apiOrders = [];
    try {
      const res = await fetch(DUMMY_JSON_CARTS_URL);
      if (res.ok) {
        const json = await res.json();
        const carts = Array.isArray(json?.carts) ? json.carts : [];

        apiOrders = carts.map((cart, idx) => {
          const matchedCustomer =
            customers.find((c) => c.dummyId === cart.userId || c.id === `cust_${cart.userId}`) ||
            customers[idx % Math.max(customers.length, 1)];

          const restaurant = activeRestaurants[idx % activeRestaurants.length];
          const restaurantDishes = activeMenu.filter(
            (d) => d.restaurantId === restaurant.id || d.restaurantName === restaurant.name
          );
          const dishPool = restaurantDishes.length > 0 ? restaurantDishes : activeMenu;

          // Map DummyJSON cart product slots onto Foodix dishes while preserving live API quantities
          const items = (cart.products || []).slice(0, 3).map((prod, pIdx) => {
            const dish = dishPool[(idx + pIdx) % dishPool.length];
            return {
              id: dish.id,
              name: dish.name,
              qty: Math.min(Math.max(prod.quantity || 1, 1), 4),
              price: dish.price,
              instructions: pIdx === 0 && idx % 3 === 0 ? 'Extra spicy, pack cutlery' : '',
            };
          });

          const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
          const couponCode = COUPON_CODES[idx % COUPON_CODES.length];
          const discount = couponCode ? Math.min(Math.round(subtotal * 0.1), 100) : 0;
          const deliveryFee = restaurant.deliveryFee || 35;
          const tax = Math.round((subtotal - discount) * 0.05);
          const grandTotal = Math.max(subtotal - discount + deliveryFee + tax, 0);

          const status = PIPELINE_STATUSES[idx % PIPELINE_STATUSES.length];
          const ageMinutes = (idx + 1) * 7;
          const timestamp = Date.now() - ageMinutes * 60 * 1000;
          const placedAt = new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const orderNum = 3000 + cart.id;
          const paymentMethod = PAYMENT_METHODS[idx % PAYMENT_METHODS.length];
          const paymentStatus =
            status === 'Cancelled'
              ? 'Refunded'
              : status === 'Rejected'
              ? 'Voided'
              : paymentMethod === 'Cash on Delivery' && status !== 'Delivered'
              ? 'Pending COD'
              : 'Paid';

          return {
            id: `#FDX-${orderNum}`,
            rawId: `FDX-${orderNum}`,
            apiCartId: cart.id,
            source: 'DummyJSON API',
            customerId: matchedCustomer?.id || `cust_${cart.userId}`,
            customer: buildCustomerSnapshot(matchedCustomer),
            restaurant: restaurant.name,
            restaurantId: restaurant.id,
            status,
            items,
            subtotal,
            discount,
            couponCode,
            deliveryFee,
            tax,
            grandTotal,
            amount: grandTotal,
            paymentMethod,
            paymentStatus,
            deliveryPartner:
              status === 'Pending'
                ? 'Pending assignment'
                : status === 'Cancelled'
                ? 'Cancelled'
                : DELIVERY_PARTNERS[idx % DELIVERY_PARTNERS.length],
            specialInstructions:
              idx % 2 === 0
                ? 'Ring bell once and leave at door if contactless.'
                : 'Please verify hot sealing sticker before dispatch.',
            estimatedDeliveryTime:
              status === 'Delivered'
                ? 'Delivered'
                : status === 'Cancelled'
                ? 'Cancelled'
                : `${15 + (idx % 4) * 5}-${25 + (idx % 4) * 5} mins`,
            timestamp,
            placedAt,
            history: buildStatusHistory(status, timestamp),
          };
        });
      }
    } catch (err) {
      console.warn('[OrderService] DummyJSON carts fetch skipped:', err.message);
    }

    // 3. Extract existing orders placed by customers from CustomerContext (real customer-placed history!)
    const customerPlacedOrders = [];
    customers.forEach((cust) => {
      if (!Array.isArray(cust.orders)) return;
      cust.orders.forEach((ord, ordIdx) => {
        const ordItems = (ord.items || []).map((it) => ({
          name: it.name,
          qty: it.qty || 1,
          price: it.price || 150,
          instructions: it.instructions || '',
        }));
        const subtotal =
          ord.subtotal ||
          ordItems.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0) ||
          ord.amount ||
          0;
        const discount = ord.discount || 0;
        const deliveryFee = ord.deliveryFee ?? 35;
        const tax = ord.tax ?? Math.round(subtotal * 0.05);
        const grandTotal = ord.grandTotal || ord.amount || subtotal - discount + deliveryFee + tax;
        const ts = ord.timestamp || Date.now() - (ordIdx + 1) * 3600 * 1000;

        customerPlacedOrders.push({
          id: ord.id,
          rawId: String(ord.id).replace('#', ''),
          source: 'Customer Record',
          customerId: cust.id,
          customer: buildCustomerSnapshot(cust),
          restaurant: ord.restaurant || 'Foodix Kitchen',
          restaurantId: ord.restaurantId || 'rest_001',
          status: ord.status || 'Delivered',
          items: ordItems,
          subtotal,
          discount,
          couponCode: ord.couponCode || null,
          deliveryFee,
          tax,
          grandTotal,
          amount: grandTotal,
          paymentMethod: ord.paymentMethod || 'UPI (PhonePe)',
          paymentStatus: ord.status === 'Cancelled' ? 'Refunded' : 'Paid',
          deliveryPartner:
            ord.deliveryPartner ||
            (ord.status === 'Delivered'
              ? 'Delivered safely'
              : DELIVERY_PARTNERS[ordIdx % DELIVERY_PARTNERS.length]),
          specialInstructions: ord.specialInstructions || '',
          estimatedDeliveryTime:
            ord.status === 'Delivered' ? 'Delivered' : ord.date || '20-25 mins',
          timestamp: ts,
          placedAt:
            ord.date ||
            new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          history: ord.history || buildStatusHistory(ord.status || 'Delivered', ts),
        });
      });
    });

    // 4. Combine Customer-placed orders + DummyJSON API orders + fallback local API orders (deduped by id)
    const mergedMap = new Map();

    // Prioritize customer-placed orders & DummyJSON API orders first
    [...customerPlacedOrders, ...apiOrders].forEach((ord) => {
      if (ord?.id && !mergedMap.has(ord.id)) {
        mergedMap.set(ord.id, ord);
      }
    });

    // Include any custom orders created in Vite /api/orders store (re-linked to real customers)
    localApiOrders.forEach((ord, idx) => {
      if (!ord?.id || mergedMap.has(ord.id)) return;
      const linkedCustomer =
        customers.find(
          (c) =>
            c.id === ord.customerId ||
            c.id === ord.customer?.id ||
            (ord.customer?.email && c.email?.toLowerCase() === ord.customer.email.toLowerCase())
        ) || customers[idx % Math.max(customers.length, 1)];

      mergedMap.set(ord.id, {
        ...ord,
        source: ord.source || 'Foodix API',
        customerId: linkedCustomer?.id || ord.customer?.id,
        customer: buildCustomerSnapshot(linkedCustomer, ord.customer),
      });
    });

    return Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  /**
   * Create a new order via Foodix API
   */
  async createOrder(orderData) {
    try {
      const res = await api.post('/orders', orderData);
      if (orderData.customerId) {
        api.post(`/customers/${orderData.customerId}/orders`, orderData).catch(() => {});
      }
      return res?.data || orderData;
    } catch {
      return orderData;
    }
  }

  /**
   * Update order status via Foodix API
   */
  async updateOrderStatus(orderId, payload) {
    try {
      const encodedId = encodeURIComponent(orderId);
      const res = await api.patch(`/orders/${encodedId}/status`, payload);
      return res?.data || { id: orderId, ...payload };
    } catch {
      return { id: orderId, ...payload };
    }
  }

  /**
   * Delete order via Foodix API
   */
  async deleteOrder(orderId) {
    try {
      const encodedId = encodeURIComponent(orderId);
      await api.delete(`/orders/${encodedId}`);
    } catch {
      // safe fallback
    }
    return true;
  }
}

export default new OrderService();
