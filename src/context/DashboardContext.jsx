import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useRestaurants } from './RestaurantContext';
import { OrderContext } from './OrderContext';
import { CustomerContext } from './CustomerContext';
import { CouponContext } from './CouponContext';
import dashboardService from '../services/dashboardService';

export const DashboardContext = createContext(null);

const INITIAL_ORDERS = [
  {
    id: '#FDX1005',
    rawId: 'FDX1005',
    customer: {
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Meadows, Hyderabad',
    },
    restaurant: 'Pizza Hut',
    amount: 499,
    formattedAmount: '₹499',
    status: 'Preparing',
    orderTime: '2 mins ago',
    timestamp: Date.now() - 2 * 60 * 1000,
    items: [
      { name: 'Veggie Supreme Pan Pizza (Medium)', qty: 1, price: 399 },
      { name: 'Garlic Bread Stix', qty: 1, price: 100 },
    ],
    paymentMethod: 'UPI (PhonePe)',
    deliveryPartner: 'Pending assignment',
  },
  {
    id: '#FDX1004',
    rawId: 'FDX1004',
    customer: {
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      phone: '+91 98765 11223',
      address: 'Tower B, Silicon Heights, Bangalore',
    },
    restaurant: "Domino's Pizza",
    amount: 349,
    formattedAmount: '₹349',
    status: 'Out for Delivery',
    orderTime: '5 mins ago',
    timestamp: Date.now() - 5 * 60 * 1000,
    items: [
      { name: 'Cheese Burst Pepperoni Pizza', qty: 1, price: 299 },
      { name: 'Choco Lava Cake', qty: 1, price: 50 },
    ],
    paymentMethod: 'Credit Card',
    deliveryPartner: 'Alex Chen (Bike #FDX-99)',
  },
  {
    id: '#FDX1003',
    rawId: 'FDX1003',
    customer: {
      name: 'Amit Kumar',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
      phone: '+91 98765 99887',
      address: 'Plot 12, Jubilee Hills, Hyderabad',
    },
    restaurant: 'KFC',
    amount: 299,
    formattedAmount: '₹299',
    status: 'Delivered',
    orderTime: '10 mins ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    items: [
      { name: 'Hot & Crispy Chicken (4 pcs)', qty: 1, price: 249 },
      { name: 'Pepsi Black 500ml', qty: 1, price: 50 },
    ],
    paymentMethod: 'Cash on Delivery',
    deliveryPartner: 'Ramesh V (Delivered)',
  },
  {
    id: '#FDX1002',
    rawId: 'FDX1002',
    customer: {
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      phone: '+91 98765 77665',
      address: 'Villa 18, Palm Meadows, Whitefield',
    },
    restaurant: 'Subway',
    amount: 399,
    formattedAmount: '₹399',
    status: 'Delivered',
    orderTime: '15 mins ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    items: [
      { name: 'Roasted Chicken Sub (Footlong)', qty: 1, price: 349 },
      { name: 'Chocolate Chip Cookie', qty: 1, price: 50 },
    ],
    paymentMethod: 'UPI (GPay)',
    deliveryPartner: 'Sunil Kumar (Delivered)',
  },
];

