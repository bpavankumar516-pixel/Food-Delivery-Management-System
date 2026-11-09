import React, { useState, useEffect } from 'react';
import {
  X,
  UtensilsCrossed,
  DollarSign,
  Upload,
  Check,
  AlertCircle,
  Leaf,
  Sparkles,
  Store,
  Clock,
  Flame,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRestaurants } from '../../context/RestaurantContext';

const PRESET_DISH_IMAGES = [
  { label: 'Margherita Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600' },
  { label: 'Chicken Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
  { label: 'White Sauce Pasta', url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=600' },
  { label: 'Hakka Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600' },
  { label: 'Masala Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600' },
  { label: 'Chocolate Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600' },
  { label: 'Pepperoni Pizza', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600' },
  { label: 'French Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600' },
];

export default function EditMenuItemModal({ isOpen, onClose, item }) {
  const { restaurants, updateMasterMenuItem } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Pizza',
    isVeg: true,
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    restaurantId: '',
    inStock: true,
    spicyLevel: 'Mild',
    prepTime: '15-20 mins',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Pizza',
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        price: item.price ? String(item.price) : '',
        originalPrice: item.originalPrice ? String(item.originalPrice) : '',
        description: item.description || '',
        image: item.image || PRESET_DISH_IMAGES[0].url,
        restaurantId: item.restaurantId || (restaurants[0]?.id || ''),
        inStock: item.inStock !== false,
        spicyLevel: item.spicyLevel || 'Mild',
        prepTime: item.prepTime || '15-20 mins',
      });
      setError('');
    }
  }, [item, restaurants]);

  if (!isOpen || !item) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Food item name is required.');
      return;
    }

    const priceNum = parseInt(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price in ₹.');
      return;
    }

    const assignedRest = restaurants.find((r) => r.id === formData.restaurantId);

    updateMasterMenuItem(item.id, {
      name: formData.name.trim(),
      category: formData.category,
      isVeg: !!formData.isVeg,
      price: priceNum,
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : Math.round(priceNum * 1.25),
      description: formData.description.trim(),
      image: formData.image,
      restaurantId: formData.restaurantId,
      restaurantName: assignedRest ? assignedRest.name : 'Foodix Kitchen',
      inStock: formData.inStock,
      spicyLevel: formData.spicyLevel,
      prepTime: formData.prepTime,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Edit Menu Item</h3>
              <p className="text-xs text-slate-500">Update dish details & restaurant link</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dish Image Preview & Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Food Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={formData.image}
                alt="Preview"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200';
                }}
              />
              <div className="flex-1 space-y-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Image (Max 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  placeholder="Or enter direct image URL..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Food Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Food Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10"
              placeholder="e.g. Margherita Pizza"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 leading-relaxed"
              placeholder="Describe delicious ingredients, spices, and preparation..."
            />
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
                placeholder="199"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="1"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-600 focus:outline-hidden focus:border-orange-500"
                placeholder="249"
              />
            </div>
          </div>

          {/* Category & Restaurant Assignment */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
              >
                <option value="Pizza">Pizza</option>
                <option value="Burger">Burger</option>
                <option value="Pasta">Pasta</option>
                <option value="South Indian">South Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Desserts">Desserts</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Restaurant
              </label>
              <select
                value={formData.restaurantId}
                onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Type & Availability */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Type
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="editIsVeg"
                    checked={formData.isVeg === true}
                    onChange={() => setFormData({ ...formData, isVeg: true })}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-emerald-700">● Veg</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="editIsVeg"
                    checked={formData.isVeg === false}
                    onChange={() => setFormData({ ...formData, isVeg: false })}
                    className="accent-rose-600 w-4 h-4"
                  />
                  <span className="text-rose-700">● Non-Veg</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-5 h-5 rounded-lg accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  {formData.inStock ? 'Available for Orders' : 'Marked Out of Stock'}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5e28] to-[#ff7539] hover:from-[#e04f1e] hover:to-[#ff5e28] text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
