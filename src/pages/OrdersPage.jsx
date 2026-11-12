import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  ArrowRight,
  Printer,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  PackageCheck,
  Ban,
  Check,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  IndianRupee,
  MapPin,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import PlaceOrderModal from '../components/orders/PlaceOrderModal';
import CustomerDetailsModal from '../components/customers/CustomerDetailsModal';
import EditCustomerModal from '../components/customers/EditCustomerModal';
import DeleteCustomerConfirmModal from '../components/customers/DeleteCustomerConfirmModal';
import CreateCustomerOrderModal from '../components/customers/CreateCustomerOrderModal';
import { useOrders } from '../context/OrderContext';
import { useCustomers } from '../context/CustomerContext';

const PIPELINE_STEPS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
];

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    orders,
    stats,
    isLoading,
    isSyncingApi,
    lastSyncedAt,
    searchQuery,
    setSearchQuery,
    refreshOrdersFromApi,
    acceptOrder,
    rejectOrder,
    cancelOrder,
    advanceOrderStatus,
  } = useOrders();

  const { customers, openCustomerDetails } = useCustomers();

  // Filter, View & Pagination State
  const [statusFilter, setStatusFilter] = useState('All');
  const [restaurantFilter, setRestaurantFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 9 : 8;

  // Modal States
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation due to address change');
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Restaurant kitchen capacity full');

  // Open linked Customer Profile modal using live CustomerContext record
  const handleInspectCustomer = (order) => {
    const matched = customers.find(
      (c) =>
        c.id === (order.customerId || order.customer?.id) ||
        (order.customer?.email && c.email?.toLowerCase() === order.customer.email.toLowerCase())
    );
    if (matched) {
      openCustomerDetails(matched);
    } else {
      toast.info('Customer profile is synced with guest checkout details.');
    }
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.rawId?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          o.customer?.city?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q) ||
          o.restaurant?.toLowerCase().includes(q) ||
          o.items?.some((i) => i.name?.toLowerCase().includes(q))
      );
    }

    if (statusFilter === 'Active') {
      list = list.filter((o) =>
        ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
      );
    } else if (statusFilter !== 'All') {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (restaurantFilter !== 'All') {
      list = list.filter((o) => o.restaurant === restaurantFilter);
    }

    if (customerFilter !== 'All') {
      list = list.filter(
        (o) => o.customerId === customerFilter || o.customer?.id === customerFilter
      );
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else if (sortBy === 'amount-high') {
      list.sort((a, b) => (b.grandTotal || b.amount || 0) - (a.grandTotal || a.amount || 0));
    } else if (sortBy === 'amount-low') {
      list.sort((a, b) => (a.grandTotal || a.amount || 0) - (b.grandTotal || b.amount || 0));
    }

    return list;
  }, [orders, searchQuery, statusFilter, restaurantFilter, customerFilter, sortBy]);

  // Pagination Slice
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, safePage, itemsPerPage]);

  // Unique restaurants & linked customers for filter dropdowns
  const uniqueRestaurants = useMemo(() => {
    const set = new Set(orders.map((o) => o.restaurant).filter(Boolean));
    return Array.from(set).sort();
  }, [orders]);

  const linkedCustomers = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const id = o.customerId || o.customer?.id;
      if (id && o.customer?.name && !map.has(id)) {
        map.set(id, { id, name: o.customer.name, city: o.customer.city });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  // Export CSV matching CustomersPage & ReportsPage
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.warn('No orders match the current filter to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'City',
      'Restaurant',
      'Items',
      'Grand Total (INR)',
      'Payment Method',
      'Status',
      'Source',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.customer?.name || ''}"`,
      o.customer?.email || '',
      `"${o.customer?.city || ''}"`,
      `"${o.restaurant || ''}"`,
      `"${(o.items || []).map((i) => `${i.name} x${i.qty}`).join('; ')}"`,
      o.grandTotal || o.amount || 0,
      `"${o.paymentMethod || 'Online'}"`,
      o.status,
      `"${o.source || 'API'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `foodix_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredOrders.length} orders to CSV!`);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    cancelOrder(cancelModalOrder.id, cancelReason);
    setCancelModalOrder(null);
    if (selectedOrder?.id === cancelModalOrder.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectModalOrder) return;
    rejectOrder(rejectModalOrder.id, rejectReason);
    setRejectModalOrder(null);
    if (selectedOrder?.id === rejectModalOrder.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'Rejected' } : null));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'Confirmed':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          icon: CheckCircle2,
        };
      case 'Preparing':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
          icon: Clock,
        };
      case 'Ready for Pickup':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          icon: PackageCheck,
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          icon: Truck,
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'Cancelled':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      case 'Rejected':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: Ban,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: AlertCircle,
        };
    }
  };

  // Sync live selectedOrder object if orders updated
  const activeSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) || selectedOrder;
  }, [orders, selectedOrder]);

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-5">
          {/* 1. Top Pastel Hero Banner (Consistent with CustomersPage, MenuManagementPage & CouponsPage) */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#fef8f0] via-[#fffbf6] to-[#f2f7ef] border border-orange-100/80 p-5 sm:p-6 overflow-hidden shadow-2xs">
            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/15">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e22] tracking-tight">
                      Orders & Live Dispatch
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-[#064e3b] border border-emerald-200 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>API Live • {stats.uniqueCustomersCount || customers.length} Customers Linked</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Dynamic orders synced from live API & customer records — inspect placed orders, track kitchen stages, and dispatch riders.
                    {lastSyncedAt && (
                      <span className="text-emerald-700 font-semibold ml-1.5">
                        (Synced at {lastSyncedAt})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Side Summary + Primary Place Order CTA */}
              <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                <div className="px-4 py-2 rounded-2xl bg-white/90 border border-emerald-200/70 shadow-2xs text-left sm:text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Eligible Order Value
                  </p>
                  <p className="text-lg font-black text-[#064e3b] leading-tight">
                    ₹{stats.eligibleRevenue.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlaceOrderOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#e64a19] hover:to-[#ff5722] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Place New Order</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Five Compact KPI Stat Cards (Matching CustomersPage Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {[
              {
                id: 'All',
                label: 'Total Orders',
                value: stats.total,
                badge: 'All Live',
                badgeColor: 'text-emerald-700 bg-emerald-100/60',
                icon: ShoppingBag,
                iconBg: 'bg-[#064e3b]',
                activeRing: 'bg-[#eaf5ef] border-emerald-300 ring-2 ring-emerald-500/20',
                valColor: 'text-slate-900',
              },
              {
                id: 'Pending',
                label: 'New / Pending',
                value: stats.pending,
                badge: 'Action Needed',
                badgeColor: 'text-amber-700 bg-amber-100/70',
                icon: Clock,
                iconBg: 'bg-[#ff5722]',
                activeRing: 'bg-[#fff4eb] border-orange-300 ring-2 ring-orange-500/20',
                valColor: 'text-amber-700',
              },
              {
                id: 'Active',
                label: 'In Kitchen & Transit',
                value: stats.active,
                badge: 'Live Flow',
                badgeColor: 'text-sky-700 bg-sky-100/70',
                icon: Truck,
                iconBg: 'bg-[#2563eb]',
                activeRing: 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20',
                valColor: 'text-sky-700',
              },
              {
                id: 'Delivered',
                label: 'Delivered Orders',
                value: stats.delivered,
                badge: 'Completed',
                badgeColor: 'text-emerald-700 bg-emerald-100/60',
                icon: CheckCircle2,
                iconBg: 'bg-[#097956]',
                activeRing: 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20',
                valColor: 'text-emerald-700',
              },
              {
                id: 'Revenue',
                label: 'Fulfilled Revenue',
                value: `₹${stats.eligibleRevenue.toLocaleString()}`,
                badge: `${stats.cancelled + stats.rejected} Cancelled`,
                badgeColor: 'text-rose-600 bg-rose-100/60',
                icon: IndianRupee,
                iconBg: 'bg-[#ea580c]',
                activeRing: 'bg-white border-slate-200/90',
                valColor: 'text-emerald-700',
                isStatic: true,
              },
            ].map((card) => {
              const Icon = card.icon;
              const isSelected = !card.isStatic && statusFilter === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    if (card.isStatic) return;
                    setStatusFilter(card.id);
                    setCurrentPage(1);
                  }}
                  className={`p-3 sm:p-3.5 rounded-2xl border shadow-2xs transition-all ${
                    card.isStatic ? '' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? card.activeRing
                      : 'bg-white hover:bg-slate-50 border-slate-200/90'
                  } ${card.id === 'Revenue' ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-lg ${card.iconBg} text-white flex items-center justify-center shadow-xs`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className={`text-xl sm:text-2xl font-black leading-tight ${card.valColor}`}>
                      {card.value}
                    </p>
                    <p className="text-[11px] font-bold text-slate-600 mt-0.5 truncate">
                      {card.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Pipeline Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'All', label: 'All Orders', count: stats.total },
              { id: 'Pending', label: 'Pending', count: stats.pending },
              { id: 'Confirmed', label: 'Confirmed', count: stats.confirmed },
              { id: 'Preparing', label: 'Preparing', count: stats.preparing },
              { id: 'Ready for Pickup', label: 'Ready Bagged', count: stats.readyForPickup },
              { id: 'Out for Delivery', label: 'Out for Delivery', count: stats.outForDelivery },
              { id: 'Delivered', label: 'Delivered', count: stats.delivered },
              { id: 'Cancelled', label: 'Cancelled', count: stats.cancelled },
              { id: 'Rejected', label: 'Rejected', count: stats.rejected },
            ].map((pill) => {
              const active = statusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(pill.id);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-slate-900'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. Filter, Search, View Switcher & API Sync Bar (Matching CustomersPage & MenuManagementPage) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by #FDX ID, customer name, email, city, restaurant, or dish..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Filter Dropdowns & Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Customer Filter */}
                <select
                  value={customerFilter}
                  onChange={(e) => {
                    setCustomerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer max-w-[175px] truncate"
                >
                  <option value="All">All Customers ({linkedCustomers.length})</option>
                  {linkedCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.city ? `(${c.city})` : ''}
                    </option>
                  ))}
                </select>

                {/* Restaurant Filter */}
                <select
                  value={restaurantFilter}
                  onChange={(e) => {
                    setRestaurantFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer max-w-[160px] truncate"
                >
                  <option value="All">All Restaurants</option>
                  {uniqueRestaurants.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="newest">Newest Orders</option>
                  <option value="oldest">Oldest Orders</option>
                  <option value="amount-high">Amount: High to Low</option>
                  <option value="amount-low">Amount: Low to High</option>
                </select>

                {/* Table / Grid Toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('table');
                      setCurrentPage(1);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-[#064e3b] shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('grid');
                      setCurrentPage(1);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#064e3b] shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#ff5722] text-[#ff5722] hover:bg-orange-50 font-bold text-xs transition-colors cursor-pointer"
                  title="Export filtered orders to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                {/* Sync Live API Button */}
                <button
                  type="button"
                  onClick={refreshOrdersFromApi}
                  disabled={isSyncingApi}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Sync Live Orders from DummyJSON & Customer API"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncingApi ? 'animate-spin text-emerald-600' : ''}`}
                  />
                  <span className="hidden sm:inline">Sync API</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Main Orders Content (Loading / Empty / Table View / Card Grid View) */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs">
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800">
                Fetching live orders & linking customer profiles from API...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Synchronizing /api/orders, DummyJSON Carts, and Customer Records
              </p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <ShoppingBag className="w-11 h-11 mx-auto text-slate-300 stroke-1" />
              <div>
                <p className="font-bold text-slate-800">No matching orders found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing your filters or place a new order for a customer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setRestaurantFilter('All');
                  setCustomerFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW (Aligned with CustomerTableView.jsx) */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#fcfbf9] text-slate-700 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-5">Order ID</th>
                      <th className="py-4 px-4">Customer (Live Profile)</th>
                      <th className="py-4 px-4">Restaurant</th>
                      <th className="py-4 px-4">Ordered Items</th>
                      <th className="py-4 px-4">Total & Coupon</th>
                      <th className="py-4 px-4">Payment</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      const BadgeIcon = badge.icon;
                      const isBlockedCust = order.customer?.status === 'Blocked';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Order ID & Source */}
                          <td className="py-3.5 px-5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="font-black text-slate-900 hover:text-[#ff5722] block text-xs cursor-pointer transition-colors"
                            >
                              {order.id}
                            </button>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {order.placedAt || 'Today'}
                            </span>
                            {order.source && (
                              <span className="inline-block mt-1 px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">
                                {order.source}
                              </span>
                            )}
                          </td>

                          {/* Customer with Avatar, Tier, City & Click-to-Inspect */}
                          <td className="py-3.5 px-4">
                            <div
                              onClick={() => handleInspectCustomer(order)}
                              className="flex items-center gap-3 cursor-pointer group"
                              title="Click to view full customer profile & order history"
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={order.customer?.avatar}
                                  alt={order.customer?.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      order.customer?.name || 'Customer'
                                    )}&background=ff5722&color=fff&bold=true`;
                                  }}
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                    isBlockedCust ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 group-hover:text-[#ff5722] transition-colors truncate max-w-[130px]">
                                    {order.customer?.name}
                                  </span>
                                  {order.customer?.tier && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                                        order.customer.tier === 'VIP'
                                          ? 'bg-amber-100 text-amber-800'
                                          : order.customer.tier === 'Gold'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {order.customer.tier}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-slate-500 truncate max-w-[165px]">
                                  {order.customer?.city || 'Bengaluru'} • {order.customer?.phone}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Restaurant */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#064e3b] block">{order.restaurant}</span>
                            <span className="text-[10px] text-slate-400">
                              ETA: {order.estimatedDeliveryTime || '25 mins'}
                            </span>
                          </td>

                          {/* Items Summary */}
                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 max-w-[190px] truncate font-medium">
                              {order.items?.map((i) => `${i.name} (×${i.qty})`).join(', ')}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {order.items?.length || 1} distinct item{(order.items?.length || 1) > 1 ? 's' : ''}
                            </span>
                          </td>

                          {/* Total & Coupon */}
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{(order.grandTotal || order.amount || 0).toLocaleString()}
                            </span>
                            {order.couponCode && (
                              <span className="text-[10px] font-bold text-[#ff5722]">
                                {order.couponCode} (-₹{order.discount || 0})
                              </span>
                            )}
                          </td>

                          {/* Payment */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-700 block text-[11px]">
                              {order.paymentMethod || 'Online'}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                order.paymentStatus === 'Paid'
                                  ? 'text-emerald-600'
                                  : order.paymentStatus === 'Refunded' || order.paymentStatus === 'Voided'
                                  ? 'text-rose-500'
                                  : 'text-amber-600'
                              }`}
                            >
                              ● {order.paymentStatus || 'Paid'}
                            </span>
                          </td>

                          {/* Status Pill */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <BadgeIcon className="w-3.5 h-3.5" />
                              <span>{order.status}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="w-8 h-8 rounded-lg bg-[#053b2c] hover:bg-[#074d39] text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Inspect Order & Pipeline"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff5722] border border-orange-200 flex items-center justify-center transition-colors cursor-pointer"
                                title="Generate & Print Invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {order.status === 'Pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => acceptOrder(order.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                    title="Accept Order"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectModalOrder(order)}
                                    className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                                    title="Reject Order"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(
                                order.status
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => advanceOrderStatus(order.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                  title={`Advance from ${order.status}`}
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              {order.status !== 'Delivered' &&
                                order.status !== 'Cancelled' &&
                                order.status !== 'Rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => setCancelModalOrder(order)}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Cancel Order with Reason"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRID / CARD VIEW (Aligned with CustomerCard.jsx & CouponsPage) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                const stepIndex = PIPELINE_STEPS.indexOf(order.status);
                const progressPct =
                  stepIndex >= 0 ? Math.round(((stepIndex + 1) / PIPELINE_STEPS.length) * 100) : 0;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Header: Order ID + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{order.id}</span>
                          {order.source && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {order.source}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {order.placedAt || 'Today'} • {order.restaurant}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{order.status}</span>
                      </span>
                    </div>

                    {/* Linked Live Customer Card */}
                    <div
                      onClick={() => handleInspectCustomer(order)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 cursor-pointer transition-colors"
                    >
                      <img
                        src={order.customer?.avatar}
                        alt={order.customer?.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            order.customer?.name || 'Customer'
                          )}&background=ff5722&color=fff&bold=true`;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {order.customer?.name}
                          </p>
                          {order.customer?.tier && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                              {order.customer.tier}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{order.customer?.city || 'Bengaluru'}</span>
                          <span>•</span>
                          <span>{order.customer?.ordersCount || 1} orders</span>
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>

                    {/* Items + Progress */}
                    <div className="space-y-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-orange-50/70 border border-orange-100 text-[11px] font-semibold text-slate-700"
                          >
                            {item.qty}× {item.name}
                          </span>
                        ))}
                      </div>

                      {stepIndex >= 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Dispatch Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#064e3b] to-[#10b981] rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Total & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {order.paymentMethod}
                        </span>
                        <span className="text-base font-black text-slate-900">
                          ₹{(order.grandTotal || order.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-xl bg-[#053b2c] hover:bg-[#074d39] text-white cursor-pointer"
                          title="Inspect Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5722] border border-orange-200 cursor-pointer"
                          title="Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {order.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => acceptOrder(order.id)}
                            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                        {['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(
                          order.status
                        ) && (
                          <button
                            type="button"
                            onClick={() => advanceOrderStatus(order.id)}
                            className="px-3 py-2 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-bold text-[11px] cursor-pointer flex items-center gap-1"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 6. Pagination Footer (Matching CustomersPage) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 pb-4">
            <span className="text-xs text-slate-600 font-medium">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {totalItems > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              –{' '}
              <span className="font-bold text-slate-900">
                {Math.min(safePage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{totalItems}</span> orders
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer ${
                        safePage === pageNum
                          ? 'bg-[#ff5722] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Details, Live Customer Profile & Pipeline Stepper Modal */}
      {activeSelectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-emerald-700">
                    Order Inspection
                  </span>
                  {activeSelectedOrder.source && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {activeSelectedOrder.source}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {activeSelectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Operational Pipeline Stepper */}
            {PIPELINE_STEPS.includes(activeSelectedOrder.status) && (
              <div className="p-3.5 rounded-2xl bg-[#fcfbf9] border border-slate-200/80">
                <div className="grid grid-cols-6 gap-1 text-center">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const currentIdx = PIPELINE_STEPS.indexOf(activeSelectedOrder.status);
                    const done = idx <= currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                            done
                              ? 'bg-[#064e3b] text-white shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {done ? <Check className="w-3 h-3" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[9px] font-bold leading-tight ${
                            done ? 'text-[#064e3b]' : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Customer & Restaurant Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Linked Customer Profile
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const ord = activeSelectedOrder;
                      setSelectedOrder(null);
                      handleInspectCustomer(ord);
                    }}
                    className="text-[10px] font-bold text-[#ff5722] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={activeSelectedOrder.customer?.avatar}
                    alt={activeSelectedOrder.customer?.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        activeSelectedOrder.customer?.name || 'Customer'
                      )}&background=ff5722&color=fff&bold=true`;
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {activeSelectedOrder.customer?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeSelectedOrder.customer?.email}
                    </p>
                  </div>
                </div>

                <div className="pt-1 space-y-1 text-[11px] text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#064e3b]" />
                    <span>{activeSelectedOrder.customer?.phone}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-[#064e3b] mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{activeSelectedOrder.customer?.address}</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold">
                      {activeSelectedOrder.customer?.ordersCount || 1} total orders
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      ₹{(activeSelectedOrder.customer?.totalSpent || 0).toLocaleString()} spent
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Merchant & Rider Dispatch
                </p>
                <p className="font-bold text-sm text-[#064e3b]">
                  {activeSelectedOrder.restaurant}
                </p>
                <p className="text-slate-600">
                  Rider:{' '}
                  <span className="font-semibold text-slate-800">
                    {activeSelectedOrder.deliveryPartner || 'Assigning rider'}
                  </span>
                </p>
                <p className="text-slate-600 font-medium">
                  ETA: {activeSelectedOrder.estimatedDeliveryTime || '30 mins'}
                </p>
                <p className="text-slate-600 font-medium">
                  Payment: {activeSelectedOrder.paymentMethod} ({activeSelectedOrder.paymentStatus})
                </p>
              </div>
            </div>

            {activeSelectedOrder.specialInstructions && (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">Cooking & Delivery Instructions:</span>
                <span>{activeSelectedOrder.specialInstructions}</span>
              </div>
            )}

            {/* Ordered Dishes */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Ordered Dishes</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {activeSelectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.instructions && (
                        <p className="text-[11px] text-amber-700 italic">{item.instructions}</p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">
                      ₹{((item.price || 0) * (item.qty || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold">
                  ₹{activeSelectedOrder.subtotal || activeSelectedOrder.amount}
                </span>
              </div>
              {activeSelectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#ff5722] font-semibold">
                  <span>Coupon Discount ({activeSelectedOrder.couponCode || 'Promo'})</span>
                  <span>-₹{activeSelectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>₹{activeSelectedOrder.deliveryFee ?? 35}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Food Services Tax (5%)</span>
                <span>₹{activeSelectedOrder.tax ?? 30}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-emerald-950">
                <span>Grand Total</span>
                <span>
                  ₹{(activeSelectedOrder.grandTotal || activeSelectedOrder.amount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status History */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Status History</span>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                {activeSelectedOrder.history?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {h.status}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          at {h.timestamp}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">{h.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceOrder(activeSelectedOrder)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              {activeSelectedOrder.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => acceptOrder(activeSelectedOrder.id)}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Order</span>
                </button>
              )}

              {['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(
                activeSelectedOrder.status
              ) && (
                <button
                  type="button"
                  onClick={() => advanceOrderStatus(activeSelectedOrder.id)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
                >
                  <span>Advance Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-base">Reject Incoming Order?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Order {rejectModalOrder.id} for {rejectModalOrder.customer?.name} will be rejected.
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Rejection Reason
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Restaurant kitchen capacity full">
                    Restaurant kitchen capacity full
                  </option>
                  <option value="One or more ordered ingredients out of stock">
                    One or more ordered ingredients out of stock
                  </option>
                  <option value="Merchant closing early today">Merchant closing early today</option>
                  <option value="High backlog / rider unavailability in sector">
                    High backlog / rider unavailability in sector
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-base">
                Cancel Order {cancelModalOrder.id}?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Specify the cancellation reason for {cancelModalOrder.customer?.name}. Refund will be initiated if paid.
              </p>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Customer requested cancellation due to address change">
                    Customer requested cancellation due to address change
                  </option>
                  <option value="Delivery partner unable to reach customer contact">
                    Delivery partner unable to reach customer contact
                  </option>
                  <option value="Customer placed duplicate order by mistake">
                    Customer placed duplicate order by mistake
                  </option>
                  <option value="Severe weather / localized road obstruction">
                    Severe weather / localized road obstruction
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Cancel Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setInvoiceOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Food Delivery Tax Invoice</h3>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5">
                <p className="font-bold text-sm tracking-wider">FOODIX ONLINE DELIVERY</p>
                <p className="text-[10px] text-slate-500">Delicious Food, Delivered</p>
                <p className="text-[10px] text-slate-400">Order ID: {invoiceOrder.id}</p>
                <p className="text-[9px] text-slate-400">GSTIN: 29ABCDE1234F1Z5</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">{invoiceOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{invoiceOrder.customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="font-bold">{invoiceOrder.restaurant}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">{invoiceOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold">{invoiceOrder.paymentMethod || 'Online'}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                {invoiceOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {item.name} ×{item.qty || 1}
                    </span>
                    <span className="font-bold">
                      ₹{((item.price || 0) * (item.qty || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoiceOrder.subtotal || invoiceOrder.amount}</span>
                </div>
                {invoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Discount:</span>
                    <span>-₹{invoiceOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>₹{invoiceOrder.tax ?? 30}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{invoiceOrder.deliveryFee ?? 35}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-slate-300 pt-1">
                  <span>GRAND TOTAL</span>
                  <span>
                    ₹{(invoiceOrder.grandTotal || invoiceOrder.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-center text-slate-400 pt-1">
                Thank you for ordering with Foodix!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-2xl bg-[#064e3b] text-white font-bold text-xs hover:bg-[#043d2e] cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Tax invoice downloaded as PDF');
                  setInvoiceOrder(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place New Order Modal */}
      <PlaceOrderModal isOpen={isPlaceOrderOpen} onClose={() => setIsPlaceOrderOpen(false)} />

      {/* Customer Inspection & Editing Modals (Seamless Two-Way Link with Customers Page) */}
      <CustomerDetailsModal />
      <EditCustomerModal />
      <DeleteCustomerConfirmModal />
      <CreateCustomerOrderModal />
    </div>
  );
}
