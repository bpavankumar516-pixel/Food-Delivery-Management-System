import React, { useState } from 'react';
import {
  UtensilsCrossed,
  X,
  Image as ImageIcon,
  RotateCcw,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

const DEFAULT_CATEGORY_IMAGES = {
  Pizza: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
  Pasta: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=600',
  'South Indian': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600',
  Chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600',
  Desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600',
  Snacks: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=600',
};

const DEFAULT_CATEGORY_RESTAURANTS = {
  Pizza: 'rest_002', // Pizza Hut
  Burger: 'rest_001', // Burger King
  Pasta: 'rest_002', // Pizza Hut
  'South Indian': 'rest_010', // Haldiram's
  Chinese: 'rest_013', // Mainland China
  Desserts: 'rest_021', // Theobroma Patisserie
  Snacks: 'rest_001', // Burger King
};

export default function AddMenuItemPanel({ isOpen, onClose }) {
  const { restaurants, addMasterMenuItem } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    restaurantId: 'rest_002',
    isVeg: true,
    inStock: true,
    image: '',
  });

  const [showCustomPartner, setShowCustomPartner] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    const autoRest = DEFAULT_CATEGORY_RESTAURANTS[cat] || restaurants[0]?.id || 'rest_001';
    setFormData((prev) => ({
      ...prev,
      category: cat,
      restaurantId: autoRest,
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      restaurantId: 'rest_002',
      isVeg: true,
      inStock: true,
      image: '',
    });
    setError('');
    setShowCustomPartner(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a food name.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description.');
      return;
    }

    const priceNum = parseInt(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price in ₹.');
      return;
    }

    const finalImage =
      formData.image ||
      DEFAULT_CATEGORY_IMAGES[formData.category] ||
      DEFAULT_CATEGORY_IMAGES.Pizza;

    const assignedRestId =
      formData.restaurantId ||
      DEFAULT_CATEGORY_RESTAURANTS[formData.category] ||
      restaurants[0]?.id ||
      'rest_001';

    const assignedRest = restaurants.find((r) => r.id === assignedRestId);

    addMasterMenuItem({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceNum,
      category: formData.category,
      isVeg: formData.isVeg,
      inStock: formData.inStock,
      image: finalImage,
      restaurantId: assignedRestId,
      restaurantName: assignedRest ? assignedRest.name : 'Foodix Partner',
    });

    handleReset();
  };

  return (
    <div className="w-full xl:w-[360px] 2xl:w-[380px] bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 shrink-0 flex flex-col justify-between self-start sticky top-6">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="text-emerald-700">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-base tracking-tight text-slate-900">
              Add Menu Item
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Upload Food Image Zone */}
          <div>
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50'
                  : formData.image
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20'
              }`}
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="food-image-file-input"
              />

              {formData.image ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden group">
                  <img
                    src={formData.image}
                    alt="Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Upload Food Image</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to upload or drag and drop
                  </p>
                  <span className="text-[10px] text-slate-400">(JPG, PNG - Max 2MB)</span>
                </div>
              )}
            </label>
          </div>

          {/* Food Name * */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Food Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter food name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Description * */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50 leading-relaxed resize-none"
            />
          </div>

          {/* Price (₹) * and Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
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
          </div>

          {/* Optional Partner Restaurant Override (cleanly collapsible) */}
          {showCustomPartner && (
            <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Specific Partner Restaurant</label>
                <button
                  type="button"
                  onClick={() => setShowCustomPartner(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Hide
                </button>
              </div>
              <select
                value={formData.restaurantId}
                onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-emerald-600 cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type: Veg / Non-Veg Radio Buttons */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Type</label>
            <div className="flex items-center gap-6 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="radio"
                  name="dietaryType"
                  checked={formData.isVeg === true}
                  onChange={() => setFormData({ ...formData, isVeg: true })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Veg</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="radio"
                  name="dietaryType"
                  checked={formData.isVeg === false}
                  onChange={() => setFormData({ ...formData, isVeg: false })}
                  className="w-4 h-4 accent-rose-600 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Non-Veg</span>
                </span>
              </label>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-bold text-slate-700">Availability</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, inStock: !prev.inStock }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  formData.inStock ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={formData.inStock}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.inStock ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-slate-800">
                {formData.inStock ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Form Action Buttons matching reference */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6a38] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
