import React, { useState } from 'react';
import { X, UtensilsCrossed, DollarSign, Check, Leaf } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { useRestaurants } from '../../../context/RestaurantContext';

export default function AddMenuItemModal() {
  const { isAddMenuItemOpen, setIsAddMenuItemOpen, handleAddMenuItem } = useDashboard();
  const { restaurants, addMenuItem } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    restaurantId: restaurants[0]?.id || 'rest_001',
    category: 'Main Course',
    price: '',
    isVeg: true,
    spicyLevel: 'Medium',
    description: '',
  });

  if (!isAddMenuItemOpen) return null;

  const currentRestaurant = restaurants.find((r) => r.id === formData.restaurantId);
  const isPureVegRestaurant = !!currentRestaurant?.pureVeg;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    const finalIsVeg = isPureVegRestaurant ? true : formData.isVeg;

    // 1. Add to Restaurant's real persistent menu
    addMenuItem(formData.restaurantId, {
      ...formData,
      isVeg: finalIsVeg,
      price: parseInt(formData.price),
    });

    // 2. Synchronize Dashboard stats
    handleAddMenuItem({
      name: formData.name,
      restaurant: currentRestaurant?.name || 'Restaurant',
      price: formData.price,
      isVeg: finalIsVeg,
    });

    // Reset and close
    setFormData({
      name: '',
      restaurantId: restaurants[0]?.id || 'rest_001',
      category: 'Main Course',
      price: '',
      isVeg: true,
      spicyLevel: 'Medium',
      description: '',
    });
    setIsAddMenuItemOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none">
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5e28] flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Add Menu Item</h3>
              <p className="text-[11px] text-emerald-300/80">Add delicious food item to restaurant catalog</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddMenuItemOpen(false)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Target Restaurant */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Select Restaurant *</label>
            <select
              value={formData.restaurantId}
              onChange={(e) => {
                const newRestId = e.target.value;
                const rest = restaurants.find((r) => r.id === newRestId);
                setFormData({
                  ...formData,
                  restaurantId: newRestId,
                  isVeg: rest?.pureVeg ? true : formData.isVeg,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category}) {r.pureVeg ? '🌱 Pure Veg' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dish Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Dish / Item Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Gourmet Truffle Cheese Burger"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* VEG vs NON-VEG DIETARY */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Dietary Type *</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isVeg: true })}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-2 ${
                  formData.isVeg
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5 bg-white shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
                <span className="text-xs">🟢 Pure Veg</span>
              </button>

              <button
                type="button"
                disabled={isPureVegRestaurant}
                onClick={() => !isPureVegRestaurant && setFormData({ ...formData, isVeg: false })}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center gap-2 ${
                  isPureVegRestaurant
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : !formData.isVeg
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-xs border-2 border-rose-600 flex items-center justify-center p-0.5 bg-white shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                </span>
                <span className="text-xs">
                  {isPureVegRestaurant ? 'Pure Veg Only' : '🔴 Non-Veg'}
                </span>
              </button>
            </div>
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Price (₹) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="249"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
              >
                <option value="Bestsellers">Bestsellers</option>
                <option value="Main Course">Main Course</option>
                <option value="Combos & Meals">Combos & Meals</option>
                <option value="Starters & Sides">Starters & Sides</option>
                <option value="Desserts & Beverages">Desserts & Beverages</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddMenuItemOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Save & Publish Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
