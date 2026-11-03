import React, { useState } from 'react';
import { X, Tag, Percent } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';

export default function ApplyCouponModal() {
  const { isApplyCouponOpen, setIsApplyCouponOpen, handleApplyCoupon } = useDashboard();
  const [coupon, setCoupon] = useState({
    code: 'FOODIX50',
    discount: '50',
    minOrder: '299',
  });

  if (!isApplyCouponOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coupon.code.trim()) return;
    handleApplyCoupon(coupon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0f766e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Create / Apply Coupon</h3>
              <p className="text-[11px] text-teal-100">Boost conversion with promotional offers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsApplyCouponOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Coupon Promo Code</label>
            <input
              type="text"
              required
              value={coupon.code}
              onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
              placeholder="e.g. FESTIVE30"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold tracking-wider focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Discount (%)</label>
              <input
                type="number"
                required
                value={coupon.discount}
                onChange={(e) => setCoupon({ ...coupon, discount: e.target.value })}
                placeholder="20"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                required
                value={coupon.minOrder}
                onChange={(e) => setCoupon({ ...coupon, minOrder: e.target.value })}
                placeholder="199"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsApplyCouponOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold shadow-md transition-all cursor-pointer"
            >
              Publish Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
