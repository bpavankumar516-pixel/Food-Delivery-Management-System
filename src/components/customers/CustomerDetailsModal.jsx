import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Building2,
  Calendar,
  Copy,
  Check,
  User,
  Shield,
  CreditCard,
  Store,
  Clock,
  Ban,
  CheckCircle2,
  Edit3,
  Heart,
  Briefcase,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCustomers } from '../../context/CustomerContext';
import { OrderContext } from '../../context/OrderContext';

export default function CustomerDetailsModal() {
  const {
    selectedCustomer,
    isDetailsModalOpen,
    closeCustomerDetails,
    openEditModal,
    openCreateOrderModal,
    toggleBlockCustomer,
  } = useCustomers();
  const orderCtx = React.useContext(OrderContext);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders'
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isDetailsModalOpen || !selectedCustomer) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Merge live orders from OrderContext with customer's embedded orders
  const liveCustomerOrders = orderCtx?.getOrdersForCustomer
    ? orderCtx.getOrdersForCustomer(selectedCustomer.id, selectedCustomer.email)
    : [];
  const orderMap = new Map();
  [...liveCustomerOrders, ...(selectedCustomer.orders || [])].forEach((ord) => {
    if (ord?.id && !orderMap.has(ord.id)) {
      orderMap.set(ord.id, {
        ...ord,
        amount: ord.grandTotal || ord.amount || 0,
        date: ord.date || ord.placedAt || 'Recent',
        deliveryAddress: ord.deliveryAddress || ord.customer?.address || selectedCustomer.address,
      });
    }
  });
  const orders = Array.from(orderMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const ordersCount = Math.max(selectedCustomer.ordersCount ?? 0, orders.length);
  const totalSpent = selectedCustomer.totalSpent ?? orders.reduce((s, o) => s + (o.amount || 0), 0);
  const avgOrderValue = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0;
  const isBlocked = selectedCustomer.status === 'Blocked';

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'Oct 15, 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Oct 15, 2026';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={closeCustomerDetails}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Banner Header */}
        <div className="relative bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] p-5 sm:p-6 text-white overflow-hidden">
          {/* Subtle background radial grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -right-8 -bottom-10 w-56 h-56 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeCustomerDetails}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Customer Avatar + Key Identifiers */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 relative z-10">
            {/* Avatar with Status Ring */}
            <div className="relative shrink-0">
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.fullName}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg bg-white"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedCustomer.fullName
                  )}&background=ff5722&color=fff&bold=true`;
                }}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] text-white font-bold ${
                  isBlocked ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                title={isBlocked ? 'Blocked Customer' : 'Active Customer'}
              />
            </div>

            {/* Customer Name, ID, Badges */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {selectedCustomer.fullName}
                </h3>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isBlocked
                      ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                      : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  }`}
                >
                  {isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>

              {/* Customer ID & Username */}
              <p className="text-xs text-emerald-100/80 font-medium mt-1">
                ID: <span className="font-mono font-bold text-white">#{selectedCustomer.dummyId || selectedCustomer.id}</span>
                {selectedCustomer.username && ` • @${selectedCustomer.username}`}
                {selectedCustomer.company && ` • ${selectedCustomer.company}`}
              </p>

              {/* Quick Contact Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/85 font-medium mt-2">
                {selectedCustomer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {selectedCustomer.city}
                      {selectedCustomer.state ? `, ${selectedCustomer.state}` : ''}
                    </span>
                  </span>
                )}
                {selectedCustomer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{selectedCustomer.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Customer Summary 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 text-xs">
          {/* Metric 1: Total Orders */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{ordersCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Orders placed</span>
          </div>

          {/* Metric 2: Total Spent */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Spent
            </span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">
              ₹{totalSpent.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Lifetime value</span>
          </div>

          {/* Metric 3: Avg Order Value */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Order Value
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">₹{avgOrderValue}</p>
            <span className="text-[11px] text-slate-500 font-medium">Per checkout</span>
          </div>

          {/* Metric 4: Customer Status */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Account Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBlocked ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span
                className={`font-black text-xs ${
                  isBlocked ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {selectedCustomer.status || 'Active'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Joined {formatJoinedDate(selectedCustomer.registeredDate)}
            </span>
          </div>
        </div>

        {/* 3. Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#ff5722] text-[#ff5722]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Contact Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#ff5722] text-[#ff5722]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>
        </div>

        {/* 4. Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-4">
          {activeTab === 'profile' ? (
            /* TAB 1: Complete Profile & Contact Details */
            <div className="space-y-4">
              {/* Personal Information Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs">
                  <User className="w-4 h-4 text-[#064e3b]" />
                  <span>Personal Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Full Name</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.fullName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Age & Gender</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selectedCustomer.age ? `${selectedCustomer.age} years` : 'N/A'} • {selectedCustomer.gender || 'Not specified'}
                    </span>
                  </div>

                  {/* Email with copy */}
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Email Address</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-800 truncate">{selectedCustomer.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedCustomer.email, 'Email')}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === 'Email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phone with copy */}
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Mobile Number</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-800">{selectedCustomer.phone}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedCustomer.phone, 'Phone')}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="Copy phone"
                      >
                        {copiedKey === 'Phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Details Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-[#064e3b]" />
                  <span>Delivery Address & Location</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[11px] block font-medium">Street Address</span>
                    <span className="font-bold text-slate-800">
                      {selectedCustomer.address || 'MG Road, Koramangala'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">City & State</span>
                    <span className="font-bold text-slate-800">
                      {selectedCustomer.city || 'Bengaluru'}, {selectedCustomer.state || 'Karnataka'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Postal Code</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedCustomer.postalCode || '560001'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional & Preferences Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs">
                  <Briefcase className="w-4 h-4 text-[#064e3b]" />
                  <span>Work & Food Preferences</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Company / Workplace</span>
                    <span className="font-bold text-slate-800">
                      {selectedCustomer.company || 'Self Employed'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Role / Title</span>
                    <span className="font-bold text-slate-800">
                      {selectedCustomer.role || 'Member'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Favorite Cuisine</span>
                    <span className="font-bold text-[#ff5722] flex items-center gap-1 mt-0.5">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{selectedCustomer.favoriteCuisine || 'Biryani & North Indian'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Registration Date</span>
                    <span className="font-bold text-slate-800">
                      {formatJoinedDate(selectedCustomer.registeredDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Customer Order History */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-sm text-slate-900">Order History</h4>
                  <p className="text-xs text-slate-500">
                    Total of {orders.length} past orders placed by {selectedCustomer.fullName}
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No Orders Placed Yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    This customer has not placed any food delivery orders on the platform yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 font-mono">
                            {ord.id}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            • {ord.date}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : ord.status === 'Out for Delivery'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-orange-50 text-orange-700 border border-orange-100'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <Store className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ord.restaurant}</span>
                        </div>
                        <span className="font-black text-slate-900 text-sm">₹{ord.amount}</span>
                      </div>

                      {/* Items Ordered List */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs">
                          {ord.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] text-slate-600"
                            >
                              <span>
                                {it.qty}x {it.name}
                              </span>
                              <span className="font-semibold text-slate-800">
                                ₹{it.price * it.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Payment: {ord.paymentMethod || 'UPI / Online'}</span>
                        <span className="truncate max-w-[220px] text-right">
                          To: {ord.deliveryAddress || selectedCustomer.address}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Modal Footer: Clean Management Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {/* Left Action: Block or Unblock Customer */}
          <button
            type="button"
            onClick={() => toggleBlockCustomer(selectedCustomer.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              isBlocked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {isBlocked ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unblock Customer</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Block Customer</span>
              </>
            )}
          </button>

          {/* Right Actions: Place Order, Edit & Close */}
          <div className="flex items-center gap-2">
            {openCreateOrderModal && !isBlocked && (
              <button
                type="button"
                onClick={() => {
                  const target = selectedCustomer;
                  closeCustomerDetails();
                  openCreateOrderModal(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Place Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const target = selectedCustomer;
                closeCustomerDetails();
                openEditModal(target);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5722] text-xs font-bold transition-colors cursor-pointer border border-orange-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Customer</span>
            </button>

            <button
              type="button"
              onClick={closeCustomerDetails}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
