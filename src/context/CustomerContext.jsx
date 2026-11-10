import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import customerService from '../services/customerService';
import { INITIAL_CUSTOMERS } from '../data/mockCustomers';
import { DashboardContext } from './DashboardContext';

const CustomerContext = createContext(null);
const STORAGE_KEY = 'foodix_customers_v2';

export function CustomerProvider({ children }) {
  const dashboard = useContext(DashboardContext) || {};
  const addActivity = dashboard.addActivity;

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
    return INITIAL_CUSTOMERS;
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

  // Initial fetch from DummyJSON Users API (visible in browser Network tab)
  useEffect(() => {
    let isMounted = true;
    const fetchApiUsers = async () => {
      setIsLoading(true);
      try {
        const dummyUsers = await customerService.fetchFromDummyJson();
        if (isMounted && dummyUsers && dummyUsers.length > 0) {
          setCustomers((prev) => {
            // Keep any user-created custom customers (ids starting with 'cust_user_')
            const userAdded = prev.filter((c) => c.id.startsWith('cust_user_'));
            return [...userAdded, ...dummyUsers];
          });
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
        setCustomers((prev) => {
          const userAdded = prev.filter((c) => c.id.startsWith('cust_user_'));
          return [...userAdded, ...liveUsers];
        });
        toast.success(`Synchronized ${liveUsers.length} customers from DummyJSON!`);
      }
    } catch (err) {
      toast.error('Failed to refresh from DummyJSON API');
    } finally {
      setIsRefreshingApi(false);
    }
  };

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All Tiers'); // 'All Tiers' | 'VIP' | 'Gold' | 'Regular'
  const [selectedStatus, setSelectedStatus] = useState('All Status'); // 'All Status' | 'Active' | 'Blocked'
  const [selectedGender, setSelectedGender] = useState('All Genders'); // 'All Genders' | 'female' | 'male'
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('Name: A-Z'); // 'Most Orders' | 'Total Spent: High to Low' | 'Name: A-Z' | 'Customer ID'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Matching Image 2: "Showing 1 – 7 of 892 customers"

  // Modals & Selected Customer: View, Edit, Add, Delete
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

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

        // Tier filter
        if (selectedTier !== 'All Tiers' && c.tier !== selectedTier) {
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
  }, [customers, searchQuery, selectedStatus, selectedGender, selectedTier, selectedCity, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedGender, selectedTier, selectedCity, sortBy]);

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
    const vip = customers.filter((c) => c.tier === 'VIP').length;
    const blocked = customers.filter((c) => c.status === 'Blocked').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.ordersCount || 0), 0);

    return {
      totalCustomers: total,
      activeCustomers: active,
      vipCustomers: vip,
      blockedCustomers: blocked,
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 350,
    };
  }, [customers]);

  // Toggle Block / Unblock Customer
  const toggleBlockCustomer = (customerId) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const nextStatus = c.status === 'Blocked' ? 'Active' : 'Blocked';
          toast.info(`Customer "${c.fullName}" is now ${nextStatus}`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
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
        selectedTier,
        setSelectedTier,
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
        // Modals & Selection: View, Edit, Add, Delete
        selectedCustomer,
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
