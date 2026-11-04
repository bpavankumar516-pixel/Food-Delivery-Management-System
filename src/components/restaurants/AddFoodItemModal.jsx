import React, { useState, useEffect } from 'react';
import {
  X,
  UtensilsCrossed,
  DollarSign,
  Star,
  Flame,
  Check,
  AlertCircle,
  Leaf,
  Sparkles,
  Store,
} from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

const PRESET_DISH_IMAGES = [
  {
    label: 'Veg Burger',
    isVeg: true,
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Chicken Burger',
    isVeg: false,
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Veg Pizza',
    isVeg: true,
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Non-Veg Pizza',
    isVeg: false,
    url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Dum Biryani',
    isVeg: false,
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Paneer Biryani',
    isVeg: true,
    url: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Asian Noodles',
    isVeg: true,
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=450',
  },
  {
    label: 'Crispy Fries',
    isVeg: true,
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=450',
  },
];

export default function AddFoodItemModal({ isOpen, onClose, restaurantId }) {
  const { restaurants, addMenuItem } = useRestaurants();

  const [selectedRestId, setSelectedRestId] = useState(restaurantId || '');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    isVeg: true,
    price: '249',
    spicyLevel: 'Medium',
    isBestseller: false,
    inStock: true,
    description: '',
    image: PRESET_DISH_IMAGES[0].url,
  });

  const [error, setError] = useState('');

  // Synchronize restaurantId if passed as prop
  useEffect(() => {
    if (restaurantId) {
      setSelectedRestId(restaurantId);
    } else if (restaurants.length > 0 && !selectedRestId) {
      setSelectedRestId(restaurants[0].id);
    }
  }, [restaurantId, restaurants]);

  // Find current selected restaurant
  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId);
  const isPureVegRestaurant = !!currentRestaurant?.pureVeg;

  // If selected restaurant is pure veg, enforce isVeg = true
  useEffect(() => {
    if (isPureVegRestaurant && !formData.isVeg) {
      setFormData((prev) => ({ ...prev, isVeg: true }));
    }
  }, [isPureVegRestaurant, formData.isVeg]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a dish name');
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      setError('Please enter a valid price in ₹');
      return;
    }
    if (!selectedRestId) {
      setError('Please select a restaurant');
      return;
    }

    addMenuItem(selectedRestId, {
      ...formData,
      isVeg: isPureVegRestaurant ? true : formData.isVeg,
      price: parseInt(formData.price),
    });

    // Reset and close
    setFormData({
      name: '',
      category: 'Main Course',
      isVeg: true,
      price: '249',
      spicyLevel: 'Medium',
      isBestseller: false,
      inStock: true,
      description: '',
      image: PRESET_DISH_IMAGES[0].url,
    });
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between shrink-0 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5e28] text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Add New Food Item</h3>
              <p className="text-xs text-emerald-300/80 font-medium">
                {currentRestaurant ? `Adding to ${currentRestaurant.name}` : 'Create dish with Veg / Non-Veg specification'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Restaurant Selector (Only shown if restaurantId not fixed by parent) */}
          {!restaurantId && (
            <div>
              <label className="font-bold text-slate-800 block mb-1">Target Restaurant *</label>
              <select
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold text-xs cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.category} • {r.location}) {r.pureVeg ? '🌱 Pure Veg' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dish Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Dish / Item Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (error) setError('');
              }}
              placeholder="e.g. Crispy Smoked Chicken Zinger Burger"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-xs sm:text-sm"
            />
          </div>

          {/* VEG vs NON-VEG DIETARY SELECTOR (Key User Requirement!) */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Dietary Specification <span className="text-orange-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* VEG OPTION */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isVeg: true })}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-3 ${
                  formData.isVeg
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 opacity-80'
                }`}
              >
                {/* Authentic FSSAI Veg Symbol */}
                <div className="w-5 h-5 rounded-md border-2 border-emerald-600 flex items-center justify-center p-0.5 shrink-0 bg-white mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                    <span>🟢 Pure Veg</span>
                    {formData.isVeg && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5">
                    Plant-based, Dairy & Vegetarian
                  </div>
                </div>
              </button>

              {/* NON-VEG OPTION */}
              <button
                type="button"
                disabled={isPureVegRestaurant}
                onClick={() => {
                  if (!isPureVegRestaurant) {
                    setFormData({ ...formData, isVeg: false });
                  }
                }}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-3 ${
                  isPureVegRestaurant
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100'
                    : !formData.isVeg
                    ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 opacity-80'
                }`}
              >
                {/* Authentic FSSAI Non-Veg Symbol */}
                <div className="w-5 h-5 rounded-md border-2 border-rose-600 flex items-center justify-center p-0.5 shrink-0 bg-white mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
                    <span>🔴 Non-Veg</span>
                    {!formData.isVeg && !isPureVegRestaurant && (
                      <Check className="w-3.5 h-3.5 text-rose-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-rose-700/80 font-medium mt-0.5">
                    {isPureVegRestaurant
                      ? 'Restaurant is 100% Pure Veg'
                      : 'Meat, Poultry or Seafood'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Menu Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer"
              >
                <option value="Bestsellers">★ Bestsellers</option>
                <option value="Main Course">Main Course</option>
                <option value="Combos & Meals">Combos & Meals</option>
                <option value="Starters & Sides">Starters & Sides</option>
                <option value="Desserts & Beverages">Desserts & Beverages</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Price (₹) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="249"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Spicy Level & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Spicy Level</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['None', 'Mild', 'Medium', 'Hot'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, spicyLevel: lvl })}
                    className={`py-1.5 px-2 rounded-xl text-center border text-[11px] font-semibold transition-all cursor-pointer ${
                      formData.spicyLevel === lvl
                        ? 'bg-[#05291e] text-white border-[#05291e]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 'Hot' ? '🌶️ Hot' : lvl === 'Medium' ? '🌶️ Med' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock & Bestseller Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>In Stock (Available for orders immediately)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded-md border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Highlight as Chef Bestseller</span>
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Mouthwatering Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Crisp golden patty layered with spicy chipotle glaze, cheddar melt, and fresh herbs."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium resize-none text-xs"
            />
          </div>

          {/* Dish Image Presets */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Select Dish Photo Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_DISH_IMAGES.filter((p) => (isPureVegRestaurant ? p.isVeg : true)).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      image: preset.url,
                      isVeg: isPureVegRestaurant ? true : preset.isVeg,
                    })
                  }
                  className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                    formData.image === preset.url
                      ? 'border-[#ff5e28] ring-2 ring-orange-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white font-bold py-0.5 text-center truncate px-1">
                    {preset.label}
                  </span>
                  {formData.image === preset.url && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ff5e28] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Image URL */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Or Custom Dish Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-mono text-[11px]"
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
              className="px-5 py-2.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>+ Add to Restaurant Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
