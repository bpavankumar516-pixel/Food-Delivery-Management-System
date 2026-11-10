import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

export default function CustomerViewDetailsModal() {
  const {
    selectedCustomer,
    isViewModalOpen,
    closeViewModal,
    openEditModal,
    toggleCustomerStatus,
  } = useCustomers();

  if (!isViewModalOpen || !selectedCustomer) return null;

  const orders = selectedCustomer.orders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Emerald Gradient */}
        <div className="relative bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] p-6 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <button
            type="button"
            onClick={closeViewModal}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 relative z-10">
            <img
              src={selectedCustomer.avatar}
              alt={selectedCustomer.fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg bg-white shrink-0"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  selectedCustomer.fullName
                )}&background=ff5722&color=fff&bold=true`;
              }}
            />

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {selectedCustomer.fullName}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                  }`}
                >
                  ● {selectedCustomer.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-white/80 font-medium mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{selectedCustomer.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{selectedCustomer.phone}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-5">
          {/* Lifetime Metrics Summary Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                {selectedCustomer.totalOrders || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Spent
              </span>
              <span className="text-lg font-black text-emerald-700 mt-0.5 block">
                ₹{(selectedCustomer.totalSpent || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Joined On
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {selectedCustomer.joinedOn}
              </span>
            </div>
          </div>

          {/* Location & Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Customer Location & Address</span>
            </h4>
            <p className="text-slate-600 font-medium">
              {selectedCustomer.address || 'Central Delivery Address'}, {selectedCustomer.city || 'Bengaluru'}, {selectedCustomer.state || 'Karnataka'}
            </p>
          </div>

          {/* Recent Orders List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Customer Order History ({orders.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => toggleCustomerStatus(selectedCustomer.id)}
                className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer border ${
                  selectedCustomer.status === 'Active'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {selectedCustomer.status === 'Active' ? 'Block Customer' : 'Unblock Customer'}
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400">
                No orders recorded yet for this customer.
              </div>
            ) : (
              <div className="space-y-2.5">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{ord.id}</span>
                        <span className="text-[11px] text-slate-400">• {ord.date}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{ord.restaurant}</span>
                      </div>
                      <span className="font-black text-slate-900">₹{ord.amount}</span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2 text-[11px] text-slate-600 space-y-0.5">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>
                            {it.qty}x {it.name}
                          </span>
                          <span className="font-semibold text-slate-800">₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={closeViewModal}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              closeViewModal();
              openEditModal(selectedCustomer);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ff5722] hover:bg-[#f44e19] text-white font-bold text-xs shadow-md transition-transform active:scale-98 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Customer Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
