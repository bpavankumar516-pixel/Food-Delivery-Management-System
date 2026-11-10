import React from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  Printer,
  Ban,
} from 'lucide-react';
import { useDineIn } from '../../context/DineInContext';

export default function DineInOrderDetailsModal() {
  const {
    inspectOrder,
    isOrderInspectOpen,
    closeOrderInspect,
    updateOrderStatus,
    openPaymentModal,
    openReceipt,
  } = useDineIn();

  if (!isOrderInspectOpen || !inspectOrder) return null;

  const STATUS_FLOW = ['Pending', 'Preparing', 'Ready to Serve', 'Served', 'Completed'];

  const statusBadges = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Preparing: 'bg-blue-100 text-blue-800 border-blue-200',
    'Ready to Serve': 'bg-purple-100 text-purple-800 border-purple-200',
    Served: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Completed: 'bg-slate-100 text-slate-800 border-slate-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#05291e] to-[#0c5942] text-white relative">
          <button
            type="button"
            onClick={closeOrderInspect}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg sm:text-xl tracking-tight">
                  {inspectOrder.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    statusBadges[inspectOrder.status] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {inspectOrder.status}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1">
                {inspectOrder.tableName} ({inspectOrder.section || 'Main Dining'}) • Placed{' '}
                {new Date(inspectOrder.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-300/80 block">Grand Total</span>
              <span className="text-2xl font-black text-white">₹{inspectOrder.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* Guest & Table Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer</span>
              <span className="font-bold text-slate-800 truncate block">
                {inspectOrder.customer?.name}
              </span>
              <span className="text-[11px] text-slate-500">{inspectOrder.customer?.mobile || 'No phone'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Table Allocation</span>
              <span className="font-black text-[#ff5722] block">{inspectOrder.tableName}</span>
              <span className="text-[11px] text-slate-500">Party of {inspectOrder.customer?.partySize || 2}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment Status</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                  inspectOrder.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {inspectOrder.paymentStatus === 'Paid' ? `Paid (${inspectOrder.payment?.method || 'Direct'})` : 'Payment Pending'}
              </span>
            </div>
          </div>

          {/* Status Pipeline Step Progress */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Kitchen & Service Status</span>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUS_FLOW.map((st, idx) => {
                const currentIdx = STATUS_FLOW.indexOf(inspectOrder.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = inspectOrder.status === st;

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateOrderStatus(inspectOrder.id, st)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordered Food Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Ordered Items ({inspectOrder.items?.length || 0})
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Kitchen KOT ready</span>
            </div>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
              {inspectOrder.items?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      {item.notes && (
                        <p className="text-[10px] text-orange-600 italic">Instruction: "{item.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                      × {item.qty}
                    </span>
                    <span className="font-black text-slate-900 w-16 text-right">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-800">₹{inspectOrder.subtotal}</span>
            </div>
            {inspectOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-₹{inspectOrder.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxes (5% GST)</span>
              <span>₹{inspectOrder.gst}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-[#064e3b]">₹{inspectOrder.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => updateOrderStatus(inspectOrder.id, 'Cancelled')}
            className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openReceipt(inspectOrder)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Bill & Receipt</span>
            </button>

            {inspectOrder.paymentStatus !== 'Paid' ? (
              <button
                type="button"
                onClick={() => {
                  closeOrderInspect();
                  openPaymentModal(inspectOrder);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-black text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Settle & Pay (₹{inspectOrder.grandTotal})</span>
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid Full</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
