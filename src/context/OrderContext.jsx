import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import orderService, { buildCustomerSnapshot } from '../services/orderService';
import { CustomerContext } from './CustomerContext';
import { RestaurantContext } from './RestaurantContext';

export const OrderContext = createContext(null);
const STORAGE_KEY = 'foodix_orders_live_v3';

export const ORDER_STATUSES = [
  'All',
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Rejected',
];

export function OrderProvider({ children }) {
  const customerCtx = useContext(CustomerContext) || {};
  const restaurantCtx = useContext(RestaurantContext) || {};

  const {
    customers = [],
    isLoading: customersLoading = false,
    recordCustomerOrder,
    syncCustomerOrderStatus,
  } = customerCtx;

  const { restaurants = [], allMenuItems = [], addActivity } = restaurantCtx;

  const [rawOrders, setRawOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore malformed storage
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(rawOrders.length === 0);
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasFetchedInitialRef = useRef(false);

  // Sync rawOrders to localStorage
  useEffect(() => {
    if (rawOrders.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawOrders));
    } catch {
      // ignore storage quota errors
    }
  }, [rawOrders]);

  // Merge API orders with any locally modified or user-created orders
  const mergeOrdersWithLocal = (prevOrders, apiOrders) => {
    const prevMap = new Map(prevOrders.map((o) => [o.id, o]));
    const customLocal = prevOrders.filter((o) => o.isCustomOrder);

    const mergedApi = apiOrders.map((apiOrd) => {
      const existing = prevMap.get(apiOrd.id);
      if (!existing) return apiOrd;
      // Preserve local operational status updates & history if modified
      return {
        ...apiOrd,
        status: existing.status || apiOrd.status,
        paymentStatus: existing.paymentStatus || apiOrd.paymentStatus,
        cancelReason: existing.cancelReason || apiOrd.cancelReason,
        rejectReason: existing.rejectReason || apiOrd.rejectReason,
        history: existing.history?.length >= (apiOrd.history?.length || 0) ? existing.history : apiOrd.history,
      };
    });

    const apiIds = new Set(mergedApi.map((o) => o.id));
    const uniqueCustom = customLocal.filter((o) => !apiIds.has(o.id));
    return [...uniqueCustom, ...mergedApi].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  };

  // Initial fetch once Customers API data finishes (or immediately if customers already present)
  useEffect(() => {
    if (customersLoading || customers.length === 0) return;
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;

    let isMounted = true;
    const loadOrders = async () => {
      if (rawOrders.length === 0) setIsLoading(true);
      try {
        const fetched = await orderService.fetchLiveOrders({
          customers,
          restaurants,
          menuItems: allMenuItems,
        });
        if (isMounted && fetched.length > 0) {
          setRawOrders((prev) => mergeOrdersWithLocal(prev, fetched));
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.warn('[OrderContext] Failed to load API orders:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [customersLoading, customers.length]);

  // Manual API Refresh (DummyJSON Carts + Foodix API + Customer Placed Orders)
  const refreshOrdersFromApi = async () => {
    setIsSyncingApi(true);
    toast.info('Syncing live orders from DummyJSON & Customer API...');
    try {
      const fetched = await orderService.fetchLiveOrders({
        customers,
        restaurants,
        menuItems: allMenuItems,
      });
      if (fetched.length > 0) {
        setRawOrders((prev) => mergeOrdersWithLocal(prev, fetched));
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        toast.success(`Synchronized ${fetched.length} live orders with linked customer profiles!`);
      }
    } catch {
      toast.error('Failed to sync live orders from API');
    } finally {
      setIsSyncingApi(false);
    }
  };

  // Dynamically join every order with the latest live Customer object from CustomerContext
  const orders = useMemo(() => {
    return rawOrders.map((ord) => {
      const matchedCustomer = customers.find(
        (c) =>
          (ord.customerId && c.id === ord.customerId) ||
          (ord.customer?.id && c.id === ord.customer.id) ||
          (ord.customer?.email && c.email?.toLowerCase() === ord.customer.email.toLowerCase())
      );

      if (!matchedCustomer) {
        return {
          ...ord,
          customer: buildCustomerSnapshot(null, ord.customer),
        };
      }

      return {
        ...ord,
        customerId: matchedCustomer.id,
        customer: buildCustomerSnapshot(matchedCustomer, ord.customer),
      };
    });
  }, [rawOrders, customers]);

  // Real-time Order Metrics & Analytics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const confirmed = orders.filter((o) => o.status === 'Confirmed').length;
    const preparing = orders.filter((o) => o.status === 'Preparing').length;
    const readyForPickup = orders.filter((o) => o.status === 'Ready for Pickup').length;
    const outForDelivery = orders.filter((o) => o.status === 'Out for Delivery').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    const rejected = orders.filter((o) => o.status === 'Rejected').length;
    const active = pending + confirmed + preparing + readyForPickup + outForDelivery;

    const eligibleRevenue = orders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
      .reduce((sum, o) => sum + (o.grandTotal || o.amount || 0), 0);

    const uniqueCustomersCount = new Set(orders.map((o) => o.customerId || o.customer?.id).filter(Boolean)).size;

    return {
      total,
      pending,
      confirmed,
      preparing,
      readyForPickup,
      outForDelivery,
      delivered,
      cancelled,
      rejected,
      active,
      eligibleRevenue,
      uniqueCustomersCount,
    };
  }, [orders]);

  // Update order status with timestamped history & API sync
  const updateOrderStatus = (orderId, newStatus, note = '') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRawOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
          const updatedHistory = [
            ...(order.history || []),
            {
              status: newStatus,
              timestamp: nowStr,
              note: note || `Order status updated to ${newStatus}`,
            },
          ];
          return {
            ...order,
            status: newStatus,
            history: updatedHistory,
          };
        }
        return order;
      })
    );

    orderService.updateOrderStatus(orderId, { status: newStatus, note }).catch(() => {});
    if (syncCustomerOrderStatus) {
      syncCustomerOrderStatus(orderId, newStatus);
    }
    if (addActivity) {
      addActivity({
        type: newStatus === 'Delivered' ? 'delivery' : 'order',
        action: newStatus === 'Delivered' ? 'delivery' : 'order',
        title: `Order ${orderId} • ${newStatus}`,
        subtitle: note || `Status transitioned to ${newStatus}`,
        color: newStatus === 'Cancelled' || newStatus === 'Rejected' ? 'rose' : 'emerald',
        badge: newStatus,
      });
    }
  };

  // Accept incoming Pending order
  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, 'Confirmed', 'Merchant accepted order for preparation');
    toast.success(`Order ${orderId} accepted successfully!`);
  };

  // Reject incoming order
  const rejectOrder = (orderId, reason = 'Kitchen capacity full') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextPayStatus = 'Voided';

    setRawOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
          nextPayStatus = order.paymentStatus === 'Paid' ? 'Voided / Refunded' : 'Voided';
          const updatedHistory = [
            ...(order.history || []),
            {
              status: 'Rejected',
              timestamp: nowStr,
              note: `Rejected by merchant: ${reason}`,
            },
          ];
          return {
            ...order,
            status: 'Rejected',
            rejectReason: reason,
            paymentStatus: nextPayStatus,
            history: updatedHistory,
          };
        }
        return order;
      })
    );

    orderService
      .updateOrderStatus(orderId, {
        status: 'Rejected',
        rejectReason: reason,
        paymentStatus: nextPayStatus,
        note: `Rejected by merchant: ${reason}`,
      })
      .catch(() => {});
    if (syncCustomerOrderStatus) syncCustomerOrderStatus(orderId, 'Rejected');
    toast.warn(`Order ${orderId} rejected: ${reason}`);
  };

  // Cancel order with reason
  const cancelOrder = (orderId, reason = 'Customer requested cancellation') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextPayStatus = 'Cancelled';

    setRawOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
          nextPayStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Cancelled';
          const updatedHistory = [
            ...(order.history || []),
            {
              status: 'Cancelled',
              timestamp: nowStr,
              note: `Cancelled: ${reason}`,
            },
          ];
          return {
            ...order,
            status: 'Cancelled',
            cancelReason: reason,
            paymentStatus: nextPayStatus,
            history: updatedHistory,
          };
        }
        return order;
      })
    );

    orderService
      .updateOrderStatus(orderId, {
        status: 'Cancelled',
        cancelReason: reason,
        paymentStatus: nextPayStatus,
        note: `Cancelled: ${reason}`,
      })
      .catch(() => {});
    if (syncCustomerOrderStatus) syncCustomerOrderStatus(orderId, 'Cancelled');
    toast.error(`Order ${orderId} cancelled.`);
  };

  // Advance Order to next operational phase
  const advanceOrderStatus = (orderId) => {
    const target = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!target) return;

    const pipeline = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready for Pickup',
      'Out for Delivery',
      'Delivered',
    ];
    const currentIndex = pipeline.indexOf(target.status);

    if (currentIndex >= 0 && currentIndex < pipeline.length - 1) {
      const nextStatus = pipeline[currentIndex + 1];
      let note = '';
      if (nextStatus === 'Confirmed') note = 'Order confirmed by restaurant';
      if (nextStatus === 'Preparing') note = 'Kitchen began cooking and assembling';
      if (nextStatus === 'Ready for Pickup') note = 'Order bagged, waiting at dispatch counter';
      if (nextStatus === 'Out for Delivery') note = 'Delivery rider assigned and departed';
      if (nextStatus === 'Delivered') note = 'Order delivered safely to customer';

      updateOrderStatus(orderId, nextStatus, note);
      toast.success(`Order ${orderId} moved to "${nextStatus}"`);
    }
  };

  // Create new order via API & two-way sync with CustomerContext + Dashboard activities
  const createOrder = async (orderData) => {
    const idNum = Math.floor(4000 + Math.random() * 5900);
    const newId = orderData.id || `#FDX-${idNum}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const matchedCustomer = customers.find(
      (c) => c.id === (orderData.customerId || orderData.customer?.id)
    );
    const customerSnap = buildCustomerSnapshot(matchedCustomer, orderData.customer);

    const newOrder = {
      id: newId,
      rawId: newId.replace('#', ''),
      source: 'Live Placed Order',
      isCustomOrder: true,
      status: 'Pending',
      timestamp: Date.now(),
      placedAt: nowStr,
      estimatedDeliveryTime: '25-35 mins',
      deliveryPartner: 'Assigning rider...',
      paymentStatus:
        orderData.paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Paid',
      history: [
        {
          status: 'Pending',
          timestamp: nowStr,
          note: `Order placed for ${customerSnap.name} via Foodix Live Dispatch`,
        },
      ],
      ...orderData,
      customerId: customerSnap.id,
      customer: customerSnap,
    };

    setRawOrders((prev) => [newOrder, ...prev]);

    // Persist to /api/orders & /api/customers/:id/orders
    await orderService.createOrder(newOrder);

    // Update customer's order history & lifetime spend
    if (recordCustomerOrder && customerSnap.id) {
      recordCustomerOrder(customerSnap.id, newOrder);
    }

    if (addActivity) {
      addActivity({
        type: 'order',
        action: 'order',
        title: `New order ${newId} placed`,
        subtitle: `${customerSnap.name} • ${newOrder.restaurant} (₹${newOrder.grandTotal || newOrder.amount})`,
        color: 'orange',
        badge: 'New Order',
      });
    }

    toast.success(`Order ${newId} placed for ${customerSnap.name}!`);
    return newOrder;
  };

  // Get customer specific order history
  const getOrdersForCustomer = (customerId, customerEmail) => {
    return orders.filter(
      (o) =>
        (customerId && (o.customerId === customerId || o.customer?.id === customerId)) ||
        (customerEmail && o.customer?.email?.toLowerCase() === customerEmail?.toLowerCase())
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders: setRawOrders,
        stats,
        isLoading,
        isSyncingApi,
        lastSyncedAt,
        searchQuery,
        setSearchQuery,
        refreshOrdersFromApi,
        updateOrderStatus,
        acceptOrder,
        rejectOrder,
        cancelOrder,
        advanceOrderStatus,
        createOrder,
        getOrdersForCustomer,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
