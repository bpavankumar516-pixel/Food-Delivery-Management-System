import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRestaurants } from './RestaurantContext';

const DashboardContext = createContext(null);

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
  const { stats: restStats, addRestaurant, activities, addActivity } = useRestaurants();

  const [orders, setOrders] = useState(INITIAL_ORDERS);
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

  // Dashboard Stats dynamically synchronized with RestaurantContext
  const [stats, setStats] = useState({
    totalRestaurants: restStats?.totalRestaurants || 24,
    totalRestaurantsChange: restStats?.totalChange || '+12%',
    totalFoodItems: 356,
    totalFoodItemsChange: '+8%',
    totalOrders: 1248,
    totalOrdersChange: '+15%',
    activeOrders: 248,
    activeOrdersChange: '+10%',
    deliveredOrders: 982,
    deliveredOrdersChange: '+18%',
    totalCustomers: 892,
    totalCustomersChange: '+14%',
  });

  // Keep totalRestaurants in sync with RestaurantContext
  useEffect(() => {
    if (restStats?.totalRestaurants) {
      setStats((prev) => ({
        ...prev,
        totalRestaurants: restStats.totalRestaurants,
      }));
    }
  }, [restStats?.totalRestaurants]);

  // Real-time live simulation ticker
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      const randomAction = Math.random();

      if (randomAction > 0.6) {
        setOrders((prev) =>
          prev.map((ord, idx) => {
            if (idx === 0 && ord.status === 'Preparing') {
              addActivity({
                type: 'delivery',
                action: 'transit',
                title: 'Order out for delivery',
                subtitle: `${ord.id} • ${ord.restaurant}`,
                color: 'emerald',
                badge: 'In Transit',
              });
              return { ...ord, status: 'Out for Delivery', orderTime: 'Just now' };
            }
            if (idx === 1 && ord.status === 'Out for Delivery') {
              addActivity({
                type: 'delivery',
                action: 'delivered',
                title: `${ord.id} delivered`,
                subtitle: `${ord.restaurant} • ${ord.customer.name}`,
                color: 'emerald',
                badge: 'Delivered',
              });
              return { ...ord, status: 'Delivered', orderTime: 'Just now' };
            }
            return ord;
          })
        );
      }
    }, 16000);

    return () => clearInterval(interval);
  }, [isRealtimeActive, addActivity]);

  // Order Status Distribution Calculation
  const orderDistribution = {
    total: stats.totalOrders,
    preparingPercent: 32,
    outForDeliveryPercent: 40,
    deliveredPercent: 22,
    cancelledPercent: 6,
  };

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
    setStats((prev) => ({
      ...prev,
      totalFoodItems: prev.totalFoodItems + 1,
    }));
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

  // Update Order Status Handler
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, orderTime: 'Just now' } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
    addActivity({
      type: 'order',
      action: 'order_status',
      title: `Order ${orderId} updated`,
      subtitle: `Status changed to: ${newStatus}`,
      color: 'emerald',
      badge: newStatus,
    });
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

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
