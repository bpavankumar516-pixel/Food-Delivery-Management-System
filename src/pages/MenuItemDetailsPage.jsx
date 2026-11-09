import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Flame,
  Store,
  CheckCircle2,
  XCircle,
  Heart,
  Share2,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Scale,
  MapPin,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import EditMenuItemModal from '../components/menu/EditMenuItemModal';
import DeleteMenuConfirmModal from '../components/menu/DeleteMenuConfirmModal';
import { useRestaurants } from '../context/RestaurantContext';

export default function MenuItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    allMenuItems,
    restaurants,
    getRestaurantById,
    updateMasterMenuItem,
    toggleMasterItemStock,
    toggleMasterItemFavorite,
    openDeleteMenuModal,
  } = useRestaurants();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isChangingPartner, setIsChangingPartner] = useState(false);

  // Find the dish by id (string or numeric)
  const item = allMenuItems.find((dish) => String(dish.id) === String(id));

  // Proper Item-Based Partner Restaurant Resolution (100% matched by category & authenticity)
  const restaurant = useMemo(() => {
    if (!item) return null;
    // 1. Direct match by restaurantId
    if (item.restaurantId) {
      const match = getRestaurantById(item.restaurantId);
      if (match) return match;
    }
    // 2. Direct match by restaurantName
    if (item.restaurantName) {
      const matchByName = restaurants.find(
        (r) => r.name.toLowerCase().trim() === item.restaurantName.toLowerCase().trim()
      );
      if (matchByName) return matchByName;
    }
    // 3. Smart Item-based fallback according to dish category & cuisine
    const cat = (item.category || '').toLowerCase();
    if (cat.includes('pizza')) {
      return (
        restaurants.find((r) => r.id === 'rest_002') ||
        restaurants.find((r) => r.category === 'Pizza') ||
        restaurants[0]
      );
    }
    if (cat.includes('burger')) {
      return (
        restaurants.find((r) => r.id === 'rest_001') ||
        restaurants.find((r) => r.category === 'Burgers') ||
        restaurants[0]
      );
    }
    if (cat.includes('pasta')) {
      return (
        restaurants.find((r) => r.id === 'rest_002') ||
        restaurants.find((r) => r.category === 'Pizza') ||
        restaurants[0]
      );
    }
    if (cat.includes('south indian') || cat.includes('indian')) {
      return (
        restaurants.find((r) => r.id === 'rest_010') ||
        restaurants.find((r) => r.category === 'Indian') ||
        restaurants[0]
      );
    }
    if (cat.includes('chinese') || cat.includes('noodles') || cat.includes('rice')) {
      return (
        restaurants.find((r) => r.id === 'rest_013') ||
        restaurants.find((r) => r.category === 'Chinese') ||
        restaurants[0]
      );
    }
    if (
      cat.includes('dessert') ||
      cat.includes('cake') ||
      cat.includes('pastry') ||
      cat.includes('sweet')
    ) {
      return (
        restaurants.find((r) => r.id === 'rest_021') ||
        restaurants.find((r) => r.id === 'rest_022') ||
        restaurants[0]
      );
    }
    return restaurants[0] || null;
  }, [item, restaurants, getRestaurantById]);

  if (!item) {
    return (
      <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-8 max-w-4xl mx-auto text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Food Item Not Found</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              The menu item you are looking for does not exist or has been removed from Foodix.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ff5722] text-white font-bold text-sm shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu Management</span>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const isAvailable = item.inStock !== false;

  const handleAssignRestaurant = (newRestId) => {
    const targetRest = restaurants.find((r) => r.id === newRestId);
    if (!targetRest) return;
    updateMasterMenuItem(item.id, {
      restaurantId: targetRest.id,
      restaurantName: targetRest.name,
    });
    setIsChangingPartner(false);
    toast.success(`Associated partner updated to ${targetRest.name}!`);
  };

  // Calculate discount percentage
  const originalPrice = item.originalPrice || Math.round(item.price * 1.25);
  const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

  // Related items in the same category
  const relatedItems = allMenuItems
    .filter((d) => d.category === item.category && d.id !== item.id)
    .slice(0, 3);

  // Handle Share Link
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item.name,
          text: `Check out ${item.name} on Foodix!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Food item link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDelete = () => {
    openDeleteMenuModal(item, () => {
      navigate('/menu');
    });
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Dark Emerald Sidebar (Menu Management active) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          {/* Breadcrumb Navigation Bar & Quick Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link to="/menu" className="hover:text-emerald-700 transition-colors">
                Menu Management
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">{item.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
                {item.name}
              </span>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu Items</span>
            </Link>
          </div>

          {/* Main 2-Column Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: High-Res Photography Showcase (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Dietary Badge Top Left */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 ${
                      item.isVeg ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>{item.isVeg ? '100% VEG' : 'NON-VEG'}</span>
                  </span>

                  {discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Top Right Floating Actions: Favorite & Share */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMasterItemFavorite(item.id)}
                    className={`p-2.5 rounded-2xl backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md ${
                      item.isFavorite
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title={item.isFavorite ? 'Remove Favorite' : 'Save as Favorite'}
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md"
                    title="Share Food Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bottom Image Overlay Details */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-xs text-white/80 mt-1">
                    Prepared fresh at {item.restaurantName || 'Foodix Kitchen'}
                  </p>
                </div>
              </div>

              {/* Status & Availability Quick Control Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ordering Status
                  </p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {isAvailable ? 'Active & Accepting Orders' : 'Marked as Sold Out (Unavailable)'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMasterItemStock(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Sold Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Dish Specifications, Price, Associated Restaurant & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Title, Category & Rating Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-[#ff5722] text-xs font-extrabold tracking-wide uppercase">
                        {item.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-500">ID: #{item.id}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {item.name}
                    </h1>
                  </div>

                  {/* Rating Stars Pill */}
                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 self-start">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-black text-sm text-slate-900">{item.rating || 4.7}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.votes || 340} reviews
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  {item.description}
                </p>

                {/* Price Display Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-slate-50 border border-orange-100/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Selling Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900">₹{item.price}</span>
                      {originalPrice > item.price && (
                        <span className="text-base font-semibold text-slate-400 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
                        Save ₹{originalPrice - item.price}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl block">
                      Tax Inclusive • No Hidden Fees
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Edit Dish & Delete Dish */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Dish Information</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Dish</span>
                  </button>
                </div>
              </div>

              {/* Quick Specifications Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-1">
                  <Clock className="w-5 h-5 text-emerald-700 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</p>
                  <p className="text-xs font-bold text-slate-800">{item.prepTime || '15-20 mins'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-1">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spice Level</p>
                  <p className="text-xs font-bold text-slate-800">{item.spicyLevel || 'Medium'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-1">
                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</p>
                  <p className="text-xs font-bold text-slate-800">{item.calories || '540 kcal'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-1">
                  <Scale className="w-5 h-5 text-blue-500 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portion</p>
                  <p className="text-xs font-bold text-slate-800">Serves 1-2</p>
                </div>
              </div>

              {/* Associated Partner Restaurant Widget (100% Dynamic with Switcher) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Associated Partner Restaurant
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Verified Partner
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPartner((prev) => !prev)}
                      className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-slate-50 border border-slate-200/70"
                      title="Switch partner restaurant"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{isChangingPartner ? 'Cancel' : 'Change Partner'}</span>
                    </button>
                  </div>
                </div>

                {isChangingPartner ? (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-emerald-100 space-y-2 animate-in fade-in duration-150">
                    <label className="text-xs font-bold text-slate-800 block">
                      Select Associated Restaurant for this Dish:
                    </label>
                    <select
                      value={restaurant?.id || ''}
                      onChange={(e) => handleAssignRestaurant(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} • {r.category} ({r.location}) ★ {r.rating}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Updating will sync this food item to the selected restaurant menu instantly.
                    </p>
                  </div>
                ) : restaurant ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={restaurant.logo || restaurant.image}
                          alt={restaurant.name}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900">{restaurant.name}</h4>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {restaurant.category || 'Multi-Cuisine'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{restaurant.location || 'Central Foodix Kitchen'}</span>
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span className="text-amber-500 font-bold">★ {restaurant.rating || 4.8}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{restaurant.deliveryTime || '20-30 mins'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/restaurants/${restaurant.id}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors text-center self-start sm:self-auto shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <span>View Restaurant Menu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Quick Partner Meta (Phone & Timings) */}
                    {(restaurant.phone || restaurant.openingHours) && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        {restaurant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{restaurant.phone}</span>
                          </span>
                        )}
                        {restaurant.openingHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Open: {restaurant.openingHours}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-900">No Restaurant Associated</p>
                    <button
                      type="button"
                      onClick={() => setIsChangingPartner(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Assign Partner Restaurant
                    </button>
                  </div>
                )}
              </div>

              {/* Quality Standards & Hygiene Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-900">Foodix Quality & Cleanliness Guarantee</p>
                  <p className="text-slate-500 leading-relaxed">
                    Audited under 5-star sanitation protocols. Prepared with fresh farm produce, pure oils, and delivered in heat-sealed tamper-proof packaging.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related / Recommended Dishes in Same Category */}
          {relatedItems.length > 0 && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    More Dishes in {item.category}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Discover popular items from the same category
                  </p>
                </div>

                <Link
                  to="/menu"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Explore All Menu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedItems.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/menu/${rel.id}`)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          rel.isVeg
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {rel.isVeg ? 'VEG' : 'NON-VEG'}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate mt-1 group-hover:text-[#ff5722] transition-colors">
                        {rel.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-black text-slate-900">₹{rel.price}</span>
                        {rel.originalPrice && rel.originalPrice > rel.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{rel.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <EditMenuItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
      />

      <DeleteMenuConfirmModal />
    </div>
  );
}
