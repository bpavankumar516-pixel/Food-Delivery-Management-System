import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Plus,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
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
  const { restaurants, addMenuItem, allMenuItems, getRestaurantMenu } = useRestaurants();

  // Mode: 'menu_management' (Pick existing master dishes) or 'custom' (Create new dish)
  const [modalMode, setModalMode] = useState('menu_management');

  const [selectedRestId, setSelectedRestId] = useState(restaurantId || '');

  // Menu Management Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Form State
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
  }, [restaurantId, restaurants, selectedRestId]);

  // Find current selected restaurant
  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId);
  const isPureVegRestaurant = !!currentRestaurant?.pureVeg;

  // Dishes currently in this restaurant
  const existingDishes = useMemo(() => {
    if (!selectedRestId) return [];
    return getRestaurantMenu(selectedRestId) || [];
  }, [selectedRestId, getRestaurantMenu]);

  // Set of lowercase names for quick lookup
  const existingNamesSet = useMemo(() => {
    return new Set(existingDishes.map((d) => (d.name || '').toLowerCase().trim()));
  }, [existingDishes]);

  // If selected restaurant is pure veg, enforce isVeg = true
  useEffect(() => {
    if (isPureVegRestaurant && !formData.isVeg) {
      setFormData((prev) => ({ ...prev, isVeg: true }));
      setDietaryFilter('veg');
    }
  }, [isPureVegRestaurant, formData.isVeg]);

  // Filtered Central Menu Items with strict deduplication
  const filteredMasterItems = useMemo(() => {
    const seen = new Set();
    return allMenuItems.filter((dish) => {
      if (!dish) return false;
      const key = (dish.name || dish.id || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);

      // Pure Veg constraint
      if (isPureVegRestaurant && !dish.isVeg) return false;

      // Dietary filter (All, Veg only, Non-Veg only)
      if (dietaryFilter === 'veg' && !dish.isVeg) return false;
      if (dietaryFilter === 'non-veg' && dish.isVeg) return false;

      // Category filter
      if (selectedCategory !== 'All' && dish.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.description?.toLowerCase().includes(q);
        const matchCat = dish.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [allMenuItems, isPureVegRestaurant, dietaryFilter, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Quick 1-click Add from Central Menu Management (with deduplication guard)
  const handleAddFromMenu = (dish) => {
    if (!selectedRestId) {
      setError('Please select a restaurant first.');
      return;
    }

    if (existingNamesSet.has(dish.name.toLowerCase().trim())) {
      toast.info(`"${dish.name}" is already in this restaurant's menu!`);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    addMenuItem(selectedRestId, {
      id: dish.id,
      name: dish.name,
      category: dish.category,
      isVeg: dish.isVeg,
      price: dish.price,
      originalPrice: dish.originalPrice || Math.round(dish.price * 1.25),
      description: dish.description,
      image: dish.image,
      spicyLevel: dish.spicyLevel || 'Mild',
      prepTime: dish.prepTime || '15-20 mins',
      calories: dish.calories || '500 kcal',
      inStock: true,
      rating: dish.rating || 4.7,
      isBestseller: dish.isBestseller || false,
    });

    toast.success(`Added "${dish.name}" to ${currentRestaurant?.name || 'restaurant'} menu!`);
    setTimeout(() => setIsSubmitting(false), 400);
  };

  // Submit Handler for Custom Dish Creation (with deduplication guard)
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a dish name');
      return;
    }
    if (existingNamesSet.has(formData.name.toLowerCase().trim())) {
      setError(`"${formData.name}" is already in this restaurant's menu.`);
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

    if (isSubmitting) return;
    setIsSubmitting(true);

    addMenuItem(selectedRestId, {
      ...formData,
      isVeg: isPureVegRestaurant ? true : formData.isVeg,
      price: parseInt(formData.price),
    });

    toast.success(`Created & added "${formData.name}" to ${currentRestaurant?.name || 'restaurant'}!`);

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
    setIsSubmitting(false);
    onClose();
  };

  const categories = ['All', 'Pizza', 'Burger', 'Pasta', 'South Indian', 'Chinese', 'Desserts', 'Main Course'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between shrink-0 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5e28] text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Add Dish to Restaurant</h3>
              <p className="text-xs text-emerald-300/80 font-medium">
                {currentRestaurant ? `Target: ${currentRestaurant.name}` : 'Select a partner restaurant'}
                {isPureVegRestaurant && ' • 🌱 Pure Veg Only'}
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

        {/* Tab Switcher: Add from Menu Management vs Create Custom */}
        <div className="px-5 pt-3.5 pb-2 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalMode('menu_management')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              modalMode === 'menu_management'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add from Menu Management</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-[#ff5722] text-[10px] font-black">
              {allMenuItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('custom')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              modalMode === 'custom'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#ff5722]" />
            <span>Create Custom Dish</span>
          </button>
        </div>

        {/* Target Restaurant Selector (if opened without fixed restaurantId) */}
        {!restaurantId && (
          <div className="px-5 pt-3 bg-white">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Assign to Restaurant:
            </label>
            <select
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category} • {r.location}) {r.pureVeg ? '🌱 Pure Veg' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MODE 1: PICK FROM MENU MANAGEMENT */}
        {modalMode === 'menu_management' && (
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-3.5">
            {/* Search & Dietary Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Veg / Non-Veg Dietary Filter Buttons (Key User Requirement!) */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dietaryFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All Dishes
                  </button>

                  <button
                    type="button"
                    onClick={() => setDietaryFilter('veg')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      dietaryFilter === 'veg'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Pure Veg</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPureVegRestaurant}
                    onClick={() => setDietaryFilter('non-veg')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      dietaryFilter === 'non-veg'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : isPureVegRestaurant
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Non-Veg</span>
                  </button>
                </div>

                <span className="text-[11px] font-bold text-slate-400">
                  {filteredMasterItems.length} Dishes
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#ff5722] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Pure Veg Indicator Banner */}
              {isPureVegRestaurant && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Showing 100% Pure Vegetarian items suitable for {currentRestaurant?.name}.</span>
                </div>
              )}
            </div>

            {/* Menu Management Dishes List */}
            <div className="space-y-2 flex-1">
              {filteredMasterItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No menu dishes match your search.</p>
                </div>
              ) : (
                filteredMasterItems.map((dish) => {
                  const isAlreadyAdded = existingNamesSet.has(dish.name.toLowerCase().trim());

                  return (
                    <div
                      key={dish.id}
                      className="p-3 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white shadow-2xs flex items-center justify-between gap-3 transition-all"
                    >
                      {/* Left: Dish thumbnail + info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                          <span
                            className={`absolute top-1 left-1 px-1 py-0.2 rounded-xs text-[9px] font-black ${
                              dish.isVeg ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}
                          >
                            {dish.isVeg ? 'V' : 'NV'}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {dish.name}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {dish.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
                            {dish.description}
                          </p>
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="font-black text-xs text-slate-900">₹{dish.price}</span>
                            {dish.originalPrice && dish.originalPrice > dish.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{dish.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Add / In Menu Status Button */}
                      <div className="shrink-0">
                        {isAlreadyAdded ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Menu</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleAddFromMenu(dish)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Menu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer close button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Showing {filteredMasterItems.length} dishes from Central Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: CREATE CUSTOM DISH FORM */}
        {modalMode === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
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

            {/* VEG vs NON-VEG DIETARY SELECTOR */}
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
                  <div className="w-5 h-5 rounded-md border-2 border-emerald-600 flex items-center justify-center p-0.5 shrink-0 bg-white mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                      <span>Pure Veg</span>
                      {formData.isVeg && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5">
                      Plant-based & Vegetarian
                    </div>
                  </div>
                </button>

                {/* NON-VEG OPTION */}
                <button
                  type="button"
                  disabled={isPureVegRestaurant}
                  onClick={() => setFormData({ ...formData, isVeg: false })}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-3 ${
                    !formData.isVeg
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 opacity-80'
                  } ${isPureVegRestaurant ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="w-5 h-5 rounded-md border-2 border-rose-600 flex items-center justify-center p-0.5 shrink-0 bg-white mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
                      <span>Non-Veg</span>
                      {!formData.isVeg && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="text-[10px] text-rose-700/80 font-medium mt-0.5">
                      {isPureVegRestaurant ? 'Not Allowed in Pure Veg' : 'Chicken, Mutton, Fish, Egg'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold cursor-pointer"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Burger">Burger</option>
                  <option value="Pasta">Pasta</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Price (₹) *</label>
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
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Crisp patty layered with special herbs, gourmet cheese, and fresh produce."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium resize-none text-xs"
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
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] disabled:opacity-50 text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : '+ Save Dish to Restaurant'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
