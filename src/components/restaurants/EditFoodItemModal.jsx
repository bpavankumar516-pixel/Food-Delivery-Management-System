import React, { useState, useEffect } from 'react';
import { X, Edit3, DollarSign, Star, Check, AlertCircle } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function EditFoodItemModal({ isOpen, onClose, item, restaurantId }) {
  const { updateMenuItem, getRestaurantById } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    isVeg: true,
    price: '',
    spicyLevel: 'Medium',
    isBestseller: false,
    inStock: true,
    description: '',
    image: '',
  });

  const restaurant = getRestaurantById(restaurantId);
  const isPureVegRestaurant = !!restaurant?.pureVeg;

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Main Course',
        isVeg: isPureVegRestaurant ? true : !!item.isVeg,
        price: item.price ? String(item.price) : '199',
        spicyLevel: item.spicyLevel || 'Medium',
        isBestseller: !!item.isBestseller,
        inStock: item.inStock !== false,
        description: item.description || '',
        image: item.image || '',
      });
    }
  }, [item, isPureVegRestaurant]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    updateMenuItem(restaurantId, item.id, {
      ...formData,
      isVeg: isPureVegRestaurant ? true : formData.isVeg,
      price: parseInt(formData.price),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ff5e28] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Edit3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Edit Food Item</h3>
              <p className="text-xs text-orange-100">Update dish details & stock availability</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Dish Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          {/* VEG vs NON-VEG DIETARY */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Dietary Specification</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isVeg: true })}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-2.5 ${
                  formData.isVeg
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-4 h-4 rounded-xs border-2 border-emerald-600 flex items-center justify-center bg-white">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <span>🟢 Pure Veg</span>
              </button>

              <button
                type="button"
                disabled={isPureVegRestaurant}
                onClick={() => !isPureVegRestaurant && setFormData({ ...formData, isVeg: false })}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-2.5 ${
                  isPureVegRestaurant
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : !formData.isVeg
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="w-4 h-4 rounded-xs border-2 border-rose-600 flex items-center justify-center bg-white">
                  <div className="w-2 h-2 rounded-full bg-rose-600" />
                </div>
                <span>🔴 Non-Veg</span>
              </button>
            </div>
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Price (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              >
                <option value="Bestsellers">Bestsellers</option>
                <option value="Main Course">Main Course</option>
                <option value="Combos & Meals">Combos & Meals</option>
                <option value="Starters & Sides">Starters & Sides</option>
                <option value="Desserts & Beverages">Desserts & Beverages</option>
              </select>
            </div>
          </div>

          {/* Stock Availability Toggle */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Stock Availability</div>
              <div className="text-[11px] text-slate-500">
                {formData.inStock ? 'Available for customer ordering' : 'Currently Marked as Sold Out'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium resize-none text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            >
              Update Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
