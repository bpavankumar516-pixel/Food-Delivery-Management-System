import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Receipt,
  User,
  Utensils,
  FileEdit,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDineIn } from '../../context/DineInContext';

export default function PosCart({ onOpenCustomerModal }) {
  const {
    cart,
    cartSummary,
    updateQuantity,
    clearCart,
    updateItemNotes,
    discount,
    applyDiscount,
    removeDiscount,
    selectedTable,
    customer,
    placeDineInOrder,
  } = useDineIn();

  const [couponCode, setCouponCode] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [itemNoteText, setItemNoteText] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'DINE10') {
      applyDiscount('DINE10', 'percentage', 10);
    } else if (code === 'DINE15') {
      applyDiscount('DINE15', 'percentage', 15);
    } else if (code === 'FLAT100') {
      applyDiscount('FLAT100', 'flat', 100);
    } else {
      toast.error('Invalid coupon! Try DINE10, DINE15, or FLAT100.');
    }
    setCouponCode('');
  };

  const handleSaveItemNotes = (itemId) => {
    updateItemNotes(itemId, itemNoteText);
    setEditingNotesId(null);
    setItemNoteText('');
    toast.success('Cooking instructions updated for item');
  };

  const handleConfirmOrder = () => {
    const createdOrder = placeDineInOrder();
    // After placement, prompt if they want to pay immediately
    if (createdOrder) {
      // Order placed successfully
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col h-full max-h-[calc(100vh-140px)] select-none">
      {/* 1. Header: Table Info & Walk-In Guest Badge */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-orange-50/50 via-white to-emerald-50/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-[#ff5722] text-white shadow-xs">
                {selectedTable?.name || 'Table 01'}
              </span>
              <span className="text-xs font-bold text-slate-500">
                ({selectedTable?.capacity || 2} Seater • {selectedTable?.section || 'Main Dining'})
              </span>
            </div>

            {/* Customer Pill */}
            <button
              type="button"
              onClick={onOpenCustomerModal}
              className="mt-2 group flex items-center gap-2 text-xs text-slate-700 hover:text-[#ff5722] cursor-pointer transition-colors"
              title="Click to edit guest name & party size"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-[#ff5722] flex items-center justify-center shrink-0">
                <User className="w-3 h-3" />
              </div>
              <span className="font-bold truncate max-w-[170px]">
                {customer?.name || 'Walk-in Guest'}
              </span>
              <span className="text-[11px] text-slate-400">
                ({customer?.partySize || selectedTable?.capacity || 2}p)
              </span>
              <span className="text-[10px] text-orange-600 underline font-semibold ml-0.5">Edit</span>
            </button>
          </div>

          {/* Clear Cart Button */}
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Clear all items in cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Cart Item List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-[180px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center text-slate-400 space-y-2.5">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <p className="font-black text-slate-700 text-sm">Cart is Empty</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                Click any dish on the menu to add items for {selectedTable?.name}
              </p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs font-black text-slate-800 mt-0.5">
                      ₹{item.price} <span className="text-[10px] text-slate-400 font-normal">each</span>
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, (item.qty || 1) - 1)}
                    className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-slate-900">
                    {item.qty || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                    className="w-6 h-6 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-[#ff5722] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Cooking Notes / Custom Instruction */}
              {editingNotesId === item.id ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, Extra crispy..."
                    value={itemNoteText}
                    onChange={(e) => setItemNoteText(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-300 focus:outline-none focus:border-[#ff5722]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveItemNotes(item.id)}
                    className="px-2 py-1 text-[10px] font-bold bg-[#064e3b] text-white rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNotesId(null)}
                    className="px-2 py-1 text-[10px] text-slate-500 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="truncate italic text-[10px] text-slate-500">
                    {item.notes ? `Note: "${item.notes}"` : 'No special notes'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotesId(item.id);
                      setItemNoteText(item.notes || '');
                    }}
                    className="text-[10px] font-semibold text-orange-600 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <FileEdit className="w-2.5 h-2.5" />
                    <span>{item.notes ? 'Edit note' : '+ Add note'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 3. Discount / Coupon Code Section */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {discount && discount.value > 0 ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Applied {discount.code} (-₹{cartSummary.discountAmount})</span>
            </span>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Promo Code (e.g. DINE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 uppercase font-semibold focus:outline-none focus:border-[#ff5722]"
              />
            </div>
            <button
              type="submit"
              disabled={cart.length === 0}
              className="px-3 py-1.5 bg-[#064e3b] hover:bg-[#043d2e] disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Apply
            </button>
          </form>
        )}

        {/* Quick Promo Presets */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <span>Quick:</span>
          <button
            type="button"
            onClick={() => applyDiscount('DINE10', 'percentage', 10)}
            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-orange-300 text-slate-700 cursor-pointer"
          >
            10% OFF
          </button>
          <button
            type="button"
            onClick={() => applyDiscount('FLAT100', 'flat', 100)}
            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-orange-300 text-slate-700 cursor-pointer"
          >
            ₹100 OFF
          </button>
        </div>
      </div>

      {/* 4. Financial Breakdown & Order Confirmation */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Item Subtotal ({cartSummary.itemCount} items)</span>
            <span className="font-semibold text-slate-800">₹{cartSummary.subtotal}</span>
          </div>

          {cartSummary.discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 font-semibold">
              <span>Discount ({discount.code})</span>
              <span>-₹{cartSummary.discountAmount}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>CGST (2.5%)</span>
            <span>₹{cartSummary.cgst}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>SGST (2.5%)</span>
            <span>₹{cartSummary.sgst}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-black text-slate-900">
            <span>Grand Total</span>
            <span className="text-xl text-[#064e3b]">₹{cartSummary.grandTotal}</span>
          </div>
        </div>

        {/* Order Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] hover:from-[#f4511e] hover:to-[#ff5722] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Receipt className="w-4 h-4" />
            <span>Confirm & Place Dine-In Order (₹{cartSummary.grandTotal})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <p className="text-[10px] text-slate-400 text-center font-medium">
            Table automatically occupied • Stored 100% locally on device
          </p>
        </div>
      </div>
    </div>
  );
}
