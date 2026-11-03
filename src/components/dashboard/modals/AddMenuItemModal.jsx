import React, { useState } from 'react';
import { X, Utensils, DollarSign } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';

export default function AddMenuItemModal() {
  const { isAddMenuItemOpen, setIsAddMenuItemOpen, handleAddMenuItem } = useDashboard();
  const [formData, setFormData] = useState({
    name: '',
    restaurant: 'Pizza Hut',
    category: 'Main Course',
    price: '',
    isVeg: true,
  });

  if (!isAddMenuItemOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;
    handleAddMenuItem(formData);
    setFormData({
      name: '',
      restaurant: 'Pizza Hut',
      category: 'Main Course',
      price: '',
      isVeg: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Utensils className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Add Menu Item</h3>
              <p className="text-[11px] text-orange-100">Add delicious item to catalog</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddMenuItemOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Item Dish Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Gourmet Truffle Cheese Burger"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Restaurant</label>
              <select
                value={formData.restaurant}
                onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              >
                <option value="Pizza Hut">Pizza Hut</option>
                <option value="Domino's Pizza">Domino's Pizza</option>
                <option value="KFC">KFC</option>
                <option value="Subway">Subway</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              >
              </input>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddMenuItemOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ff5e28] hover:bg-[#ff7539] text-white font-bold shadow-md transition-all cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
