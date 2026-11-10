import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Store,
  Clock,
  MapPin,
  CheckCircle2,
  Bike,
  Plus,
  RotateCcw,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ChefHat,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCustomers } from '../../context/CustomerContext';
import { useRestaurants } from '../../context/RestaurantContext';

export default function CustomerPortalModal() {
  const {
    activePortalCustomer,
    isPortalModalOpen,
    logoutCustomerPortal,
    placeOrderForCustomer,
  } = useCustomers();

  const { allMenuItems } = useRestaurants();

  const [activeTab, setActiveTab] = useState('active_orders'); // 'active_orders' | 'order_food' | 'history'
  const [selectedDish, setSelectedDish] = useState(allMenuItems[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe)');

  if (!isPortalModalOpen || !activePortalCustomer) return null;

  const orders = activePortalCustomer.orders || [];
  const latestOrder = orders[0];

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedDish) return;

    const totalAmount = selectedDish.price * quantity;
    placeOrderForCustomer(activePortalCustomer.id, {
      restaurantName: selectedDish.restaurantName || 'Foodix Partner',
      restaurantId: selectedDish.restaurantId || 'rest_001',
      amount: totalAmount,
      paymentMethod,
      deliveryAddress: `${activePortalCustomer.address}, ${activePortalCustomer.city}`,
      items: [
        {
          name: selectedDish.name,
          qty: quantity,
          price: selectedDish.price,
        },
      ],
    });

    setActiveTab('active_orders');
  };

  const handleReorder = (order) => {
    placeOrderForCustomer(activePortalCustomer.id, {
      restaurantName: order.restaurant,
      restaurantId: order.restaurantId,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
    });
    toast.success(`Re-ordered ${order.items?.[0]?.name || 'items'} successfully!`);
    setActiveTab('active_orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Customer Portal Top Nav */}
        <div className="bg-[#05291e] px-6 py-4 text-white flex items-center justify-between border-b border-emerald-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff5722] to-[#ff7a50] flex items-center justify-center font-black text-white text-base shadow-md">
              FDX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight">Foodix Customer Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Self-Service
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70">
                Logged in as <span className="font-bold text-white">{activePortalCustomer.fullName}</span> (@{activePortalCustomer.username})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logoutCustomerPortal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-200 text-white font-bold text-xs transition-colors cursor-pointer"
              title="Exit Customer Portal and return to Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
            <button
              type="button"
              onClick={logoutCustomerPortal}
              className="p-1.5 rounded-xl text-emerald-200/70 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portal Sub-Header Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('active_orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active_orders'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Order Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('order_food')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'order_food'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Food Now
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Orders ({orders.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivering to {activePortalCustomer.city}</span>
          </div>
        </div>

        {/* Portal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {activeTab === 'active_orders' && (
            /* TAB 1: LIVE ORDER TRACKING */
            <div className="space-y-6">
              {latestOrder ? (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-200/80 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-black text-base text-slate-900">
                          Order {latestOrder.id} is {latestOrder.status}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        From <span className="font-bold text-slate-700">{latestOrder.restaurant}</span> • {latestOrder.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Amount</span>
                      <span className="text-lg font-black text-emerald-700">₹{latestOrder.amount}</span>
                    </div>
                  </div>

                  {/* 4-Step Animated Delivery Stepper */}
                  <div className="py-3">
                    <p className="text-xs font-bold text-slate-700 mb-3">Live Order Progress:</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Confirmed */}
                      <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs font-bold">
                          ✓
                        </div>
                        <p className="font-bold text-slate-800 text-[11px]">Confirmed</p>
                        <span className="text-[10px] text-emerald-600 font-medium">1:10 PM</span>
                      </div>

                      {/* Step 2: Preparing */}
                      <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs font-bold">
                          ✓
                        </div>
                        <p className="font-bold text-slate-800 text-[11px]">Preparing</p>
                        <span className="text-[10px] text-emerald-600 font-medium">In Kitchen</span>
                      </div>

                      {/* Step 3: Out for Delivery */}
                      <div className="space-y-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-xs font-bold ${
                            latestOrder.status === 'Out for Delivery' || latestOrder.status === 'Delivered'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-800 animate-pulse'
                          }`}
                        >
                          <Bike className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-slate-800 text-[11px]">On the Way</p>
                        <span className="text-[10px] text-slate-500 font-medium">Rider assigned</span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="space-y-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                            latestOrder.status === 'Delivered'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {latestOrder.status === 'Delivered' ? '✓' : '4'}
                        </div>
                        <p className="font-bold text-slate-800 text-[11px]">Delivered</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {latestOrder.status === 'Delivered' ? 'Completed' : '15-20 mins'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Items in this delivery</p>
                    {latestOrder.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span>
                          {it.qty}x {it.name}
                        </span>
                        <span className="font-bold text-slate-900">₹{it.price * it.qty}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Delivery Address: {latestOrder.deliveryAddress}</span>
                      <span className="font-bold text-emerald-700">Paid via {latestOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <ChefHat className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-base">No Active Orders</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have no live food deliveries in transit right now. Order a delicious meal from top restaurants!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('order_food')}
                    className="px-5 py-2.5 rounded-2xl bg-[#ff5722] hover:bg-[#f44e19] text-white font-bold text-xs shadow-md transition-transform active:scale-98 cursor-pointer"
                  >
                    Browse Menu & Order Now
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'order_food' && (
            /* TAB 2: ORDER FOOD DIRECTLY IN PORTAL */
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div>
                <h4 className="font-black text-base text-slate-900">Order Food from Central Menu</h4>
                <p className="text-xs text-slate-500">
                  Select your favorite dish, pick quantity, and simulate an authentic customer order.
                </p>
              </div>

              {/* Select Dish */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Select Dish to Order:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allMenuItems.slice(0, 6).map((dish) => {
                    const isSelected = selectedDish?.id === dish.id;
                    return (
                      <div
                        key={dish.id}
                        onClick={() => setSelectedDish(dish)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{dish.name}</p>
                          <p className="text-[11px] text-slate-400">{dish.category}</p>
                          <p className="font-black text-xs text-emerald-700 mt-0.5">₹{dish.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Quantity</label>
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
                  <label className="block text-xs font-bold text-slate-700">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
                  >
                    <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                    <option value="UPI (GPay)">UPI (Google Pay)</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              {/* Order Summary & Submit Button */}
              {selectedDish && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Total: ₹{selectedDish.price * quantity} ({quantity}x {selectedDish.name})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Delivering to: {activePortalCustomer.address}, {activePortalCustomer.city}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold text-xs shadow-md transition-transform active:scale-98 cursor-pointer"
                  >
                    Confirm & Place Order (₹{selectedDish.price * quantity})
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'history' && (
            /* TAB 3: PAST ORDERS */
            <div className="space-y-4">
              <h4 className="font-black text-base text-slate-900">Order Receipts & History</h4>
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{ord.id}</span>
                        <span className="text-[11px] text-slate-400">• {ord.date}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {ord.restaurant} • {ord.items?.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="font-black text-sm text-slate-900">₹{ord.amount}</span>
                      <button
                        type="button"
                        onClick={() => handleReorder(ord)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff5722] font-bold text-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-order</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