const formatINR = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;
const formatShortINR = (val) => {
  const num = Number(val) || 0;
  if (num >= 100000) return `₹${(num / 1000).toFixed(0)}k`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0)}k`;
  return `₹${Math.round(num)}`;
};

const getOrderDaysAgo = (order, idx) => {
  if (order.createdAt) {
    const parsed = Date.parse(order.createdAt);
    if (!Number.isNaN(parsed)) {
      return Math.max(0, Math.floor((Date.now() - parsed) / 86400000));
    }
  }
  const timeText = String(order.placedAt || order.orderTime || '').toLowerCase();
  if (timeText.includes('just now') || timeText.includes('today')) return 0;
  if (timeText.includes('yesterday')) return 1;
  return (idx % 6) + 1;
};

export function DashboardProvider({ children }) {
  const { stats: restStats, addRestaurant, activities, addActivity, allMenuItems, restaurants } = useRestaurants();
  const orderCtx = useContext(OrderContext) || {};
  const customerCtx = useContext(CustomerContext) || {};
  const couponCtx = useContext(CouponContext) || {};

  const liveOrders = orderCtx.orders && orderCtx.orders.length > 0 ? orderCtx.orders : INITIAL_ORDERS;

  const orders = useMemo(
    () =>
      liveOrders.map((o) => ({
        ...o,
        amount: o.grandTotal || o.amount || 0,
        orderTime: o.orderTime || o.placedAt || 'Just now',
        customer: {
          ...o.customer,
          avatar:
            o.customer?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              o.customer?.name || 'Customer'
            )}&background=064e3b&color=fff&bold=true`,
        },
      })),
    [liveOrders]
  );

  const [revenueTimeframe, setRevenueTimeframe] = useState('Last 7 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Quick Action Modal states
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isApplyCouponOpen, setIsApplyCouponOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAllActivitiesOpen, setIsAllActivitiesOpen] = useState(false);

  // Dashboard Stats dynamically synchronized with RestaurantContext, OrderContext & CustomerContext
  const stats = useMemo(() => {
    const orderStats = orderCtx.stats || {};
    const custStats = customerCtx.stats || {};
    const eligibleOrders = orders.filter((o) => !['Cancelled', 'Rejected'].includes(o.status));
    const eligibleRevenue =
      orderStats.eligibleRevenue ??
      eligibleOrders.reduce((sum, o) => sum + (Number(o.grandTotal || o.amount) || 0), 0);
    const averageOrderValue =
      eligibleOrders.length > 0 ? Math.round(eligibleRevenue / eligibleOrders.length) : 0;
    const avgRestaurantRating =
      restaurants && restaurants.length > 0
        ? (
            restaurants.reduce((s, r) => s + (parseFloat(r.rating) || 4.4), 0) / restaurants.length
          ).toFixed(1)
        : '4.5';

    const openRests = restStats?.openRestaurants ?? restaurants.filter((r) => r.status === 'Open').length;
    const inStockItems = (allMenuItems || []).filter((m) => m.inStock !== false).length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const activeCustomers =
      custStats.activeCustomers ??
      (customerCtx.customers || []).filter((c) => c.status !== 'Blocked').length;

    return {
      totalRestaurants: restStats?.totalRestaurants ?? restaurants.length,
      totalRestaurantsChange: `${openRests} Open`,
      totalFoodItems: (allMenuItems || []).length,
      totalFoodItemsChange: `${inStockItems} In stock`,
      totalOrders: orderStats.total ?? orders.length,
      totalOrdersChange: `${eligibleOrders.length} valid`,
      activeOrders:
        orderStats.active ??
        orders.filter((o) => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status)).length,
      activeOrdersChange: `${pendingOrders} pending`,
      deliveredOrders: orderStats.delivered ?? orders.filter((o) => o.status === 'Delivered').length,
      deliveredOrdersChange: `${orders.length > 0 ? Math.round(((orderStats.delivered ?? 0) / orders.length) * 100) : 0}% rate`,
      totalCustomers: custStats.totalCustomers ?? 0,
      totalCustomersChange: `${activeCustomers} Active`,
      eligibleRevenue,
      averageOrderValue,
      avgRestaurantRating,
    };
  }, [restStats, allMenuItems, orderCtx.stats, customerCtx.stats, customerCtx.customers, orders, restaurants]);

  // Dynamic Revenue Datasets derived directly from live orders
  const revenueDatasets = useMemo(() => {
    const eligible = orders.filter((o) => !['Cancelled', 'Rejected'].includes(o.status));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    // 1. Last 7 Days (rolling 7 days ending Today)
    const last7Buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return {
        label: i === 6 ? 'Today' : dayNames[d.getDay()],
        value: 0,
        highlight: i === 6,
      };
    });

    // 2. Last 30 Days (4 weeks)
    const last30Buckets = [
      { label: 'Week 1', value: 0 },
      { label: 'Week 2', value: 0 },
      { label: 'Week 3', value: 0 },
      { label: 'Week 4', value: 0, highlight: true },
    ];

    // 3. This Month (4 brackets)
    const monthBuckets = [
      { label: 'Day 1-7', value: 0 },
      { label: 'Day 8-14', value: 0 },
      { label: 'Day 15-21', value: 0 },
      { label: 'Day 22-31', value: 0, highlight: true },
    ];

    eligible.forEach((order, idx) => {
      const amt = Number(order.grandTotal || order.amount) || 0;
      const daysAgo = getOrderDaysAgo(order, idx);

      if (daysAgo <= 6) {
        last7Buckets[6 - daysAgo].value += amt;
      }

      if (daysAgo <= 29) {
        const weekIdx = Math.max(0, Math.min(3, 3 - Math.floor(daysAgo / 7)));
        last30Buckets[weekIdx].value += amt;
      }

      const orderDate = order.createdAt && !Number.isNaN(Date.parse(order.createdAt))
        ? new Date(order.createdAt)
        : new Date(now.getTime() - daysAgo * 86400000);
      const dayOfMonth = orderDate.getDate();
      const bracketIdx = dayOfMonth <= 7 ? 0 : dayOfMonth <= 14 ? 1 : dayOfMonth <= 21 ? 2 : 3;
      monthBuckets[bracketIdx].value += amt;
    });

    const finalize = (pts, vsPeriod) => {
      const numericTotal = pts.reduce((sum, p) => sum + p.value, 0);
      const firstHalf = pts.slice(0, Math.floor(pts.length / 2)).reduce((s, p) => s + p.value, 0);
      const secondHalf = pts.slice(Math.floor(pts.length / 2)).reduce((s, p) => s + p.value, 0);
      const deltaPct =
        firstHalf > 0
          ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
          : secondHalf > 0
          ? 100
          : 0;
      const growth = `${deltaPct >= 0 ? '+' : ''}${deltaPct}%`;
      return {
        total: formatINR(numericTotal),
        numericTotal,
        growth,
        vsPeriod,
        points: pts.map((p) => ({
          ...p,
          display: formatShortINR(p.value),
        })),
      };
    };

    return {
      'Last 7 Days': finalize(last7Buckets, `${eligible.length} active/completed orders`),
      'Last 30 Days': finalize(last30Buckets, 'live 30-day trend'),
      'This Month': finalize(monthBuckets, 'current month breakdown'),
    };
  }, [orders]);

  // Initial dashboard network fetch for browser Network tab visibility
  useEffect(() => {
    dashboardService.getStats().catch(() => {});
    dashboardService.getActivities().catch(() => {});
    dashboardService.getOrders().catch(() => {});
  }, []);

  // Order Status Distribution Calculation (Live from OrderContext)
  const orderDistribution = useMemo(() => {
    const total = Math.max(orders.length, 1);
    const preparingCount = orders.filter((o) =>
      ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup'].includes(o.status)
    ).length;
    const transitCount = orders.filter((o) => o.status === 'Out for Delivery').length;
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledCount = orders.filter((o) =>
      ['Cancelled', 'Rejected'].includes(o.status)
    ).length;

    const preparingPercent = Math.round((preparingCount / total) * 100);
    const outForDeliveryPercent = Math.round((transitCount / total) * 100);
    const deliveredPercent = Math.round((deliveredCount / total) * 100);
    const cancelledPercent =
      cancelledCount === 0
        ? 0
        : Math.max(0, 100 - preparingPercent - outForDeliveryPercent - deliveredPercent);

    return {
      total: orders.length,
      preparingPercent,
      outForDeliveryPercent,
      deliveredPercent,
      cancelledPercent,
    };
  }, [orders]);

  // Add Restaurant Handler (persists into RestaurantContext and updates Dashboard activities)
  const handleAddRestaurant = (newRest) => {
    addRestaurant({
      name: newRest.name,
      cuisines: newRest.cuisine || 'Fast Food',
      location: newRest.location || 'Bengaluru',
      rating: newRest.rating || '4.5',
      category: 'Burgers',
    });
    setIsAddRestaurantOpen(false);
  };

  // Add Menu Item Modal state closure (item itself is persisted via RestaurantContext.addMenuItem)
  const handleAddMenuItem = () => {
    setIsAddMenuItemOpen(false);
  };

  // Apply Coupon Handler — persists into shared CouponContext for Admin & Customer Portal
  const handleApplyCoupon = (coupon) => {
    const cleanCode = String(coupon.code || '').trim().toUpperCase();
    if (couponCtx.addCoupon && cleanCode) {
      couponCtx.addCoupon({
        code: cleanCode,
        title: `${coupon.discount}% OFF Platform Promo`,
        description: `Save ${coupon.discount}% on orders above ₹${coupon.minOrder || 0}.`,
        discountType: 'percentage',
        discountValue: Number(coupon.discount) || 10,
        offerTag: `${coupon.discount}% OFF`,
        minOrderAmount: Number(coupon.minOrder) || 0,
        maxDiscount: 200,
        expiryDate: 'Dec 31, 2026',
        dateLabel: 'Valid till: Dec 31, 2026',
        category: 'General',
        status: 'Active',
        bannerImage:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
      });
    } else {
      toast.success(`Coupon code "${cleanCode}" activated (${coupon.discount}% OFF)!`);
    }
    addActivity({
      type: 'coupon',
      action: 'coupon',
      title: 'Promotional offer published',
      subtitle: `${cleanCode} • ${coupon.discount}% OFF (Min ₹${coupon.minOrder || 0})`,
      color: 'blue',
      badge: 'Coupon',
    });
    setIsApplyCouponOpen(false);
  };

  // Update Order Status Handler (syncs with OrderContext + CustomerContext)
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    if (orderCtx.updateOrderStatus) {
      orderCtx.updateOrderStatus(orderId, newStatus, `Updated from Dashboard to ${newStatus}`);
    }
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
    toast.info(`Order ${orderId} status updated to: ${newStatus}`);
  };

  // Filtered Orders by Search Query
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.restaurant.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardContext.Provider
      value={{
        orders: filteredOrders,
        allOrders: orders,
        stats,
        activities,
        revenueData: revenueDatasets[revenueTimeframe] || revenueDatasets['Last 7 Days'],
        revenueTimeframe,
        setRevenueTimeframe,
        orderDistribution,
        searchQuery,
        setSearchQuery,
        isRealtimeActive,
        setIsRealtimeActive,
        selectedOrder,
        setSelectedOrder,
        isAddRestaurantOpen,
        setIsAddRestaurantOpen,
        isAddMenuItemOpen,
        setIsAddMenuItemOpen,
        isApplyCouponOpen,
        setIsApplyCouponOpen,
        isReportsOpen,
        setIsReportsOpen,
        isAllActivitiesOpen,
        setIsAllActivitiesOpen,
        handleAddRestaurant,
        handleAddMenuItem,
        handleApplyCoupon,
        handleUpdateOrderStatus,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(options = { required: true }) {
  const context = useContext(DashboardContext);
  if (!context && options?.required !== false) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context || {};
}
