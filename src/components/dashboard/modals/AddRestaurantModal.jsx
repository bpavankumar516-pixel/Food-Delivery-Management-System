import React, { useState } from 'react';
import { X, Store, MapPin, Tag } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';

export default function AddRestaurantModal() {
  const { isAddRestaurantOpen, setIsAddRestaurantOpen, handleAddRestaurant } = useDashboard();
  const [formData, setFormData] = useState({
    name: '',
    cuisine: 'Fast Food, Burgers',
    location: 'Banjara Hills, Hyderabad',
    rating: '4.5',
  });

  if (!isAddRestaurantOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    handleAddRestaurant(formData);
    setFormData({
      name: '',
      cuisine: 'Fast Food, Burgers',
      location: 'Banjara Hills, Hyderabad',
      rating: '4.5',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Add New Restaurant</h3>
              <p className="text-[11px] text-emerald-200/80">Register partner restaurant to Foodix</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddRestaurantOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Restaurant Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Biryani Blues / Taco Bell"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Cuisine Speciality</label>
            <input
              type="text"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Location / City</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddRestaurantOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#05291e] hover:bg-[#084231] text-white font-bold shadow-md transition-all cursor-pointer"
            >
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
