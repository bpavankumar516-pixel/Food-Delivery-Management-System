import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  MapPin,
  Store,
  XCircle,
  ArrowLeft,
  Bike,
} from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

const TRACKING_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat },
  { key: 'Ready for Pickup', label: 'Ready', icon: PackageCheck },
  { key: 'Out for Delivery', label: 'On the Way', icon: Bike },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function CustomerTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { myOrders, activeOrders } = useCustomerPortal();

  const decodedId = orderId ? decodeURIComponent(orderId) : null;

  const trackedOrder = useMemo(() => {
    if (decodedId) {
      const found = myOrders.find((o) => o.id === decodedId || o.rawId === decodedId);
      if (found) return found;
    }
    return activeOrders[0] || myOrders[0] || null;
  }, [decodedId, myOrders, activeOrders]);

  if (!trackedOrder) {
    return (
      <CustomerLayout>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <Truck className="w-12 h-12 mx-auto text-slate-300" />
          <h2 className="text-xl font-black text-[#202A24]">No Orders to Track</h2>
          <p className="text-xs text-slate-500">
            Once you place an order, you can monitor kitchen preparation and live rider dispatch here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-6 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
          >
            Order Food Now
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const isCancelledOrRejected = ['Cancelled', 'Rejected'].includes(trackedOrder.status);
  const currentStepIdx = TRACKING_STEPS.findIndex((s) => s.key === trackedOrder.status);
  const progressPct = isCancelledOrRejected
    ? 0
    : currentStepIdx >= 0
    ? Math.round(((currentStepIdx + 1) / TRACKING_STEPS.length) * 100)
    : 15;

  return (
    <CustomerLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </button>

          {myOrders.length > 1 && (
            <select
              value={trackedOrder.id}
              onChange={(e) =>
                navigate(`/customer/tracking/${encodeURIComponent(e.target.value)}`)
              }
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#202A24] cursor-pointer"
            >
              {myOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.restaurant} ({o.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Hero Status Card */}
        <div className="rounded-3xl bg-gradient-to-r from-[#163A2D] to-[#0f2920] text-white p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                Live Order Status • {trackedOrder.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">
                {isCancelledOrRejected
                  ? `Order ${trackedOrder.status}`
                  : trackedOrder.status === 'Delivered'
                  ? 'Order Delivered! Enjoy Your Meal'
                  : `${trackedOrder.status}...`}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 mt-1">
                {trackedOrder.restaurant} • Estimated Arrival:{' '}
                <span className="font-bold text-[#FF6B35]">
                  {trackedOrder.estimatedDeliveryTime || '25-30 mins'}
                </span>
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0">
              <p className="text-[10px] uppercase font-bold text-emerald-200">Progress</p>
              <p className="text-2xl font-black text-white">{progressPct}%</p>
            </div>
          </div>

          {!isCancelledOrRejected ? (
            <div className="space-y-3 pt-2">
              <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                {TRACKING_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStepIdx;
                  const current = idx === currentStepIdx;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          current
                            ? 'bg-[#FF6B35] text-white ring-4 ring-[#FF6B35]/30 scale-105'
                            : done
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span
                        className={`text-[10.5px] font-bold leading-tight ${
                          done ? 'text-white' : 'text-white/45'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center gap-3 text-xs">
              <XCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>
                {trackedOrder.cancelReason ||
                  trackedOrder.rejectReason ||
                  'This order was closed and is no longer active.'}
              </span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Cols: Timeline Log */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
            <h2 className="font-black text-base text-[#202A24]">Live Activity Log</h2>
            <div className="space-y-3">
              {(trackedOrder.history || []).map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#faf8f4] border border-slate-200/70 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E7EFE8] text-[#163A2D] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-[#202A24]">{entry.status}</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{entry.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Delivery Partner, Address & Items */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs text-xs">
              <h3 className="font-black text-sm text-[#202A24]">Delivery Summary</h3>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Delivery Partner
                  </p>
                  <p className="font-bold text-[#202A24]">
                    {trackedOrder.deliveryPartner || 'Assigning nearest rider...'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-slate-600">
                <p className="flex items-center gap-2 font-bold text-[#163A2D]">
                  <Store className="w-4 h-4 text-[#FF6B35]" />
                  {trackedOrder.restaurant}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#163A2D] shrink-0 mt-0.5" />
                  <span>{trackedOrder.deliveryAddress || trackedOrder.customer?.address}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                {(trackedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.qty || 1}× {it.name}
                    </span>
                    <span className="font-bold">
                      ₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#163A2D]">
                  <span>Total Paid</span>
                  <span>
                    ₹{(trackedOrder.grandTotal || trackedOrder.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
