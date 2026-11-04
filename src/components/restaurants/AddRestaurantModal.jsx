import React, { useState } from 'react';
import { X, Store, Check } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

const PRESET_IMAGES = [
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600' },
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600' },
  { label: 'Sushi', url: 'https://images.unsplash.com/photo-15798714944447-9811cf80d66c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Chinese', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600' },
  { label: 'Mexican', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=600' },
];

export default function AddRestaurantModal() {
  const { isAddModalOpen, setIsAddModalOpen, addRestaurant } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Burgers',
    cuisines: 'Burgers, Fast Food, Beverages',
    location: 'Koramangala, Bengaluru',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034',
    phone: '+91 80 4123 9988',
    deliveryTime: '25-35 mins',
    deliveryFee: '35',
    rating: '4.5',
    status: 'Open',
    image: PRESET_IMAGES[0].url,
    ownerName: 'Pavan Kumar',
  });

  if (!isAddModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addRestaurant({
      ...formData,
      cuisines: formData.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      deliveryFee: parseInt(formData.deliveryFee) || 35,
      rating: parseFloat(formData.rating) || 4.5,
    });

    // Reset form
    setFormData({
      name: '',
      category: 'Burgers',
      cuisines: 'Burgers, Fast Food, Beverages',
      location: 'Koramangala, Bengaluru',
      address: '80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034',
      phone: '+91 80 4123 9988',
      deliveryTime: '25-35 mins',
      deliveryFee: '35',
      rating: '4.5',
      status: 'Open',
      image: PRESET_IMAGES[0].url,
      ownerName: 'Pavan Kumar',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsAddModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add New Restaurant</h3>
              <p className="text-xs text-emerald-300/80">Register partner restaurant to Foodix network</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Restaurant Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Leon's Burgers & Wings"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium text-xs sm:text-sm"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Primary Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
              >
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Mexican">Mexican</option>
                <option value="Japanese">Japanese</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
              >
                <option value="Open">🟢 Open</option>
                <option value="Closed">🔴 Closed</option>
              </select>
            </div>
          </div>

          {/* Cuisine Tags */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Cuisines (comma separated)</label>
            <input
              type="text"
              value={formData.cuisines}
              onChange={(e) => setFormData({ ...formData, cuisines: e.target.value })}
              placeholder="e.g. Burgers, Fast Food, Beverages"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Location & Delivery Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Locality / Area</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Koramangala, Bengaluru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Delivery Time</label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                placeholder="e.g. 25-35 mins"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* Delivery Fee & Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                placeholder="40"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Initial Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Food Image Presets */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Select Cover Food Image</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                    formData.image === img.url
                      ? 'border-[#ff5e28] ring-2 ring-orange-400/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white font-bold py-0.5 text-center">
                    {img.label}
                  </span>
                  {formData.image === img.url && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ff5e28] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            >
              + Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
