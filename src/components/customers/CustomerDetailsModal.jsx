import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Building2,
  Calendar,
  KeyRound,
  Copy,
  Check,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCustomers } from '../../context/CustomerContext';

export default function CustomerDetailsModal() {
  const {
    selectedCustomer,
    isDetailsModalOpen,
    closeCustomerDetails,
    openCreateOrderModal,
    loginToCustomerPortal,
  } = useCustomers();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'credentials'
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isDetailsModalOpen || !selectedCustomer) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const orders = selectedCustomer.orders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Cover & Avatar */}
        <div className="relative bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] p-6 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <button
            type="button"
            onClick={closeCustomerDetails}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 relative z-10">
            <div className="relative shrink-0">
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.fullName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg bg-white"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedCustomer.fullName
                  )}&background=ff5722&color=fff&bold=true`;
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {selectedCustomer.fullName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-emerald-200 border border-white/20">
                  {selectedCustomer.tier} Member
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                @{selectedCustomer.username} • {selectedCustomer.role || 'Member'} at{' '}
                {selectedCustomer.company || 'Foodix Customer'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/80 font-medium mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{selectedCustomer.phone}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-slate-50/70">
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
            <span>Orders & History ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'credentials'
                ? 'border-[#ff5722] text-[#ff5722]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Portal Credentials & Info</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-4">
          {activeTab === 'orders' ? (
            /* Tab 1: Orders History */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Customer Orders</h4>
                  <p className="text-xs text-slate-500">
                    Lifetime value: <span className="font-black text-emerald-700">₹{(selectedCustomer.totalSpent || 0).toLocaleString()}</span> across {selectedCustomer.ordersCount || 0} orders
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateOrderModal(selectedCustomer)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] text-white font-bold text-xs shadow-xs hover:from-[#f44e19] hover:to-[#ff5722] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Place New Order</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No Orders Yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    This customer hasn't placed any orders yet. Click "Place New Order" to create one.
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
                          <span className="font-black text-xs text-slate-900">{ord.id}</span>
                          <span className="text-[11px] text-slate-400 font-medium">• {ord.date}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'Out for Delivery'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
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

                      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>
                              {it.qty}x {it.name}
                            </span>
                            <span className="font-semibold text-slate-800">₹{it.price * it.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Payment: {ord.paymentMethod}</span>
                        <span className="truncate max-w-[200px] text-right">To: {ord.deliveryAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: DummyJSON Portal Credentials & Identity */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Customer Portal Credentials (DummyJSON)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loginToCustomerPortal(selectedCustomer)}
                    className="px-3 py-1.5 rounded-xl bg-[#064e3b] text-white font-bold text-xs hover:bg-[#043d2e] cursor-pointer shadow-xs"
                  >
                    Launch Portal View
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Username</p>
                      <p className="font-bold text-slate-900 font-mono mt-0.5">{selectedCustomer.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedCustomer.username, 'Username')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Copy Username"
                    >
                      {copiedKey === 'Username' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Password</p>
                      <p className="font-bold text-slate-900 font-mono mt-0.5">
                        {showPassword ? selectedCustomer.password : '••••••••••••'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedCustomer.password, 'Password')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedKey === 'Password' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Address & Profile Specifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h5 className="font-bold text-slate-800">Profile & Delivery Address Details</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Full Address</span>
                    <span className="font-semibold text-slate-800">{selectedCustomer.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">City & State</span>
                    <span className="font-semibold text-slate-800">
                      {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.postalCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Company</span>
                    <span className="font-semibold text-slate-800">{selectedCustomer.company}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Age & Gender</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {selectedCustomer.age} yrs • {selectedCustomer.gender}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={closeCustomerDetails}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>

          <button
            type="button"
            onClick={() => loginToCustomerPortal(selectedCustomer)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs shadow-md transition-transform active:scale-[0.98] cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Launch Customer Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
