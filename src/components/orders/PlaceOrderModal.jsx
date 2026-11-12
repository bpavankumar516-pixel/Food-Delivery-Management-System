import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCustomers } from '../../context/CustomerContext';
import { useRestaurants } from '../../context/RestaurantContext';
import { useOrders } from '../../context/OrderContext';
import { useCoupons } from '../../context/CouponContext';

export default function PlaceOrderModal({ isOpen, onClose }) {
  const { customers } = useCustomers();
  const { restaurants, allMenuItems } = useRestaurants();
  const { createOrder } = useOrders();
  const { coupons, calculateDiscount, recordCouponUsage } = useCoupons();

  const activeCustomers = useMemo(
    () => customers.filter((c) => c.status !== 'Blocked'),
    [customers]
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedRestId, setSelectedRestId] = useState('');
  const [selectedDishId, setSelectedDishId] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize customer & restaurant defaults when opening
  useEffect(() => {
    if (!isOpen) return;
    const defaultCust = activeCustomers[0] || customers[0];
    if (defaultCust && !selectedCustomerId) {
      setSelectedCustomerId(defaultCust.id);
    }
    const defaultRest = restaurants.find((r) => r.status === 'Open') || restaurants[0];
    if (defaultRest && !selectedRestId) {
      setSelectedRestId(defaultRest.id);
    }
  }, [isOpen, activeCustomers, customers, restaurants, selectedCustomerId, selectedRestId]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || customers[0],
    [customers, selectedCustomerId]
  );

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestId) || restaurants[0],
    [restaurants, selectedRestId]
  );

  // Sync delivery address when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setDeliveryAddress(
        [selectedCustomer.address, selectedCustomer.city, selectedCustomer.state]
          .filter(Boolean)
          .join(', ')
      );
    }
  }, [selectedCustomer]);

  // Dishes filtered for the selected restaurant (falling back to full catalog if none specifically assigned)
  const availableDishes = useMemo(() => {
    const matched = allMenuItems.filter(
      (d) =>
        d.inStock !== false &&
        (d.restaurantId === selectedRestId ||
          d.restaurantName?.toLowerCase() === selectedRestaurant?.name?.toLowerCase())
    );
    return matched.length > 0 ? matched : allMenuItems.filter((d) => d.inStock !== false);
  }, [allMenuItems, selectedRestId, selectedRestaurant]);

  // Pre-select first dish and seed 1 cart item when restaurant changes
  useEffect(() => {
    if (!isOpen || availableDishes.length === 0) return;
    setSelectedDishId(availableDishes[0].id);
    setCartItems([
      {
        id: availableDishes[0].id,
        name: availableDishes[0].name,
        price: availableDishes[0].price,
        qty: 1,
        instructions: '',
      },
    ]);
    setAppliedCoupon(null);
  }, [isOpen, selectedRestId]);

  if (!isOpen) return null;

  const handleAddDish = () => {
    const dish = availableDishes.find((d) => d.id === selectedDishId);
    if (!dish) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, qty: 1, instructions: '' }];
    });
  };

  const handleUpdateQty = (dishId, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === dishId ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setAppliedCoupon(null);
      return;
    }
    const result = calculateDiscount(couponCode, subtotal);
    if (result.valid) {
      setAppliedCoupon({ code: result.coupon.code, discount: result.discount });
      toast.success(result.message);
    } else {
      setAppliedCoupon(null);
      toast.warn(result.message);
    }
  };

  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const deliveryFee = selectedRestaurant?.deliveryFee ?? 35;
  const tax = Math.round(Math.max(subtotal - discount, 0) * 0.05);
  const grandTotal = Math.max(subtotal - discount + deliveryFee + tax, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select a customer.');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Please add at least one dish to the order.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        customerId: selectedCustomer.id,
        restaurant: selectedRestaurant?.name || 'Foodix Kitchen',
        restaurantId: selectedRestaurant?.id || 'rest_001',
        items: cartItems,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code || null,
        deliveryFee,
        tax,
        grandTotal,
        amount: grandTotal,
        paymentMethod,
        deliveryAddress,
        specialInstructions,
      });

      if (appliedCoupon?.code) {
        recordCouponUsage(appliedCoupon.code);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCouponHints = coupons.filter((c) => c.status === 'Active').slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="bg-gradient-to-r from-[#fef8f0] via-[#fffbf6] to-[#f2f7ef] px-6 py-4 border-b border-orange-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Place Live Customer Order</h3>
              <p className="text-xs text-slate-500 font-medium">
                Select an API customer, partner restaurant, and dishes to dispatch immediately
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs custom-scrollbar">
          {/* Step 1: Select Customer from CustomerContext API */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#064e3b]" />
                <span>1. Select Linked Customer ({customers.length} API Profiles)</span>
              </label>
              {selectedCustomer && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedCustomer.tier || 'Regular'} • {selectedCustomer.ordersCount || 0} orders
                </span>
              )}
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.city} ({c.phone}) {c.status === 'Blocked' ? '[Blocked]' : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedCustomer.fullName
                    )}&background=ff5722&color=fff&bold=true`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{selectedCustomer.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedCustomer.email} • {selectedCustomer.phone}
                  </p>
                </div>
                {selectedCustomer.status === 'Blocked' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    Blocked
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Restaurant & Dish Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">2. Partner Restaurant *</label>
              <select
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Add Dish to Order</label>
              <div className="flex gap-2">
                <select
                  value={selectedDishId}
                  onChange={(e) => setSelectedDishId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600 truncate"
                >
                  {availableDishes.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} — ₹{dish.price}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddDish}
                  className="px-3 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">Selected Order Items ({cartItems.length})</span>
            {cartItems.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
                No dishes added yet. Choose a dish above and click Add.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">₹{item.price} per unit</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-black text-slate-900">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-black text-slate-900 w-16 text-right">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -item.qty)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Address, Payment & Coupon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>Delivery Address *</span>
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                <option value="UPI (Google Pay)">UPI (Google Pay)</option>
                <option value="Credit Card (HDFC)">Credit Card (HDFC)</option>
                <option value="Paytm Wallet">Paytm Wallet</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          {/* Coupon + Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>Promo Coupon</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-mono uppercase focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5722] font-bold border border-orange-200 cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {activeCouponHints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeCouponHints.map((cp) => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setCouponCode(cp.code)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 text-[10px] font-bold text-slate-600 hover:text-[#ff5722] cursor-pointer"
                    >
                      {cp.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Cooking / Delivery Note</label>
              <input
                type="text"
                placeholder="Optional note for kitchen or rider..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Live Price Breakdown */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#ff5722] font-semibold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-emerald-950">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Order...' : 'Place & Dispatch Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
