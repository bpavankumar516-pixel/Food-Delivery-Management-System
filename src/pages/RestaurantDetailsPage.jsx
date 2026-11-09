import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Heart,
  Share2,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  UtensilsCrossed,
  Sparkles,
  Search,
  Navigation,
  Copy,
  Check,
  AlertTriangle,
  Plus,
  Leaf,
  Flame,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import EditRestaurantModal from '../components/restaurants/EditRestaurantModal';
import DeleteConfirmModal from '../components/restaurants/DeleteConfirmModal';
import DeleteMenuConfirmModal from '../components/menu/DeleteMenuConfirmModal';
import AddFoodItemModal from '../components/restaurants/AddFoodItemModal';
import EditFoodItemModal from '../components/restaurants/EditFoodItemModal';
import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getRestaurantById,
    getRestaurantMenu,
    toggleStatus,
    toggleFavorite,
    openEditModal,
    openDeleteModal,
    openDeleteMenuModal,
    toggleItemStock,
    deleteMenuItem,
  } = useRestaurants();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'overview' | 'reviews' | 'analytics'
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg' | 'bestseller'
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return (
      <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-8 max-w-4xl mx-auto text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Restaurant Not Found</h2>
            <p className="text-slate-500 text-sm">
              The restaurant you requested does not exist or has been removed from Foodix.
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ff5e28] text-white font-bold text-sm shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Restaurants</span>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const isOpen = restaurant.status === 'Open';

  // Copy address helper
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(restaurant.address || restaurant.location);
    setCopiedAddress(true);
    toast.success('Address copied to clipboard!');
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // Dynamic Menu Items from RestaurantContext (Persisted per restaurant)
  const menuCategories = [
    'All',
    'Bestsellers',
    'Main Course',
    'Combos & Meals',
    'Starters & Sides',
    'Desserts & Beverages',
  ];

  // Strictly deduplicated dynamic menu items (guarantees zero duplicate cards in UI)
  const rawMenuItems = getRestaurantMenu(restaurant?.id) || [];
  const seenDishKeys = new Set();
  const menuItems = rawMenuItems.filter((item) => {
    if (!item) return false;
    const key = (item.name || item.id || '').toLowerCase().trim();
    if (seenDishKeys.has(key)) return false;
    seenDishKeys.add(key);
    return true;
  });
  const isPureVegRestaurant = !!restaurant?.pureVeg;

  // Real-time calculated dietary counts
  const totalDishesCount = menuItems.length;
  const vegDishesCount = menuItems.filter((i) => i.isVeg).length;
  const nonVegDishesCount = menuItems.filter((i) => !i.isVeg).length;
  const outOfStockCount = menuItems.filter((i) => !i.inStock).length;

  const filteredMenu = menuItems.filter((item) => {
    // Dietary Filter (All, Veg only, Non-Veg only, Bestsellers)
    if (dietaryFilter === 'veg' && !item.isVeg) return false;
    if (dietaryFilter === 'non-veg' && item.isVeg) return false;
    if (dietaryFilter === 'bestseller' && !item.isBestseller) return false;

    // Menu Category Filter
    if (selectedMenuCategory !== 'All' && item.category !== selectedMenuCategory) return false;

    // Search query
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Dark Emerald Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header with Search, Notifications, Profile */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Inner Page Container */}
        <main className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1720px] w-full mx-auto pb-12">
          {/* Top Bar: Breadcrumb + Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => navigate('/restaurants')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Restaurants</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                {restaurant.name}
              </span>
            </div>

            {/* Quick Actions in Top Bar */}
            <div className="flex items-center gap-2">
              {/* Toggle Live Status Button */}
              <button
                type="button"
                onClick={() => toggleStatus(restaurant.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {isOpen ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{isOpen ? 'Open for Orders' : 'Currently Closed'}</span>
              </button>

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => openEditModal(restaurant)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {/* Delete Button (Triggers Custom Modal - NO alert/confirm!) */}
              <button
                type="button"
                onClick={() =>
                  openDeleteModal(restaurant, () => {
                    navigate('/restaurants');
                  })
                }
                className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs"
                title="Delete Restaurant"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Showcase Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-lg border border-slate-200/50">
            {/* Cover Image Background */}
            <div className="h-64 sm:h-76 md:h-84 w-full relative">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

              {/* Top Badges overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
                      isOpen ? 'bg-[#00875a]' : 'bg-[#e11d48]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full bg-white ${isOpen ? 'animate-pulse' : ''}`} />
                    <span>{isOpen ? 'Open Now' : 'Closed'}</span>
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Partner</span>
                  </span>

                  {restaurant.pureVeg && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
                      🌱 100% Pure Veg
                    </span>
                  )}
                </div>

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      restaurant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Identity Overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-end gap-3.5 sm:gap-5">
                  <img
                    src={restaurant.logo}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-4 border-white shadow-xl bg-white shrink-0"
                  />
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                      {restaurant.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-200">
                      <span className="font-bold text-emerald-300">{restaurant.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{restaurant.location}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-mono">FSSAI: 11223344556677</span>
                    </div>
                  </div>
                </div>

                {/* Cuisine Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.cuisines?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="bg-slate-900/90 border-t border-white/10 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Customer Rating</p>
                <p className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating}</span>
                  <span className="text-xs text-slate-400 font-normal">({restaurant.reviews} reviews)</span>
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="text-[11px] text-slate-400 font-medium">Average Delivery Time</p>
                <p className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{restaurant.deliveryTime}</span>
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="text-[11px] text-slate-400 font-medium">Delivery Fee</p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">
                  {restaurant.formattedFee}
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="text-[11px] text-slate-400 font-medium">Average Cost for Two</p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">
                  ₹450 approx
                </p>
              </div>
            </div>
          </div>

          {/* Main 2-Column Section: Left Tabbed Content (8 cols) + Right Map & Manager Panel (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Content Column (8 cols) */}
            <div className="xl:col-span-8 space-y-5 flex flex-col">
              {/* Tab Switcher */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'menu', label: 'Menu & Dishes' },
                  { id: 'overview', label: 'About & Standards' },
                  { id: 'reviews', label: 'Customer Reviews' },
                  { id: 'analytics', label: 'Performance Analytics' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#05291e] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Menu & Signature Dishes */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  {/* Menu Control Header & Quick Actions */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                            Restaurant Menu & Dishes
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {totalDishesCount} Items
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Manage authentic recipes, pricing, stock availability, and Veg/Non-Veg classifications
                        </p>
                      </div>

                      {/* + Add Food Item Button */}
                      <button
                        type="button"
                        onClick={() => setIsAddDishModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Food Item</span>
                      </button>
                    </div>

                    {/* Pure Veg Banner if restaurant is 100% Pure Veg */}
                    {isPureVegRestaurant && (
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-teal-50 border border-emerald-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Leaf className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                              <span>100% Certified Pure Vegetarian Kitchen</span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="text-[11px] text-emerald-700 font-medium">
                              All dishes are prepared adhering strictly to Satvik green standards with zero meat, poultry, or seafood.
                            </div>
                          </div>
                        </div>
                        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                          Pure Veg Certified
                        </span>
                      </div>
                    )}

                    {/* Dietary Filters & Search Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                      {/* Dietary Filter Switcher (Key User Requirement!) */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
                        <button
                          type="button"
                          onClick={() => setDietaryFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            dietaryFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All ({totalDishesCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => setDietaryFilter('veg')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            dietaryFilter === 'veg'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {/* FSSAI Veg Icon */}
                          <span className="w-3.5 h-3.5 rounded-xs border-2 border-current flex items-center justify-center p-0.5 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          </span>
                          <span>Veg Only ({vegDishesCount})</span>
                        </button>

                        {!isPureVegRestaurant && (
                          <button
                            type="button"
                            onClick={() => setDietaryFilter('non-veg')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              dietaryFilter === 'non-veg'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            {/* FSSAI Non-Veg Icon */}
                            <span className="w-3.5 h-3.5 rounded-xs border-2 border-current flex items-center justify-center p-0.5 bg-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            </span>
                            <span>Non-Veg ({nonVegDishesCount})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDietaryFilter('bestseller')}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            dietaryFilter === 'bestseller'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Bestsellers</span>
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          placeholder="Search dish by name or ingredients..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                        />
                      </div>
                    </div>

                    {/* Menu Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1 border-t border-slate-100">
                      {menuCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedMenuCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                            selectedMenuCategory === cat
                              ? 'bg-[#05291e] text-white shadow-2xs font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dishes Grid */}
                  {filteredMenu.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredMenu.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between select-none group ${
                            !item.inStock ? 'opacity-75 bg-slate-50/70' : ''
                          }`}
                        >
                          <div>
                            <div className="flex gap-3.5">
                              {/* Dish Thumbnail with Badges */}
                              <div
                                onClick={() => navigate(`/menu/${item.id}`)}
                                className="relative w-28 h-26 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 cursor-pointer"
                                title={`View details for ${item.name}`}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src =
                                      item.isVeg
                                        ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400'
                                        : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                                {!item.inStock && (
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-1 text-center">
                                    <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase">
                                      Sold Out
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Dish Information */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Authentic FSSAI Veg / Non-Veg Indicator */}
                                  <div
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-extrabold ${
                                      item.isVeg
                                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                        : 'border-rose-600 text-rose-700 bg-rose-50'
                                    }`}
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center p-0.5 bg-white ${
                                        item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                        }`}
                                      />
                                    </span>
                                    <span>{item.isVeg ? 'VEG' : 'NON-VEG'}</span>
                                  </div>

                                  {/* Bestseller Badge */}
                                  {item.isBestseller && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      <span>Bestseller</span>
                                    </span>
                                  )}

                                  {/* Spicy Level Badge */}
                                  {item.spicyLevel && item.spicyLevel !== 'None' && (
                                    <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                                      {item.spicyLevel === 'Hot' ? '🌶️ Hot' : '🌶️ Med'}
                                    </span>
                                  )}
                                </div>

                                <h4
                                  onClick={() => navigate(`/menu/${item.id}`)}
                                  className="font-extrabold text-sm text-slate-900 leading-tight group-hover:text-[#ff5e28] transition-colors cursor-pointer"
                                  title={`View details for ${item.name}`}
                                >
                                  {item.name}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Price, Rating & In-Stock Manager Toggle */}
                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-black text-slate-900">₹{item.price}</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{item.rating}</span>
                                <span className="text-slate-400 font-normal">({item.votes})</span>
                              </div>
                            </div>

                            {/* Action Tools: Stock Toggle, Edit, Delete */}
                            <div className="flex items-center gap-1.5">
                              {/* Real-time In Stock Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleItemStock(restaurant.id, item.id)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                  item.inStock
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                }`}
                                title="Click to toggle In Stock vs Sold Out"
                              >
                                {item.inStock ? '🟢 In Stock' : '⚪ Sold Out'}
                              </button>

                              {/* Edit Dish Button */}
                              <button
                                type="button"
                                onClick={() => setEditingDish(item)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Edit dish details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Dish Button */}
                              <button
                                type="button"
                                onClick={() => openDeleteMenuModal(item)}
                                className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove dish from menu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty Dishes Search/Filter State */
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3 shadow-2xs">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <UtensilsCrossed className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900">No dishes match your filter</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try changing the dietary preference (Veg / Non-Veg), choosing a different category, or adding a new food item.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDietaryFilter('all');
                            setSelectedMenuCategory('All');
                            setMenuSearch('');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Clear Filters
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddDishModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          + Add New Dish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: About & Standards */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
                  <div>
                    <h3 className="font-black text-base text-slate-900 mb-2">About {restaurant.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {restaurant.name} is one of Foodix's premier culinary partners in {restaurant.location}, celebrated for its commitment to hygiene, culinary excellence, and rapid order fulfillment. All kitchen staff undergo daily health protocols, and ingredients are sourced locally from certified organic vendors.
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Hygiene Certified</h4>
                      <p className="text-[11px] text-slate-500">5-Star Kitchen Sanitation rating audited by Foodix QA.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Lightning Preparation</h4>
                      <p className="text-[11px] text-slate-500">Average prep time under 14 minutes per delivery order.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Tamper-Proof Packaging</h4>
                      <p className="text-[11px] text-slate-500">100% biodegradable heat-sealed insulated containers.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Customer Reviews */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Customer Ratings & Reviews</h3>
                      <p className="text-xs text-slate-500">Verified reviews from verified Foodix consumers</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">{restaurant.rating} / 5</div>
                        <div className="text-[11px] text-slate-400">{restaurant.reviews} total reviews</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Star className="w-6 h-6 fill-amber-400" />
                      </div>
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-3.5">
                    {[
                      {
                        name: 'Aarav Mehta',
                        rating: 5,
                        date: 'Yesterday',
                        comment: 'Super fast delivery and the food was piping hot! The packaging was great and food tasted amazing.',
                      },
                      {
                        name: 'Deepika Nair',
                        rating: 4.5,
                        date: '3 days ago',
                        comment: 'Very consistent quality. One of our go-to restaurants in Koramangala. Highly recommended!',
                      },
                    ].map((rev, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{rev.name}</span>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Performance Analytics */}
              {activeTab === 'analytics' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                  <h3 className="font-black text-base text-slate-900">Weekly Performance Statistics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Orders This Week</p>
                      <p className="text-xl font-black text-slate-900 mt-1">342</p>
                      <span className="text-[10px] text-emerald-600 font-bold">↑ 14% vs last week</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Weekly Revenue</p>
                      <p className="text-xl font-black text-slate-900 mt-1">₹1,18,450</p>
                      <span className="text-[10px] text-emerald-600 font-bold">↑ 18% growth</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Avg Prep Time</p>
                      <p className="text-xl font-black text-slate-900 mt-1">12.4 min</p>
                      <span className="text-[10px] text-emerald-600 font-bold">Fastest in zone</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Cancellation Rate</p>
                      <p className="text-xl font-black text-slate-900 mt-1">0.8%</p>
                      <span className="text-[10px] text-emerald-600 font-bold">Excellent score</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Location Map & Contact Panel (4 cols) */}
            <div className="xl:col-span-4 space-y-5 flex flex-col">
              {/* Interactive Location Map Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Location & Map</h3>
                      <p className="text-[11px] text-slate-400">Live coordinates & radius</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${restaurant.name} ${restaurant.address || restaurant.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Simulated Real-Time Graphic Map Container */}
                <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-slate-200 bg-[#e5e9ec] group shadow-inner">
                  {/* Styled Map Background Grid & Roads */}
                  <svg className="w-full h-full opacity-60" viewBox="0 0 400 240">
                    {/* Water / Greenery */}
                    <rect width="400" height="240" fill="#e8ece9" />
                    <path d="M 0,160 Q 150,180 260,110 T 400,100" fill="none" stroke="#c4d5e7" strokeWidth="24" />
                    <rect x="20" y="20" width="80" height="60" rx="8" fill="#d2e3d5" />
                    <rect x="280" y="140" width="90" height="70" rx="8" fill="#d2e3d5" />

                    {/* Road Network */}
                    <path d="M 0,50 L 400,70" stroke="#ffffff" strokeWidth="8" />
                    <path d="M 0,120 L 400,130" stroke="#ffffff" strokeWidth="12" />
                    <path d="M 120,0 L 140,240" stroke="#ffffff" strokeWidth="10" />
                    <path d="M 280,0 L 260,240" stroke="#ffffff" strokeWidth="8" />
                    <path d="M 50,0 Q 200,120 350,240" stroke="#fed7aa" strokeWidth="6" />
                  </svg>

                  {/* Delivery Radius Circle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 rounded-full border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 animate-pulse" />
                  </div>

                  {/* Pulsing Location Pin matching reference */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl bg-[#ff5e28] text-white p-1 shadow-xl flex items-center justify-center border-2 border-white transform -translate-y-2 hover:scale-110 transition-transform">
                        <img
                          src={restaurant.logo}
                          alt=""
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-md -mt-1" />
                    </div>
                  </div>

                  {/* Badge on Map */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs border border-slate-200">
                    📍 {restaurant.location}
                  </div>
                </div>

                {/* Physical Address Details */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150/70 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {restaurant.name}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {restaurant.address || `${restaurant.location}, Bengaluru - 560034`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAddress ? 'Address Copied!' : 'Copy Full Address'}</span>
                  </button>
                </div>
              </div>

              {/* Management & Contact Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-sm text-slate-900">Partner Details</h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Store Manager</span>
                    <span className="font-bold text-slate-800">{restaurant.ownerName || 'Pavan Kumar'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Contact Phone</span>
                    <a
                      href={`tel:${restaurant.phone || '+91 80 4123 4567'}`}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{restaurant.phone || '+91 80 4123 4567'}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Support Email</span>
                    <span className="font-mono text-[11px] text-slate-700">support@foodix.com</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Delivery Radius</span>
                    <span className="font-bold text-slate-800">8.5 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <EditRestaurantModal />
      <DeleteConfirmModal />
      <DeleteMenuConfirmModal />
      <AddFoodItemModal
        isOpen={isAddDishModalOpen}
        onClose={() => setIsAddDishModalOpen(false)}
        restaurantId={restaurant.id}
      />
      <EditFoodItemModal
        isOpen={!!editingDish}
        onClose={() => setEditingDish(null)}
        item={editingDish}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
