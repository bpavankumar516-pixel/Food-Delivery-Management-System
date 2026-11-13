import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';
import { INITIAL_CUSTOMERS } from '../data/mockCustomers';
import { RestaurantContext } from './RestaurantContext';

export const CustomerContext = createContext(null);
const STORAGE_KEY = 'foodix_customers_v4';

export function CustomerProvider({ children }) {
  const restaurantCtx = useContext(RestaurantContext) || {};
  const addActivity = restaurantCtx.addActivity;

  // Initialize customers from localStorage or fallback
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse customers from localStorage', e);
    }
    return INITIAL_CUSTOMERS.map((c) => ({
      ...c,
      totalSpent: 0,
      ordersCount: 0,
      orders: [],
    }));
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingApi, setIsRefreshingApi] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to save customers to localStorage', e);
    }
  }, [customers]);

  // Helper to merge live DummyJSON API customers with local customer orders/status overrides
  const mergeCustomersWithLocalState = (prev, apiUsers) => {
    const prevMap = new Map(prev.map((c) => [c.id, c]));
    const customOrPortalUsers = prev.filter(
      (c) => c.id.startsWith('cust_user_') || c.id.startsWith('usr_cust_')
    );
    const seedPortalUsers = INITIAL_CUSTOMERS.filter(
      (c) => c.id.startsWith('usr_cust_') && !prevMap.has(c.id)
    );

    const mergedApiUsers = apiUsers.map((u) => {
      const existing = prevMap.get(u.id);
      if (!existing) return u;

      // Preserve any live reconciled orders & spend on this customer
      const existingOrders = Array.isArray(existing.orders) ? existing.orders : [];

      return {
        ...u,
        status: existing.status || u.status,
        orders: existingOrders,
        ordersCount: existing.ordersCount ?? 0,
        totalSpent: existing.totalSpent ?? 0,
      };
    });

    return [...customOrPortalUsers, ...seedPortalUsers, ...mergedApiUsers];
  };

  // Initial fetch from DummyJSON Users API (visible in browser Network tab)
  useEffect(() => {
    let isMounted = true;
    const fetchApiUsers = async () => {
      setIsLoading(true);
      try {
        const dummyUsers = await customerService.fetchFromDummyJson();
        if (isMounted && dummyUsers && dummyUsers.length > 0) {
          setCustomers((prev) => mergeCustomersWithLocalState(prev, dummyUsers));
        }
      } catch (err) {
        console.warn('Error fetching DummyJSON users:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Manual Refresh from DummyJSON
  const refreshFromDummyJson = async () => {
    setIsRefreshingApi(true);
    toast.info('Fetching live customer data from DummyJSON API...');
    try {
      const liveUsers = await customerService.fetchFromDummyJson();
      if (liveUsers && liveUsers.length > 0) {
        setCustomers((prev) => mergeCustomersWithLocalState(prev, liveUsers));
        toast.success(`Synchronized ${liveUsers.length} customers from DummyJSON!`);
      }
    } catch (err) {
      console.warn('Failed to refresh from DummyJSON API:', err);
      toast.error('Failed to refresh from DummyJSON API');
    } finally {
      setIsRefreshingApi(false);
    }
  };

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status'); // 'All Status' | 'Active' | 'Blocked'
  const [selectedGender, setSelectedGender] = useState('All Genders'); // 'All Genders' | 'female' | 'male'
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('Name: A-Z'); // 'Most Orders' | 'Total Spent: High to Low' | 'Name: A-Z' | 'Customer ID'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Matching Image 2: "Showing 1 – 7 of 892 customers"

  // Modals & Selected Customer: View, Edit, Add, Delete, Create Order
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    customer: null,
  });

  // Unique Cities list for filter dropdown
  const cities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Search query filter (name, email, phone, city, company)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.fullName?.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchPhone = c.phone?.toLowerCase().includes(q);
          const matchCity = c.city?.toLowerCase().includes(q);
          const matchUser = c.username?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchUser) return false;
        }

        // Status filter (Active / Blocked)
        if (selectedStatus !== 'All Status' && c.status !== selectedStatus) {
          return false;
        }

        // Gender filter
        if (selectedGender !== 'All Genders' && c.gender?.toLowerCase() !== selectedGender.toLowerCase()) {
          return false;
        }

        // City filter
        if (selectedCity !== 'All Cities' && c.city !== selectedCity) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Most Orders') return (b.ordersCount || 0) - (a.ordersCount || 0);
        if (sortBy === 'Total Spent: High to Low') return (b.totalSpent || 0) - (a.totalSpent || 0);
        if (sortBy === 'Name: A-Z') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'Customer ID') return (a.dummyId || 0) - (b.dummyId || 0);
        return 0;
      });
  }, [customers, searchQuery, selectedStatus, selectedGender, selectedCity, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedGender, selectedCity, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Overview Stats matching Image 2 KPI cards
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'Active').length;
    const blocked = customers.filter((c) => c.status === 'Blocked').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.ordersCount || 0), 0);

    return {
      totalCustomers: total,
      activeCustomers: active,
      blockedCustomers: blocked,
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  }, [customers]);

  // Toggle Block / Unblock Customer
  const toggleBlockCustomer = (customerId) => {
    let customerName = '';
    let nextStatus = '';

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          nextStatus = c.status === 'Blocked' ? 'Active' : 'Blocked';
          customerName = c.fullName;
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );

    if (customerName) {
      toast.info(`Customer "${customerName}" is now ${nextStatus}`);
      setSelectedCustomer((curr) => (curr?.id === customerId ? { ...curr, status: nextStatus } : curr));
    }
  };

  // Actions
  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const closeCustomerDetails = () => {
    setIsDetailsModalOpen(false);
  };

  // Edit Customer Modal
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const updateCustomer = (customerId, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = {
            ...c,
            ...updatedFields,
          };
          if (selectedCustomer?.id === customerId) {
            setSelectedCustomer(updated);
          }
          return updated;
        }
        return c;
      })
    );
    toast.success('Customer details updated successfully!');
    closeEditModal();
  };

  const openDeleteModal = (customer) => {
    setDeleteModalState({
      isOpen: true,
      customer,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      customer: null,
    });
  };

  const confirmDelete = () => {
    if (!deleteModalState.customer) return;
    const target = deleteModalState.customer;
    setCustomers((prev) => prev.filter((c) => c.id !== target.id));
    toast.success(`Customer "${target.fullName}" deleted successfully.`);
    closeDeleteModal();
  };

  // Add new Customer
  const addCustomer = (customerData) => {
    const newId = `cust_user_${Date.now()}`;
    const newCustomer = {
      id: newId,
      dummyId: Math.floor(Math.random() * 900) + 100,
      firstName: customerData.firstName || customerData.fullName.split(' ')[0],
      lastName: customerData.lastName || customerData.fullName.split(' ')[1] || '',
      fullName: customerData.fullName,
      email: customerData.email,
      phone: customerData.phone,
      username: customerData.username || customerData.email.split('@')[0],
      password: customerData.password || 'foodixpass123',
      avatar:
        customerData.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`,
      gender: customerData.gender || 'other',
      age: customerData.age || 26,
      address: customerData.address || 'MG Road',
      city: customerData.city || 'Bengaluru',
      state: customerData.state || 'Karnataka',
      postalCode: customerData.postalCode || '560001',
      company: customerData.company || 'Self Employed',
      role: customerData.role || 'Member',
      tier: 'New',
      status: 'Active',
      totalSpent: 0,
      ordersCount: 0,
      favoriteCuisine: customerData.favoriteCuisine || 'Pizza',
      registeredDate: new Date().toISOString(),
      lastActive: 'Just registered',
      orders: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    customerService.createCustomer(newCustomer);

    if (addActivity) {
      addActivity({
        type: 'customer',
        action: 'customer',
        title: 'New customer onboarded',
        subtitle: `${newCustomer.fullName} (${newCustomer.city})`,
        color: 'blue',
        badge: 'Customer',
      });
    }

    toast.success(`Customer "${newCustomer.fullName}" added successfully!`);
    setIsAddCustomerOpen(false);
    return newCustomer;
  };

  // Create Order Modal triggers for Customer page
  const openCreateOrderModal = (customer) => {
    setSelectedCustomer(customer);
    setIsCreateOrderOpen(true);
  };

  const closeCreateOrderModal = () => {
    setIsCreateOrderOpen(false);
  };

  // Record a placed order into customer's history & lifetime metrics (two-way sync with OrderContext)
  const recordCustomerOrder = (customerId, orderObj) => {
    if (!customerId || !orderObj) return;
    const orderAmount = orderObj.grandTotal || orderObj.amount || 0;
    const customerOrderEntry = {
      id: orderObj.id,
      restaurant: orderObj.restaurant || orderObj.restaurantName || 'Foodix Kitchen',
      restaurantId: orderObj.restaurantId || 'rest_001',
      date: orderObj.placedAt || 'Just now',
      timestamp: orderObj.timestamp || Date.now(),
      amount: orderAmount,
      grandTotal: orderAmount,
      status: orderObj.status || 'Pending',
      paymentMethod: orderObj.paymentMethod || 'UPI (PhonePe)',
      deliveryAddress: orderObj.deliveryAddress || orderObj.customer?.address || '',
      items: orderObj.items || [],
    };

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        const alreadyHas = (c.orders || []).some((o) => o.id === customerOrderEntry.id);
        const updatedOrders = alreadyHas
          ? c.orders.map((o) => (o.id === customerOrderEntry.id ? customerOrderEntry : o))
          : [customerOrderEntry, ...(c.orders || [])];

        const updatedCustomer = {
          ...c,
          orders: updatedOrders,
          ordersCount: alreadyHas ? c.ordersCount : (c.ordersCount || 0) + 1,
          totalSpent: alreadyHas ? c.totalSpent : (c.totalSpent || 0) + orderAmount,
          lastActive: 'Just now',
        };
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(updatedCustomer);
        }
        return updatedCustomer;
      })
    );
  };

  // Sync status change from OrdersPage back into Customer's order history & spend totals
  const syncCustomerOrderStatus = (orderId, newStatus) => {
    if (!orderId) return;
    setCustomers((prev) =>
      prev.map((c) => {
        if (!Array.isArray(c.orders) || !c.orders.some((o) => o.id === orderId)) {
          return c;
        }
        const target = c.orders.find((o) => o.id === orderId);
        const wasVoided = target && ['Cancelled', 'Rejected'].includes(target.status);
        const nowVoided = ['Cancelled', 'Rejected'].includes(newStatus);
        const orderAmt = Number(target?.grandTotal || target?.amount || 0);
        let nextTotalSpent = Number(c.totalSpent || 0);
        if (!wasVoided && nowVoided) {
          nextTotalSpent = Math.max(0, nextTotalSpent - orderAmt);
        } else if (wasVoided && !nowVoided) {
          nextTotalSpent += orderAmt;
        }
        const updated = {
          ...c,
          totalSpent: nextTotalSpent,
          orders: c.orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        };
        if (selectedCustomer?.id === c.id) {
          setSelectedCustomer(updated);
        }
        return updated;
      })
    );
  };

  // Reconcile every customer's ordersCount, totalSpent & order list directly from OrderContext live orders
  const reconcileCustomersWithOrders = useCallback((liveOrders = []) => {
    if (!Array.isArray(liveOrders)) return;
    setCustomers((prev) => {
      let anyChanged = false;
      const next = prev.map((cust) => {
        const custEmail = cust.email?.trim().toLowerCase();
        const matched = liveOrders
          .filter(
            (o) =>
              o.customerId === cust.id ||
              o.customer?.id === cust.id ||
              (custEmail && o.customer?.email?.trim().toLowerCase() === custEmail)
          )
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const nextOrdersCount = matched.length;
        const nextTotalSpent = matched
          .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
          .reduce((sum, o) => sum + Number(o.grandTotal || o.amount || 0), 0);

        const prevOrders = Array.isArray(cust.orders) ? cust.orders : [];
        const ordersDiffer =
          prevOrders.length !== matched.length ||
          matched.some(
            (ord, idx) =>
              prevOrders[idx]?.id !== ord.id ||
              prevOrders[idx]?.status !== ord.status ||
              Number(prevOrders[idx]?.amount || 0) !== Number(ord.grandTotal || ord.amount || 0)
          );

        if (
          cust.ordersCount === nextOrdersCount &&
          cust.totalSpent === nextTotalSpent &&
          !ordersDiffer
        ) {
          return cust;
        }

        anyChanged = true;
        return {
          ...cust,
          ordersCount: nextOrdersCount,
          totalSpent: nextTotalSpent,
          orders: matched.map((o) => ({
            id: o.id,
            restaurant: o.restaurant || 'Foodix Kitchen',
            restaurantId: o.restaurantId || 'rest_001',
            date: o.orderDate || o.placedAt || 'Recent',
            timestamp: o.timestamp || Date.now(),
            amount: Number(o.grandTotal || o.amount || 0),
            grandTotal: Number(o.grandTotal || o.amount || 0),
            status: o.status || 'Pending',
            paymentMethod: o.paymentMethod || 'Online',
            deliveryAddress: o.deliveryAddress || o.customer?.address || cust.address,
            items: o.items || [],
          })),
        };
      });

      return anyChanged ? next : prev;
    });
  }, []);

  const liveSelectedCustomer = useMemo(() => {
    if (!selectedCustomer) return null;
    return customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer;
  }, [selectedCustomer, customers]);

  // Ensure authenticated Customer portal user has a linked profile in CustomerContext
  const ensureCustomerAccount = (authUser) => {
    if (!authUser?.email) return null;
    const normalizedEmail = authUser.email.trim().toLowerCase();
    const existing = customers.find(
      (c) => c.email?.toLowerCase() === normalizedEmail || c.id === authUser.id
    );
    if (existing) return existing;

    const newProfile = {
      id: authUser.id || `cust_user_${Date.now()}`,
      dummyId: Math.floor(Math.random() * 900) + 100,
      firstName: (authUser.name || 'Foodix').split(' ')[0],
      lastName: (authUser.name || 'Customer').split(' ').slice(1).join(' ') || '',
      fullName: authUser.name || 'Foodix Customer',
      email: normalizedEmail,
      phone: authUser.phone || '+91 98765 01234',
      username: normalizedEmail.split('@')[0],
      avatar:
        authUser.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          authUser.name || 'Customer'
        )}&background=163A2D&color=fff&bold=true`,
      gender: 'unspecified',
      age: 28,
      address: authUser.location || '100 Feet Road, Indiranagar',
      city: authUser.city || 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      company: 'Foodix Member',
      role: authUser.title || 'Foodie Club VIP',
      tier: 'VIP',
      status: 'Active',
      totalSpent: 0,
      ordersCount: 0,
      favoriteCuisine: 'Biryani & Pizza',
      registeredDate: authUser.createdAt || new Date().toISOString(),
      lastActive: 'Active now',
      orders: [],
    };

    setCustomers((prev) => {
      if (prev.some((c) => c.email?.toLowerCase() === normalizedEmail)) return prev;
      return [newProfile, ...prev];
    });
    customerService.createCustomer(newProfile);
    return newProfile;
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        filteredCustomers,
        paginatedCustomers,
        isLoading,
        isRefreshingApi,
        refreshFromDummyJson,
        stats,
        cities,
        // Search & Filters
        searchQuery,
        setSearchQuery,
        selectedStatus,
        setSelectedStatus,
        selectedGender,
        setSelectedGender,
        selectedDateRange,
        setSelectedDateRange,
        selectedCity,
        setSelectedCity,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        // Modals & Selection: View, Edit, Add, Delete, Create Order
        selectedCustomer: liveSelectedCustomer,
        setSelectedCustomer,
        openCustomerDetails,
        closeCustomerDetails,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        openEditModal,
        closeEditModal,
        isEditModalOpen,
        setIsEditModalOpen,
        updateCustomer,
        toggleBlockCustomer,
        isAddCustomerOpen,
        setIsAddCustomerOpen,
        addCustomer,
        isCreateOrderOpen,
        openCreateOrderModal,
        closeCreateOrderModal,
        recordCustomerOrder,
        syncCustomerOrderStatus,
        reconcileCustomersWithOrders,
        ensureCustomerAccount,
        openDeleteModal,
        closeDeleteModal,
        confirmDelete,
        deleteModalState,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
