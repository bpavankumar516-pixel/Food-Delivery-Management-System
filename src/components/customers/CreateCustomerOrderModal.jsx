import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';
import { useRestaurants } from '../../context/RestaurantContext';

export default function CreateCustomerOrderModal() {
  const { selectedCustomer, isCreateOrderOpen, closeCreateOrderModal, placeOrderForCustomer } =
    useCustomers();
  const { allMenuItems, restaurants } = useRestaurants();

  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || 'rest_001');
  const [selectedDishId, setSelectedDishId] = useState(allMenuItems[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe)');
  const [deliveryAddress, setDeliveryAddress] = useState(selectedCustomer?.address || '');

  if (!isCreateOrderOpen || !selectedCustomer) return null;

  const currentDish = allMenuItems.find((d) => d.id === selectedDishId) || allMenuItems[0];
  const currentRest = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentDish) return;

    const totalAmount = currentDish.price * quantity;

    placeOrderForCustomer(selectedCustomer.id, {
      restaurantName: currentRest?.name || currentDish.restaurantName || 'Foodix Central',
      restaurantId: selectedRestId,
      amount: totalAmount,
      paymentMethod,
      deliveryAddress: deliveryAddress || `${selectedCustomer.address}, ${selectedCustomer.city}`,
      items: [
        {
          name: currentDish.name,
          qty: quantity,
          price: currentDish.price,
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff5722] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Create Customer Order</h3>
              <p className="text-xs text-slate-500">
                Ordering for <span className="font-bold text-slate-800">{selectedCustomer.fullName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCreateOrderModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Restaurant Selector */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Choose Partner Restaurant *</label>
            <select
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-slate-50/50 cursor-pointer focus:outline-none focus:border-emerald-600"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category} • {r.location})
                </option>
              ))}
            </select>
          </div>

          {/* Dish Selector */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Select Dish to Add *</label>
            <select
              value={selectedDishId}
              onChange={(e) => setSelectedDishId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-slate-50/50 cursor-pointer focus:outline-none focus:border-emerald-600"
            >
              {allMenuItems.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name} - ₹{dish.price} ({dish.category} • {dish.isVeg ? 'Veg' : 'Non-Veg'})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-sm text-slate-900 w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                <option value="UPI (GPay)">UPI (Google Pay)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Delivery Address</label>
            <input
              type="text"
              required
              value={deliveryAddress || `${selectedCustomer.address}, ${selectedCustomer.city}`}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50/50 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Cost Summary Box */}
          {currentDish && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  {quantity}x {currentDish.name}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Unit Price: ₹{currentDish.price} • Free Delivery
                </p>
              </div>
              <span className="font-black text-lg text-emerald-800">
                ₹{currentDish.price * quantity}
              </span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeCreateOrderModal}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold shadow-md shadow-orange-500/25 transition-transform active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Dispatch Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
