import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

const INSTRUCTION_PRESETS = [
  'Leave at doorstep',
  'Do not ring doorbell',
  'Call upon arrival at gate',
  'Include extra cutlery & tissues',
];

const PAYMENT_OPTIONS = [
  {
    id: 'UPI (PhonePe / GPay)',
    label: 'UPI (PhonePe / Google Pay)',
    desc: 'Instant simulated UPI approval',
    icon: Smartphone,
  },
  {
    id: 'Credit / Debit Card',
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay (Demo)',
    icon: CreditCard,
  },
  {
    id: 'Net Banking',
    label: 'Net Banking',
    desc: 'HDFC, ICICI, SBI & more (Demo)',
    icon: Landmark,
  },
  {
    id: 'Cash on Delivery',
    label: 'Cash on Delivery',
    desc: 'Pay cash or UPI on arrival',
    icon: Banknote,
  },
];

export default function CustomerCheckoutPage() {
  const navigate = useNavigate();
  const {
    hydratedCartItems,
    hasUnavailableCartItems,
    cartRestaurant,
    cartTotals,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    coupons,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    isPlacingOrder,
    placeCustomerOrder,
  } = useCustomerPortal();

  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe / GPay)');
  const [instructions, setInstructions] = useState('');
  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  });

  const eligibleCoupons = useMemo(
    () => coupons.filter((c) => c.status === 'Active'),
    [coupons]
  );

  if (hydratedCartItems.length === 0) {
    return (
      <CustomerLayout hideStickyCart={true}>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <h2 className="text-xl font-black text-[#202A24]">No Items to Checkout</h2>
          <p className="text-xs text-slate-500">
            Your cart is empty. Add items from a restaurant before checking out.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-6 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
          >
            Browse Restaurants
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street.trim() || !newAddr.pincode.trim()) {
      toast.error('Please enter street address and postal code.');
      return;
    }
    addAddress({ ...newAddr, isDefault: true });
    setShowNewAddrForm(false);
    setNewAddr({
      label: 'Home',
      street: '',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    });
  };

  const handlePlaceOrder = async () => {
    const createdOrder = await placeCustomerOrder({
      paymentMethod,
      specialInstructions: instructions,
      addressId: selectedAddressId,
    });
    if (createdOrder?.id) {
      navigate(`/customer/tracking/${encodeURIComponent(createdOrder.id)}`);
    }
  };

  return (
    <CustomerLayout hideStickyCart={true}>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/customer/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-2xl font-black text-[#202A24]">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Address, Instructions, Payment */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Delivery Address Selection */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-[#202A24] flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-[#FF6B35]" />
                  <span>1. Select Delivery Address</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewAddrForm((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showNewAddrForm && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="p-4 rounded-2xl bg-[#FFF8F0] border border-orange-200/70 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No., Building, Street *"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Landmark (optional)"
                      value={newAddr.landmark}
                      onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#163A2D] text-white font-bold cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        selected
                          ? 'bg-[#E7EFE8]/60 border-[#163A2D] ring-2 ring-[#163A2D]/15'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[#163A2D] border border-slate-200 text-[10px] font-black uppercase">
                          {addr.label}
                        </span>
                        {selected && (
                          <CheckCircle2 className="w-4 h-4 text-[#163A2D]" />
                        )}
                      </div>
                      <p className="font-bold text-xs text-[#202A24] pt-1">{addr.street}</p>
                      <p className="text-[11px] text-slate-500">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Delivery Instructions */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
              <h2 className="font-black text-base text-[#202A24]">2. Delivery Instructions</h2>
              <div className="flex flex-wrap gap-2">
                {INSTRUCTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInstructions(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                      instructions === preset
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-[#FFF8F0] text-[#202A24] border-orange-200/70'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any specific cooking or gate entry instructions..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            {/* 3. Simulated Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-base text-[#202A24] flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#163A2D]" />
                  <span>3. Payment Method</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                  <Info className="w-3 h-3" />
                  Demo Payment Simulation (No Real Charge)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#FFF8F0] border-[#FF6B35] ring-2 ring-[#FF6B35]/15'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-[#FF6B35] text-white' : 'bg-white text-[#163A2D]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-[#202A24] truncate">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Order Summary + Coupon + Place Order CTA */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ordering From</span>
                <h3 className="font-black text-base text-[#163A2D]">
                  {cartRestaurant?.name || 'Foodix Partner'}
                </h3>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {hydratedCartItems.map((it) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <span className="text-slate-700 font-medium">
                      {it.qty}× {it.name}
                    </span>
                    <span className="font-bold text-[#202A24] shrink-0">
                      ₹{(it.price * it.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFF8F0]/70 border border-slate-200 text-xs font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponInput)}
                    className="px-3.5 py-2 rounded-xl bg-[#163A2D] text-white font-bold text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCouponCode && cartTotals.couponResult?.valid ? (
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                    <span>Applied: {appliedCouponCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCouponInput('');
                      }}
                      className="text-rose-600 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {eligibleCoupons.slice(0, 3).map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => {
                          setCouponInput(cp.code);
                          applyCoupon(cp.code);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-[#FF6B35] text-[10px] font-bold cursor-pointer"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {cp.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Totals */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{cartTotals.subtotal.toLocaleString()}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-[#FF6B35] font-bold">
                    <span>Discount</span>
                    <span>-₹{cartTotals.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>
                    {cartTotals.deliveryFee === 0 ? 'FREE' : `₹${cartTotals.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({cartTotals.gstPct}%)</span>
                  <span>₹{cartTotals.tax}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-[#163A2D]">
                  <span>Grand Total</span>
                  <span>₹{cartTotals.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isPlacingOrder || hasUnavailableCartItems}
                onClick={handlePlaceOrder}
                className="w-full py-3.5 rounded-2xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-black text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isPlacingOrder
                    ? 'Placing Order...'
                    : `Place Order • ₹${cartTotals.grandTotal.toLocaleString()}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
