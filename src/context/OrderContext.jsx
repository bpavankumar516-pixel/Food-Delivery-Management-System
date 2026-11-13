import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import orderService, { buildCustomerSnapshot } from '../services/orderService';
import { CustomerContext } from './CustomerContext';
import { RestaurantContext } from './RestaurantContext';
import { NotificationSupportContext } from './NotificationSupportContext';

export const OrderContext = createContext(null);
const STORAGE_KEY = 'foodix_orders_live_v3';

export const ORDER_PIPELINE = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
];

export const TERMINAL_STATUSES = ['Delivered', 'Cancelled', 'Rejected'];

export const VALID_STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Rejected', 'Cancelled'],
  Confirmed: ['Preparing', 'Rejected', 'Cancelled'],
  Preparing: ['Ready for Pickup', 'Cancelled'],
  'Ready for Pickup': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
  Rejected: [],
};

const normalizeStatusName = (status) => (status === 'Ready' ? 'Ready for Pickup' : status);

export function isValidStatusTransition(currentStatus, nextStatus) {
  const curr = normalizeStatusName(currentStatus);
  const next = normalizeStatusName(nextStatus);
  if (!next) {
    return { valid: false, reason: 'Target order status is required.' };
  }
  if (curr === next) {
    return { valid: false, reason: `Order is already "${curr}".` };
  }
  if (TERMINAL_STATUSES.includes(curr)) {
    return { valid: false, reason: `Completed, cancelled, or rejected orders (${curr}) cannot change status.` };
  }
  const allowed = VALID_STATUS_TRANSITIONS[curr];
  if (!allowed) {
    return { valid: false, reason: `Unrecognized current order status "${curr}".` };
  }
  if (!allowed.includes(next)) {
    const nextHint = allowed.length > 0 ? ` Allowed next: ${allowed.join(', ')}.` : '';
    return {
      valid: false,
      reason: `Invalid status transition from "${curr}" to "${next}".${nextHint}`,
    };
  }
  return { valid: true, reason: '' };
}

export function getValidNextStatuses(currentStatus) {
  return VALID_STATUS_TRANSITIONS[normalizeStatusName(currentStatus)] || [];
}

