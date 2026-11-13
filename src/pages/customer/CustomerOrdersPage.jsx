import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  XCircle,
  Eye,
  X,
  MapPin,
  Store,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import ConfirmDialog from '../../components/customerPortal/ConfirmDialog';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const {
    myOrders,
    restaurants,
    reorderPastOrder,
    canCancelOrder,
    cancelCustomerOrder,
  } = useCustomerPortal();

  const [tab, setTab] = useState('All'); // 'All' | 'Active' | 'Delivered' | 'Cancelled'
  const [inspectOrder, setInspectOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const filteredOrders = useMemo(() => {
    if (tab === 'All') return myOrders;
    if (tab === 'Active') {
      return myOrders.filter((o) =>
        ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(
          o.status
        )
      );
    }
    if (tab === 'Delivered') {
      return myOrders.filter((o) => o.status === 'Delivered');
    }
    return myOrders.filter((o) => ['Cancelled', 'Rejected'].includes(o.status));
  }, [myOrders, tab]);

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Preparing':
      case 'Confirmed':
      case 'Ready for Pickup':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const handleReorder = (order) => {
    const ok = reorderPastOrder(order);
    if (ok) navigate('/customer/cart');
  };

  return (
    <CustomerLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#202A24]">My Orders</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Live order statuses synced with Foodix restaurants & delivery dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-5 py-2.5 rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs shadow-md cursor-pointer self-start sm:self-auto"
          >
            + Order Food Now
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'All', label: `All (${myOrders.length})` },
            {
              id: 'Active',
              label: `Active (${
                myOrders.filter((o) =>
                  ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(
                    o.status
                  )
                ).length
              })`,
            },
            {
              id: 'Delivered',
              label: `Delivered (${myOrders.filter((o) => o.status === 'Delivered').length})`,
            },
            {
              id: 'Cancelled',
              label: `Cancelled (${
                myOrders.filter((o) => ['Cancelled', 'Rejected'].includes(o.status)).length
              })`,
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                tab === t.id
                  ? 'bg-[#163A2D] text-white border-[#163A2D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF6B35]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-black text-base text-[#202A24]">No orders in this category</h3>
            <p className="text-xs text-slate-500">
              Browse restaurants and place an order to track it live here!
            </p>
            <button
              type="button"
              onClick={() => navigate('/customer/restaurants')}
              className="px-5 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => {
              const restObj = restaurants.find(
                (r) => r.id === order.restaurantId || r.name === order.restaurant
              );
              const isActive = [
                'Pending',
                'Confirmed',
                'Preparing',
                'Ready for Pickup',
                'Out for Delivery',
              ].includes(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          restObj?.image ||
                          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={order.restaurant}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-[#202A24] truncate">
                          {order.restaurant}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {order.id} • {order.placedAt || 'Recent'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${getBadgeStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="p-3 rounded-2xl bg-[#faf8f4] border border-slate-100 space-y-1 text-xs">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>
                          {it.qty || 1}× {it.name}
                        </span>
                        <span className="font-bold">
                          ₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {order.paymentMethod || 'Online'}
                      </span>
                      <span className="text-base font-black text-[#163A2D]">
                        ₹{(order.grandTotal || order.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectOrder(order)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {isActive && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/customer/tracking/${encodeURIComponent(order.id)}`)
                          }
                          className="px-3 py-2 rounded-xl bg-[#163A2D] hover:bg-[#0f2920] text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>
                      )}

                      {canCancelOrder(order) && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(order)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {inspectOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#FF6B35]">
                  Order Receipt
                </span>
                <h3 className="text-xl font-black text-[#202A24]">{inspectOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-orange-100 text-xs space-y-1.5">
              <p className="font-black text-[#163A2D] flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#FF6B35]" />
                {inspectOrder.restaurant}
              </p>
              <p className="text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#163A2D] shrink-0 mt-0.5" />
                {inspectOrder.deliveryAddress || inspectOrder.customer?.address}
              </p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Status: <span className="font-bold text-[#202A24]">{inspectOrder.status}</span>
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              {(inspectOrder.items || []).map((it, i) => (
                <div key={i} className="p-3 flex justify-between">
                  <span className="font-semibold text-[#202A24]">
                    {it.qty || 1}× {it.name}
                  </span>
                  <span className="font-black">
                    ₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#E7EFE8]/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{inspectOrder.subtotal || inspectOrder.amount}</span>
              </div>
              {inspectOrder.discount > 0 && (
                <div className="flex justify-between text-[#FF6B35] font-bold">
                  <span>Discount ({inspectOrder.couponCode})</span>
                  <span>-₹{inspectOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery + Tax</span>
                <span>
                  ₹
                  {(
                    (inspectOrder.deliveryFee ?? 0) +
                    (inspectOrder.tax ??
                      Math.max(
                        (inspectOrder.grandTotal || inspectOrder.amount || 0) -
                          (inspectOrder.subtotal || inspectOrder.amount || 0) +
                          (inspectOrder.discount || 0) -
                          (inspectOrder.deliveryFee ?? 0),
                        0
                      ))
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#163A2D] pt-1 border-t border-emerald-200">
                <span>Grand Total</span>
                <span>₹{(inspectOrder.grandTotal || inspectOrder.amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
                <span className="text-slate-600 font-medium">Payment Mode</span>
                <span className="font-bold text-slate-900">{inspectOrder.paymentMethod || 'Online'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Payment Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (inspectOrder.paymentStatus || '').toLowerCase().includes('cash')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  ● {inspectOrder.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>

            {Array.isArray(inspectOrder.history) && inspectOrder.history.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Order Timeline</p>
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl">
                  {inspectOrder.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#163A2D] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-[#202A24]">
                          {h.status}{' '}
                          <span className="font-normal text-slate-400">({h.timestamp})</span>
                        </p>
                        <p className="text-[11px] text-slate-500">{h.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        variant="danger"
        title={`Cancel Order ${cancelTarget?.id}?`}
        message="You can cancel orders before the kitchen begins preparation. Refunds (for online payments) are processed automatically."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        onConfirm={() => {
          if (cancelTarget) {
            cancelCustomerOrder(cancelTarget.id, 'Customer cancelled from My Orders');
          }
          setCancelTarget(null);
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </CustomerLayout>
  );
}
