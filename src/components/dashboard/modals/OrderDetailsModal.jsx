import React from 'react';
import { X, MapPin, Phone, CreditCard, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../../context/DashboardContext';
import { isValidStatusTransition } from '../../../context/OrderContext';

export default function OrderDetailsModal() {
  const navigate = useNavigate();
  const { selectedOrder, setSelectedOrder, handleUpdateOrderStatus } = useDashboard();

  if (!selectedOrder) return null;

  const statuses = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Rejected',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setSelectedOrder(null)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight">{selectedOrder.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                {selectedOrder.status}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Ordered {selectedOrder.orderTime} • {selectedOrder.restaurant}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={selectedOrder.customer.avatar}
              alt={selectedOrder.customer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600/30"
            />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">
                {selectedOrder.customer?.name || 'Customer'}
              </h4>
              <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {selectedOrder.customer?.phone || 'Phone not recorded'}
              </p>
              <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {selectedOrder.deliveryAddress ||
                    selectedOrder.customer?.address ||
                    'Address not provided'}
                </span>
              </p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Items Ordered
            </h5>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-[11px]">
                      {item.qty || 1}x
                    </span>
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-1 font-bold text-sm text-slate-900 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-emerald-700 font-black">
                  ₹{(selectedOrder.grandTotal || selectedOrder.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Partner */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Payment Mode</span>
              <span className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                {selectedOrder.paymentMethod || 'Online'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-medium">Delivery Partner</span>
              <span className="font-bold text-slate-800 mt-1 truncate block">
                {selectedOrder.deliveryPartner || 'Pending Rider Dispatch'}
              </span>
            </div>
          </div>

          {/* Dynamic Status Changer */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1.5">
              Update Order Status (Real-time):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map((st) => {
                const isCurrent = selectedOrder.status === st;
                const check = isValidStatusTransition(selectedOrder.status, st);
                const disabled = !isCurrent && !check.valid;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={disabled}
                    title={isCurrent ? 'Current Status' : check.reason || `Move to ${st}`}
                    onClick={() => {
                      if (!isCurrent && check.valid) {
                        handleUpdateOrderStatus(selectedOrder.id, st);
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm cursor-default'
                        : disabled
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedOrder(null);
              navigate('/orders');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#05291e] hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Manage in Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