export function formatOrderDateLabel(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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
  const notifCtx = useContext(NotificationSupportContext) || {};

  const {
    customers = [],
    isLoading: customersLoading = false,
    recordCustomerOrder,
    syncCustomerOrderStatus,
    reconcileCustomersWithOrders,
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
  const creatingOrderRef = useRef(false);
  const recentOrderFingerprintRef = useRef({ key: '', ts: 0, order: null });

  // Sync rawOrders to localStorage
  useEffect(() => {
    if (rawOrders.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawOrders));
    } catch {
      // ignore storage quota errors
    }
  }, [rawOrders]);

  // Cross-tab synchronization so Customer & Admin tabs stay updated automatically
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          setRawOrders(parsed);
        }
      } catch {
        // ignore malformed cross-tab payload
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Reconcile every customer's live ordersCount, totalSpent & order history directly from Orders
  useEffect(() => {
    if (!reconcileCustomersWithOrders || customers.length === 0) return;
    if (isLoading && rawOrders.length === 0) return;
    reconcileCustomersWithOrders(rawOrders);
  }, [rawOrders, customers.length, isLoading, reconcileCustomersWithOrders]);

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

      const resolvedCustomerId =
        matchedCustomer?.id || ord.customerId || ord.customer?.id || 'GUEST';
      const normalizedStatus = normalizeStatusName(ord.status || 'Pending');
      const orderDate = ord.orderDate || formatOrderDateLabel(ord.timestamp);

      if (!matchedCustomer) {
        return {
          ...ord,
          status: normalizedStatus,
          orderDate,
          customerId: resolvedCustomerId,
          customer: buildCustomerSnapshot(null, { ...ord.customer, id: resolvedCustomerId }),
        };
      }

      return {
        ...ord,
        status: normalizedStatus,
        orderDate,
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

  // Update order status with transition validation, timestamped history & API sync
  const updateOrderStatus = (orderId, newStatus, note = '') => {
    const targetOrder = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!targetOrder) {
      toast.error(`Order ${orderId} was not found.`);
      return false;
    }

    const normalizedNext = normalizeStatusName(newStatus);
    const check = isValidStatusTransition(targetOrder.status, normalizedNext);
    if (!check.valid) {
      toast.warn(check.reason);
      return false;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRawOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
          const updatedHistory = [
            ...(order.history || []),
            {
              status: normalizedNext,
              timestamp: nowStr,
              note: note || `Order status updated to ${normalizedNext}`,
            },
          ];
          const nextPaymentStatus =
            normalizedNext === 'Delivered' &&
            (order.paymentMethod || '').toLowerCase().includes('cash')
              ? 'Paid'
              : order.paymentStatus;
          return {
            ...order,
            status: normalizedNext,
            paymentStatus: nextPaymentStatus,
            history: updatedHistory,
          };
        }
        return order;
      })
    );

    orderService.updateOrderStatus(orderId, { status: normalizedNext, note }).catch(() => {});
    if (syncCustomerOrderStatus) {
      syncCustomerOrderStatus(orderId, normalizedNext);
    }
    if (notifCtx.addNotification) {
      notifCtx.addNotification({
        title: `Order ${orderId} • ${normalizedNext}`,
        message:
          note || `Your order from ${targetOrder.restaurant || 'Foodix Kitchen'} is now ${normalizedNext}.`,
        type: 'status',
        orderId,
        customerEmail: targetOrder.customer?.email || undefined,
      });
    }
    if (addActivity) {
      addActivity({
        type: normalizedNext === 'Delivered' ? 'delivery' : 'order',
        action: normalizedNext === 'Delivered' ? 'delivery' : 'order',
        title: `Order ${orderId} • ${normalizedNext}`,
        subtitle: note || `Status transitioned to ${normalizedNext}`,
        color: normalizedNext === 'Cancelled' || normalizedNext === 'Rejected' ? 'rose' : 'emerald',
        badge: normalizedNext,
      });
    }
    return true;
  };

  // Accept incoming Pending order
  const acceptOrder = (orderId) => {
    const ok = updateOrderStatus(orderId, 'Confirmed', 'Merchant accepted order for preparation');
    if (ok) {
      toast.success(`Order ${orderId} accepted successfully!`);
    }
    return ok;
  };

  // Reject incoming order
  const rejectOrder = (orderId, reason = 'Kitchen capacity full') => {
    const targetOrder = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!targetOrder) {
      toast.error(`Order ${orderId} was not found.`);
      return false;
    }
    const check = isValidStatusTransition(targetOrder.status, 'Rejected');
    if (!check.valid) {
      toast.warn(check.reason);
      return false;
    }

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
    if (notifCtx.addNotification) {
      notifCtx.addNotification({
        title: `Order ${orderId} Rejected`,
        message: `Rejected: ${reason}`,
        type: 'status',
        orderId,
        customerEmail: targetOrder.customer?.email || undefined,
      });
    }
    toast.warn(`Order ${orderId} rejected: ${reason}`);
    return true;
  };

  // Cancel order with reason
  const cancelOrder = (orderId, reason = 'Customer requested cancellation') => {
    const targetOrder = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!targetOrder) {
      toast.error(`Order ${orderId} was not found.`);
      return false;
    }
    const check = isValidStatusTransition(targetOrder.status, 'Cancelled');
    if (!check.valid) {
      toast.warn(check.reason);
      return false;
    }

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
    if (notifCtx.addNotification) {
      notifCtx.addNotification({
        title: `Order ${orderId} Cancelled`,
        message: `Cancelled: ${reason}`,
        type: 'status',
        orderId,
        customerEmail: targetOrder.customer?.email || undefined,
      });
    }
    toast.error(`Order ${orderId} cancelled.`);
    return true;
  };

  // Advance Order to next operational phase
  const advanceOrderStatus = (orderId) => {
    const target = orders.find((o) => o.id === orderId || o.rawId === orderId);
    if (!target) return false;

    const currentIndex = ORDER_PIPELINE.indexOf(normalizeStatusName(target.status));

    if (currentIndex >= 0 && currentIndex < ORDER_PIPELINE.length - 1) {
      const nextStatus = ORDER_PIPELINE[currentIndex + 1];
      let note = '';
      if (nextStatus === 'Confirmed') note = 'Order confirmed by restaurant';
      if (nextStatus === 'Preparing') note = 'Kitchen began cooking and assembling';
      if (nextStatus === 'Ready for Pickup') note = 'Order bagged, waiting at dispatch counter';
      if (nextStatus === 'Out for Delivery') note = 'Delivery rider assigned and departed';
      if (nextStatus === 'Delivered') note = 'Order delivered safely to customer';

      const ok = updateOrderStatus(orderId, nextStatus, note);
      if (ok) {
        toast.success(`Order ${orderId} moved to "${nextStatus}"`);
      }
      return ok;
    }

    toast.warn(`Order ${orderId} cannot advance from "${target.status}".`);
    return false;
  };

  // Generate guaranteed unique #FDX-XXXX order ID
  const generateUniqueOrderId = (preferredId = null) => {
    const existingIds = new Set(
      rawOrders.flatMap((o) => [o.id, o.rawId ? `#${o.rawId}` : null].filter(Boolean))
    );
    if (preferredId && !existingIds.has(preferredId)) {
      return preferredId;
    }
    let attempt = 0;
    let candidate = '';
    do {
      const numPart =
        attempt < 20
          ? Math.floor(1000 + Math.random() * 8999)
          : `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 89)}`;
      candidate = `#FDX-${numPart}`;
      attempt += 1;
    } while (existingIds.has(candidate) && attempt < 40);
    return candidate;
  };

  // Create new order via API & two-way sync with CustomerContext + Dashboard activities (with duplicate guard)
  const createOrder = async (orderData) => {
    if (creatingOrderRef.current) {
      toast.warn('Order submission is already in progress. Please wait.');
      return null;
    }

    const normalizedItems = (orderData.items || []).map((it) => ({
      ...it,
      qty: Math.max(1, Number(it.qty || 1)),
      price: Math.max(0, Number(it.price || 0)),
    }));
    const itemSig = normalizedItems
      .map((i) => `${i.id || i.name}:${i.qty}`)
      .sort()
      .join('|');
    const custKey =
      orderData.customerId || orderData.customer?.id || orderData.customer?.email || 'guest';
    const fingerprint = `${custKey}::${orderData.restaurantId || orderData.restaurant}::${itemSig}::${orderData.paymentMethod || 'Online'}`;

    const recent = recentOrderFingerprintRef.current;
    if (recent.key === fingerprint && Date.now() - recent.ts < 8000 && recent.order) {
      toast.info(`Duplicate order prevented — showing existing order ${recent.order.id}.`);
      return recent.order;
    }

    creatingOrderRef.current = true;
    try {
      const newId = generateUniqueOrderId(orderData.id || null);
      const nowTs = Date.now();
      const nowStr = new Date(nowTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const orderDateStr = orderData.orderDate || formatOrderDateLabel(nowTs);

      const matchedCustomer = customers.find(
        (c) =>
          c.id === (orderData.customerId || orderData.customer?.id) ||
          (orderData.customer?.email &&
            c.email?.toLowerCase() === orderData.customer.email.toLowerCase())
      );
      const customerSnap = buildCustomerSnapshot(matchedCustomer, orderData.customer);
      const resolvedCustId = matchedCustomer?.id || customerSnap.id || orderData.customerId || 'GUEST';
      customerSnap.id = resolvedCustId;

      const computedSubtotal = normalizedItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      const finalSubtotal =
        computedSubtotal > 0 ? computedSubtotal : Math.max(0, Number(orderData.subtotal || 0));
      const finalDiscount = Math.min(Math.max(0, Number(orderData.discount || 0)), finalSubtotal);
      const finalDeliveryFee = Math.max(0, Number(orderData.deliveryFee ?? 0));
      const finalTax = Math.max(
        0,
        Number(orderData.tax ?? Math.round(Math.max(finalSubtotal - finalDiscount, 0) * 0.05))
      );
      const finalGrandTotal = Math.max(
        finalSubtotal - finalDiscount + finalDeliveryFee + finalTax,
        0
      );

      const newOrder = {
        ...orderData,
        id: newId,
        rawId: newId.replace('#', ''),
        source: orderData.source || 'Live Placed Order',
        isCustomOrder: true,
        status: 'Pending',
        timestamp: nowTs,
        orderDate: orderDateStr,
        placedAt: nowStr,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime || '25-35 mins',
        deliveryPartner: orderData.deliveryPartner || 'Assigning rider...',
        paymentStatus:
          (orderData.paymentMethod || '').toLowerCase().includes('cash')
            ? 'Pending COD'
            : 'Paid',
        items: normalizedItems,
        subtotal: finalSubtotal,
        discount: finalDiscount,
        deliveryFee: finalDeliveryFee,
        tax: finalTax,
        grandTotal: finalGrandTotal,
        amount: finalGrandTotal,
        customerId: resolvedCustId,
        customer: customerSnap,
        history: [
          {
            status: 'Pending',
            timestamp: nowStr,
            note: `Order placed on ${orderDateStr} for ${customerSnap.name} via ${
              orderData.source || 'Foodix Live Dispatch'
            }`,
          },
        ],
      };

      recentOrderFingerprintRef.current = { key: fingerprint, ts: nowTs, order: newOrder };
      setRawOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      // Persist to /api/orders & /api/customers/:id/orders
      await orderService.createOrder(newOrder);

      // Update customer's order history & lifetime spend
      if (recordCustomerOrder && resolvedCustId && resolvedCustId !== 'GUEST') {
        recordCustomerOrder(resolvedCustId, newOrder);
      }

      if (addActivity) {
        addActivity({
          type: 'order',
          action: 'order',
          title: `New order ${newId} placed`,
          subtitle: `${customerSnap.name} • ${newOrder.restaurant} (₹${finalGrandTotal})`,
          color: 'orange',
          badge: 'New Order',
        });
      }

      toast.success(`Order ${newId} placed for ${customerSnap.name}!`);
      return newOrder;
    } finally {
      creatingOrderRef.current = false;
    }
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
        isValidStatusTransition,
        getValidNextStatuses,
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
