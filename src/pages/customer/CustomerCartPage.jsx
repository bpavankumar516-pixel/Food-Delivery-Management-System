import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Store,
  AlertTriangle,
  Sparkles,
  X,
} from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import ConfirmDialog from '../../components/customerPortal/ConfirmDialog';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerCartPage() {
  const navigate = useNavigate();
  const {
    cartRestaurant,
    hydratedCartItems,
    cartItemCount,
    hasUnavailableCartItems,
    cartTotals,
    appliedCouponCode,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    coupons,
    getMergedMenuForRestaurant,
    addToCart,
  } = useCustomerPortal();

  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    setCouponInput(appliedCouponCode || '');
  }, [appliedCouponCode]);

  const activeCoupons = useMemo(
    () => coupons.filter((c) => c.status === 'Active').slice(0, 4),
    [coupons]
  );

  // Recommended add-ons from the same restaurant not yet in cart
  const suggestedAddons = useMemo(() => {
    if (!cartRestaurant) return [];
    const inCartIds = new Set(hydratedCartItems.map((i) => i.id));
    return getMergedMenuForRestaurant(cartRestaurant.id)
      .filter((d) => d.inStock !== false && !inCartIds.has(d.id))
      .slice(0, 3);
  }, [cartRestaurant, hydratedCartItems, getMergedMenuForRestaurant]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    applyCoupon(couponInput);
  };

  if (hydratedCartItems.length === 0) {
    return (
      <CustomerLayout hideStickyCart={true}>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] text-[#FF6B35] flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#202A24]">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore our partner restaurants and add your favorite dishes to get started!
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-6 py-3 rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Browse Restaurants
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const remainingForFreeDelivery = Math.max(
    (cartTotals.freeDeliveryThreshold || 499) - cartTotals.subtotal,
    0
  );

  return (
    <CustomerLayout hideStickyCart={true}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#202A24]">Your Shopping Cart</h1>
            <p className="text-xs text-slate-500 font-medium">
              {cartItemCount} item{cartItemCount > 1 ? 's' : ''} from{' '}
              <span className="font-bold text-[#163A2D]">
                {cartRestaurant?.name || 'Partner Restaurant'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Availability Warning */}
        {hasUnavailableCartItems && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {cartRestaurant?.status === 'Closed'
                ? `${cartRestaurant.name} is currently closed. Checkout is disabled until it reopens.`
                : 'Some items in your cart were marked Sold Out by the restaurant. Remove unavailable items to proceed to checkout.'}
            </span>
          </div>
        )}

        {/* Free Delivery Progress */}
        {cartTotals.deliveryFee > 0 && remainingForFreeDelivery > 0 ? (
          <div className="p-3.5 rounded-2xl bg-[#E7EFE8] border border-emerald-200 text-xs text-[#163A2D] font-bold flex items-center justify-between gap-3">
            <span>
              Add ₹{remainingForFreeDelivery.toLocaleString()} more to unlock FREE Delivery!
            </span>
            <button
              type="button"
              onClick={() =>
                cartRestaurant && navigate(`/customer/restaurants/${cartRestaurant.id}`)
              }
              className="underline text-[#FF6B35] shrink-0 cursor-pointer"
            >
              Add Items
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Woohoo! You unlocked FREE doorstep delivery on this order.</span>
          </div>
        )}

        {/* Main 2-Column Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Items + Add-ons */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-[#FFF8F0]/70 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-[#163A2D]">
                  <Store className="w-4 h-4 text-[#FF6B35]" />
                  <span>{cartRestaurant?.name || 'Partner Kitchen'}</span>
                </div>
                {cartRestaurant && (
                  <button
                    type="button"
                    onClick={() => navigate(`/customer/restaurants/${cartRestaurant.id}`)}
                    className="text-[11px] font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    + Add More Items
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {hydratedCartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 ${
                      !item.inStock ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 ${
                          !item.inStock ? 'grayscale opacity-60' : ''
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-xs border-2 flex items-center justify-center shrink-0 ${
                              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </span>
                          <h4 className="font-black text-sm text-[#202A24] truncate">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          ₹{item.price} each
                        </p>
                        {!item.inStock && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Unavailable / Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="inline-flex items-center gap-2 bg-[#FFF8F0] border border-orange-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(item.id, item.qty - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#202A24] flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black w-5 text-center">{item.qty}</span>
                        <button
                          type="button"
                          disabled={!item.inStock}
                          onClick={() => updateCartItemQty(item.id, item.qty + 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#202A24] flex items-center justify-center shadow-2xs cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-black text-sm text-[#202A24] w-16 text-right">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Add-Ons */}
            {suggestedAddons.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
                <h3 className="font-black text-sm text-[#202A24]">
                  Complete Your Meal from {cartRestaurant?.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestedAddons.map((dish) => (
                    <div
                      key={dish.id}
                      className="p-3 rounded-2xl bg-[#faf8f4] border border-slate-200/70 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#202A24] truncate">{dish.name}</p>
                          <p className="text-[11px] font-black text-[#163A2D]">₹{dish.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(dish, 1)}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white text-[11px] font-bold cursor-pointer shrink-0 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Cols: Coupon & Bill Summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Apply Coupon Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-[#202A24] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#FF6B35]" />
                  <span>Apply Promo Coupon</span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/customer/settings?tab=offers')}
                  className="text-[11px] font-bold text-[#163A2D] hover:underline cursor-pointer"
                >
                  All Offers
                </button>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. WELCOME50)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFF8F0]/70 border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:border-[#FF6B35]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#163A2D] hover:bg-[#0f2920] text-white font-bold text-xs cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {appliedCouponCode && cartTotals.couponResult?.valid ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">
                    ✓ {appliedCouponCode} applied!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                    }}
                    className="text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : appliedCouponCode && cartTotals.couponResult && !cartTotals.couponResult.valid ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-amber-800">
                    {appliedCouponCode}: {cartTotals.couponResult.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeCoupons.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => {
                      setCouponInput(cp.code);
                      applyCoupon(cp.code);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FFF8F0] border border-orange-200 text-[10.5px] font-bold text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white cursor-pointer transition-colors"
                  >
                    {cp.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
              <h3 className="font-black text-sm text-[#202A24] pb-2 border-b border-slate-100">
                Bill Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#202A24]">
                    ₹{cartTotals.subtotal.toLocaleString()}
                  </span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-[#FF6B35] font-bold">
                    <span>Coupon Discount ({appliedCouponCode})</span>
                    <span>-₹{cartTotals.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className={cartTotals.deliveryFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                    {cartTotals.deliveryFee === 0 ? 'FREE' : `₹${cartTotals.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Restaurant Taxes ({cartTotals.gstPct}%)</span>
                  <span>₹{cartTotals.tax}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-[#163A2D]">
                  <span>To Pay</span>
                  <span>₹{cartTotals.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={hasUnavailableCartItems}
                onClick={() => navigate('/customer/checkout')}
                className="w-full py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        variant="danger"
        title="Clear Entire Cart?"
        message="All dishes currently in your cart will be removed."
        confirmLabel="Clear Cart"
        onConfirm={() => {
          clearCart();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </CustomerLayout>
  );
}
