import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Copy, Check, Sparkles, Search, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerOffersPage() {
  const navigate = useNavigate();
  const { coupons, applyCoupon, hydratedCartItems, cartTotals } = useCustomerPortal();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'All' | 'Active' | 'Scheduled'
  const [copiedCode, setCopiedCode] = useState(null);

  const visibleCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        return (
          c.code.toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [coupons, statusFilter, query]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyToCart = (code) => {
    if (hydratedCartItems.length === 0) {
      navigator.clipboard.writeText(code);
      toast.info(`Copied "${code}"! Add items to your cart to apply it.`);
      navigate('/customer/restaurants');
      return;
    }
    const ok = applyCoupon(code);
    if (ok) navigate('/customer/cart');
  };

  return (
    <CustomerLayout>
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-r from-[#163A2D] to-[#0f2920] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Offers & Promo Coupons</h1>
              <p className="text-xs sm:text-sm text-emerald-100/85">
                Live promotional codes published by Foodix — copy or apply directly to your cart
              </p>
            </div>
          </div>

          {hydratedCartItems.length > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              Current Cart Subtotal: ₹{cartTotals.subtotal.toLocaleString()}
            </div>
          )}
        </div>

        {/* Search & Status Filter */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#FF6B35] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coupon codes or categories..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFF8F0]/70 border border-slate-200 text-xs focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div className="flex items-center gap-2">
            {['Active', 'Scheduled', 'All'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Coupon Cards */}
        {visibleCoupons.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center text-xs text-slate-500">
            No matching coupons available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleCoupons.map((cp) => {
              const isExpired = cp.status === 'Expired';
              const isActive = cp.status === 'Active';
              const eligibleForCart =
                hydratedCartItems.length === 0 ||
                cartTotals.subtotal >= (cp.minOrderAmount || 0);

              return (
                <div
                  key={cp.id}
                  className={`bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between ${
                    isExpired ? 'opacity-70' : ''
                  }`}
                >
                  <div className="relative h-32 bg-[#163A2D] overflow-hidden">
                    <img
                      src={cp.bannerImage}
                      alt={cp.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#163A2D]/95 via-[#163A2D]/70 to-transparent p-4 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          {cp.category || 'Special'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-500 text-white'
                              : isExpired
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-400 text-[#202A24]'
                          }`}
                        >
                          {cp.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-xl font-black text-[#FF6B35]">{cp.offerTag}</p>
                        <p className="text-xs font-semibold text-white/90 line-clamp-1">
                          {cp.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">{cp.description}</p>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                        <span>Min Order: ₹{cp.minOrderAmount || 0}</span>
                        <span>{cp.dateLabel || `Valid till: ${cp.expiryDate}`}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCopy(cp.code)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#FFF8F0] border border-dashed border-[#FF6B35] text-[#202A24] font-mono font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{cp.code}</span>
                        {copiedCode === cp.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#FF6B35]" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={!isActive}
                        onClick={() => handleApplyToCart(cp.code)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          eligibleForCart
                            ? 'bg-[#163A2D] hover:bg-[#0f2920] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{hydratedCartItems.length > 0 ? 'Apply' : 'Order'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
