import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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

const INITIAL_ACTIVITIES = [
  {
    id: 'act_1',
    type: 'order',
    title: 'New order #FDX1005',
    time: '2 mins ago',
    iconType: 'bike',
    color: 'emerald',
  },
  {
    id: 'act_2',
    type: 'restaurant',
    title: 'New restaurant registered',
    subtitle: 'Pizza Hut',
    time: '5 mins ago',
    iconType: 'store',
    color: 'orange',
  },
  {
    id: 'act_3',
    type: 'delivery',
    title: 'Order #FDX1004 delivered',
    time: '8 mins ago',
    iconType: 'check',
    color: 'emerald',
  },
  {
    id: 'act_4',
    type: 'customer',
    title: 'New customer registered',
    subtitle: 'Rahul Sharma',
    time: '12 mins ago',
    iconType: 'user',
    color: 'blue',
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
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
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

  // Dashboard Stats matching reference
  const [stats, setStats] = useState({
    totalRestaurants: 24,
    totalRestaurantsChange: '+12%',
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

  // Real-time live simulation ticker
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      // Simulate sporadic live updates
      const randomAction = Math.random();

      if (randomAction > 0.6) {
        // Advance an existing order's status
        setOrders((prev) =>
          prev.map((ord, idx) => {
            if (idx === 0 && ord.status === 'Preparing') {
              return { ...ord, status: 'Out for Delivery', orderTime: 'Just now' };
            }
            if (idx === 1 && ord.status === 'Out for Delivery') {
              return { ...ord, status: 'Delivered', orderTime: 'Just now' };
            }
            return ord;
          })
        );
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  // Order Status Distribution Calculation
  const orderDistribution = {
    total: stats.totalOrders,
    preparingPercent: 32,
    outForDeliveryPercent: 40,
    deliveredPercent: 22,
    cancelledPercent: 6,
  };

  // Add Restaurant Handler
  const handleAddRestaurant = (newRest) => {
    setStats((prev) => ({
      ...prev,
      totalRestaurants: prev.totalRestaurants + 1,
    }));
    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: 'restaurant',
        title: 'New restaurant registered',
        subtitle: newRest.name,
        time: 'Just now',
        iconType: 'store',
        color: 'orange',
      },
      ...prev.slice(0, 3),
    ]);
    toast.success(`Restaurant "${newRest.name}" added successfully to Foodix!`);
    setIsAddRestaurantOpen(false);
  };

  // Add Menu Item Handler
  const handleAddMenuItem = (newItem) => {
    setStats((prev) => ({
      ...prev,
      totalFoodItems: prev.totalFoodItems + 1,
    }));
    toast.success(`Menu item "${newItem.name}" (₹${newItem.price}) added!`);
    setIsAddMenuItemOpen(false);
  };

  // Apply Coupon Handler
  const handleApplyCoupon = (coupon) => {
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
