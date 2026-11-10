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
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useOrders } from '../context/OrderContext';

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    orders,
    stats,
    updateOrderStatus,
    acceptOrder,
    rejectOrder,
    cancelOrder,
    advanceOrderStatus,
  } = useOrders();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [restaurantFilter, setRestaurantFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount-high' | 'amount-low'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Restaurant kitchen capacity full');

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
          o.customer?.phone?.includes(q) ||
          o.restaurant?.toLowerCase().includes(q) ||
          o.items?.some((i) => i.name?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'All') {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (restaurantFilter !== 'All') {
      list = list.filter((o) => o.restaurant === restaurantFilter);
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
  }, [orders, searchQuery, statusFilter, restaurantFilter, sortBy]);

  // Pagination Slice
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Unique restaurants for filter
  const uniqueRestaurants = useMemo(() => {
    const set = new Set(orders.map((o) => o.restaurant).filter(Boolean));
    return Array.from(set);
  }, [orders]);

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

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-6">
          {/* Top Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] p-6 sm:p-7 text-white shadow-xl overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/15 blur-2xl" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-emerald-300">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Order Operations & Live Dispatch
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                  Zomato/Swiggy-inspired restaurant order lifecycle: accept/reject incoming tickets, update preparation phases, coordinate rider dispatch, and inspect customer invoices.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right">
                  <p className="text-[10px] uppercase font-bold text-emerald-300">Eligible Fulfillments</p>
                  <p className="text-lg sm:text-xl font-black text-white">
                    ₹{stats.eligibleRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Order Pipeline KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { id: 'All', label: 'All Orders', count: stats.total, color: 'text-slate-900', bg: 'bg-slate-50' },
              { id: 'Pending', label: 'New / Pending', count: stats.pending, color: 'text-amber-800', bg: 'bg-amber-50' },
              { id: 'Confirmed', label: 'Confirmed', count: stats.confirmed, color: 'text-indigo-800', bg: 'bg-indigo-50' },
              { id: 'Preparing', label: 'In Kitchen', count: stats.preparing, color: 'text-orange-800', bg: 'bg-orange-50' },
              { id: 'Ready for Pickup', label: 'Ready Bagged', count: stats.readyForPickup, color: 'text-purple-800', bg: 'bg-purple-50' },
              { id: 'Out for Delivery', label: 'Out with Rider', count: stats.outForDelivery, color: 'text-sky-800', bg: 'bg-sky-50' },
              { id: 'Delivered', label: 'Delivered', count: stats.delivered, color: 'text-emerald-800', bg: 'bg-emerald-50' },
              { id: 'Cancelled', label: 'Cancelled', count: stats.cancelled + stats.rejected, color: 'text-rose-800', bg: 'bg-rose-50' },
            ].map((p) => {
              const isActive = statusFilter === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(p.id);
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#064e3b] shadow-md ring-2 ring-[#064e3b]/15'
                      : `${p.bg} border-slate-200/80 hover:border-slate-300`
                  }`}
                >
                  <p className={`text-xl sm:text-2xl font-black ${p.color}`}>{p.count}</p>
                  <p className="text-[10px] font-bold text-slate-600 truncate mt-0.5">{p.label}</p>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order ID (#FDX...), customer name, mobile, restaurant, or item..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Status & Restaurant Filter Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {uniqueRestaurants.length > 0 && (
                  <select
                    value={restaurantFilter}
                    onChange={(e) => {
                      setRestaurantFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer max-w-[170px] truncate"
                  >
                    <option value="All">All Restaurants</option>
                    {uniqueRestaurants.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="newest">Newest Orders</option>
                  <option value="oldest">Oldest Orders</option>
                  <option value="amount-high">Amount: High to Low</option>
                  <option value="amount-low">Amount: Low to High</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto -mx-4 sm:-mx-5">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#fcfbf9] text-slate-700 uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Restaurant</th>
                    <th className="py-4 px-4">Items Summary</th>
                    <th className="py-4 px-4 text-left">Grand Total</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-400">
                        <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                        <p className="font-bold text-slate-600">No orders found</p>
                        <p className="text-xs">Try resetting your search query or status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      const BadgeIcon = badge.icon;

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Order ID & Time */}
                          <td className="py-3.5 px-5">
                            <span className="font-black text-slate-900 block text-xs">{order.id}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {order.placedAt || 'Today'}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-slate-900">{order.customer?.name}</p>
                              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {order.customer?.phone}
                              </p>
                            </div>
                          </td>

                          {/* Restaurant */}
                          <td className="py-3.5 px-4 font-bold text-[#064e3b]">
                            {order.restaurant}
                          </td>

                          {/* Items summary */}
                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 max-w-[200px] truncate font-medium">
                              {order.items?.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {order.items?.length || 1} distinct item{(order.items?.length || 1) > 1 ? 's' : ''}
                            </span>
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            ₹{(order.grandTotal || order.amount || 0).toLocaleString()}
                          </td>

                          {/* Payment Method & Status */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-700 block text-[11px]">
                              {order.paymentMethod || 'Online'}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                order.paymentStatus === 'Paid'
                                  ? 'text-emerald-600'
                                  : order.paymentStatus === 'Refunded'
                                  ? 'text-rose-500'
                                  : 'text-amber-600'
                              }`}
                            >
                              ● {order.paymentStatus || 'Paid'}
                            </span>
                          </td>

                          {/* Status */}
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
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="w-8 h-8 rounded-lg bg-[#053b2c] hover:bg-[#074d39] text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Inspect Order & Delivery Timeline"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Print Invoice */}
                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff5722] border border-orange-200 flex items-center justify-center transition-colors cursor-pointer"
                                title="Generate & Print Invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Pending State: Accept or Reject Buttons */}
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
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                    title="Reject Order"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Pipeline Advancement Button */}
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

                              {/* Cancel Button */}
                              {order.status !== 'Delivered' &&
                                order.status !== 'Cancelled' &&
                                order.status !== 'Rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => setCancelModalOrder(order)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Cancel Order with Reason"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Count */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} –{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer ${
                          currentPage === pageNum
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
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Order Details & Timestamped History Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700">Order Inspection</span>
                <h3 className="text-xl font-black text-slate-900">{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Restaurant Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Customer</p>
                <p className="font-bold text-slate-900">{selectedOrder.customer?.name}</p>
                <p className="text-slate-500">{selectedOrder.customer?.phone}</p>
                <p className="text-slate-600 font-medium line-clamp-2">{selectedOrder.customer?.address}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Merchant & Delivery</p>
                <p className="font-bold text-[#064e3b]">{selectedOrder.restaurant}</p>
                <p className="text-slate-500">Rider: {selectedOrder.deliveryPartner || 'Assigning rider'}</p>
                <p className="text-slate-600 font-medium">ETA: {selectedOrder.estimatedDeliveryTime || '30 mins'}</p>
              </div>
            </div>

            {/* Special Instructions if present */}
            {selectedOrder.specialInstructions && (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">Cooking & Delivery Instructions:</span>
                <span>{selectedOrder.specialInstructions}</span>
              </div>
            )}

            {/* Ordered Food Items */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Ordered Dishes</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
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

            {/* Price Breakdown Calculation */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold">₹{selectedOrder.subtotal || selectedOrder.amount}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#ff5722] font-semibold">
                  <span>Coupon Discount ({selectedOrder.couponCode || 'Promo'})</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>₹{selectedOrder.deliveryFee || 40}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Food Services Tax (5%)</span>
                <span>₹{selectedOrder.tax || 35}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-emerald-950">
                <span>Grand Total</span>
                <span>₹{(selectedOrder.grandTotal || selectedOrder.amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Timestamped Status History */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Status History</span>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                {selectedOrder.history?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {h.status} <span className="text-[10px] text-slate-400 font-normal">at {h.timestamp}</span>
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
                onClick={() => setInvoiceOrder(selectedOrder)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              {['Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(selectedOrder.status) && (
                <button
                  type="button"
                  onClick={() => {
                    advanceOrderStatus(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
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

      {/* Reject Order Modal with Reason */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-base">Reject Incoming Order?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Order {rejectModalOrder.id} will be rejected and the customer will be notified immediately.
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Rejection Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Restaurant kitchen capacity full">Restaurant kitchen capacity full</option>
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

      {/* Cancel Order Modal with Reason */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-base">Cancel Order {cancelModalOrder.id}?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Please specify the reason for cancelling this active order. Refund will be initiated if already paid.
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
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

            {/* Thermal Slip Simulation */}
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
                  <span>₹{invoiceOrder.tax || 35}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{invoiceOrder.deliveryFee || 40}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-slate-300 pt-1">
                  <span>GRAND TOTAL</span>
                  <span>₹{(invoiceOrder.grandTotal || invoiceOrder.amount).toLocaleString()}</span>
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
    </div>
  );
}
