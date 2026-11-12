import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useRestaurants } from './RestaurantContext';
import { OrderContext } from './OrderContext';
import { CustomerContext } from './CustomerContext';
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

const REVENUE_DATASETS = {
  'Last 7 Days': {
    total: '₹78,450',
    numericTotal: 78450,
    growth: '+16%',
    vsPeriod: 'vs previous week',
    points: [
      { label: 'Mon', value: 20000, display: '₹20k' },
      { label: 'Tue', value: 42000, display: '₹42k' },
      { label: 'Wed', value: 48000, display: '₹48k' },
      { label: 'Thu', value: 46000, display: '₹46k' },
      { label: 'Fri', value: 60000, display: '₹60k' },
      { label: 'Sat', value: 54000, display: '₹54k' },
      { label: 'Sun', value: 78450, display: '₹78.4k', highlight: true },
    ],
  },
  'Last 30 Days': {
    total: '₹3,42,800',
    numericTotal: 342800,
    growth: '+24%',
    vsPeriod: 'vs previous month',
    points: [
      { label: 'Week 1', value: 65000, display: '₹65k' },
      { label: 'Week 2', value: 82000, display: '₹82k' },
      { label: 'Week 3', value: 94000, display: '₹94k' },
      { label: 'Week 4', value: 101800, display: '₹101k', highlight: true },
    ],
  },
  'This Month': {
    total: '₹1,95,600',
    numericTotal: 195600,
    growth: '+19%',
    vsPeriod: 'target on track',
    points: [
      { label: 'Day 1-7', value: 45000, display: '₹45k' },
      { label: 'Day 8-14', value: 58000, display: '₹58k' },
      { label: 'Day 15-21', value: 62000, display: '₹62k' },
      { label: 'Day 22-28', value: 30600, display: '₹30k', highlight: true },
    ],
  },
};

export function DashboardProvider({ children }) {
  const { stats: restStats, addRestaurant, activities, addActivity, allMenuItems } = useRestaurants();
  const orderCtx = useContext(OrderContext) || {};
  const customerCtx = useContext(CustomerContext) || {};

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

  const [extraFoodItems, setExtraFoodItems] = useState(0);

  // Dashboard Stats dynamically synchronized with RestaurantContext, OrderContext & CustomerContext
  const stats = useMemo(() => {
    const orderStats = orderCtx.stats || {};
    const custStats = customerCtx.stats || {};

    return {
      totalRestaurants: restStats?.totalRestaurants || 24,
      totalRestaurantsChange: restStats?.totalChange || '+12%',
      totalFoodItems: (allMenuItems?.length || 24) + extraFoodItems,
      totalFoodItemsChange: '+12%',
      totalOrders: orderStats.total ?? orders.length,
      totalOrdersChange: '+15%',
      activeOrders: orderStats.active ?? orders.filter((o) => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status)).length,
      activeOrdersChange: '+10%',
      deliveredOrders: orderStats.delivered ?? orders.filter((o) => o.status === 'Delivered').length,
      deliveredOrdersChange: '+18%',
      totalCustomers: custStats.totalCustomers ?? 30,
      totalCustomersChange: '+14%',
    };
  }, [restStats, allMenuItems, extraFoodItems, orderCtx.stats, customerCtx.stats, orders]);

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

  // Add Menu Item Handler
  const handleAddMenuItem = (newItem) => {
    setExtraFoodItems((c) => c + 1);
    addActivity({
      type: 'menu',
      action: 'item_add',
      title: 'New menu item introduced',
      subtitle: `${newItem.name} (₹${newItem.price})`,
      color: 'orange',
      badge: 'Menu Item',
    });
    toast.success(`Menu item "${newItem.name}" (₹${newItem.price}) added!`);
    setIsAddMenuItemOpen(false);
  };

  // Apply Coupon Handler
  const handleApplyCoupon = (coupon) => {
    addActivity({
      type: 'coupon',
      action: 'coupon',
      title: 'Promotional offer published',
      subtitle: `${coupon.code} • ${coupon.discount}% OFF`,
      color: 'blue',
      badge: 'Coupon',
    });
    toast.success(`Coupon code "${coupon.code}" activated (${coupon.discount}% OFF)!`);
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
        revenueData: REVENUE_DATASETS[revenueTimeframe] || REVENUE_DATASETS['Last 7 Days'],
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
