import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_MASTER_ORDERS } from '../data/mockMasterOrders';

const OrderContext = createContext(null);
const STORAGE_KEY = 'foodix_orders_master_v2';

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
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse orders from localStorage', e);
    }
    return INITIAL_MASTER_ORDERS;
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Order Metrics & Analytics
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

    // Eligible completed revenue (excludes Cancelled and Rejected)
    const eligibleRevenue = orders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
      .reduce((sum, o) => sum + (o.grandTotal || o.amount || 0), 0);

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
      eligibleRevenue,
    };
  }, [orders]);

  // Update order status with timestamped history
  const updateOrderStatus = (orderId, newStatus, note = '') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
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
  };

  // Accept incoming Pending order
  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, 'Confirmed', 'Merchant accepted order for preparation');
    toast.success(`Order ${orderId} accepted successfully!`);
  };

  // Reject incoming order
  const rejectOrder = (orderId, reason = 'Kitchen capacity full') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
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
            paymentStatus: order.paymentStatus === 'Paid' ? 'Voided / Refunded' : 'Voided',
            history: updatedHistory,
          };
        }
        return order;
      })
    );
    toast.warn(`Order ${orderId} rejected: ${reason}`);
  };

  // Cancel order with reason
  const cancelOrder = (orderId, reason = 'Customer requested cancellation') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.rawId === orderId) {
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
            paymentStatus: order.paymentStatus === 'Paid' ? 'Refunded' : 'Cancelled',
            history: updatedHistory,
          };
        }
        return order;
      })
    );
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

  // Create new order (e.g. simulated live customer order or manual order)
  const createOrder = (orderData) => {
    const idNum = Math.floor(2050 + Math.random() * 900);
    const newId = `#FDX-${idNum}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: newId,
      rawId: `FDX-${idNum}`,
      status: 'Pending',
      timestamp: Date.now(),
      placedAt: nowStr,
      history: [
        {
          status: 'Pending',
          timestamp: nowStr,
          note: 'Order placed by customer via Foodix Online',
        },
      ],
      ...orderData,
    };

    setOrders((prev) => [newOrder, ...prev]);
    toast.info(`🔔 New live incoming order ${newId}!`);
    return newOrder;
  };

  // Get customer specific order history
  const getOrdersForCustomer = (customerId, customerEmail) => {
    return orders.filter(
      (o) =>
        (customerId && o.customer?.id === customerId) ||
        (customerEmail && o.customer?.email?.toLowerCase() === customerEmail?.toLowerCase())
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        stats,
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
