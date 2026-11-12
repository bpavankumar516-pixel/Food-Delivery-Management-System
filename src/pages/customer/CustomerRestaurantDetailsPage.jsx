import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Leaf,
  Search,
  Tag,
  Copy,
  Store,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import FoodItemCardCustomer from '../../components/customerPortal/FoodItemCardCustomer';
import { useCustomerPortal } from '../../context/CustomerPortalContext';
import menuService from '../../services/menuService';

export default function CustomerRestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    restaurants,
    getMergedMenuForRestaurant,
    favoriteRestaurantIds,
    toggleFavoriteRestaurant,
    recordRestaurantView,
    coupons,
  } = useCustomerPortal();

  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState('all'); // 'all' | 'veg' | 'non-veg' | 'bestseller'

  const restaurant = restaurants.find((r) => r.id === id);

  // Record view history & trigger single network fetch for restaurant menu
  useEffect(() => {
    if (!id) return;
    recordRestaurantView(id);
    menuService.getMenu(id).catch(() => {});
  }, [id, recordRestaurantView]);

  const menuItems = useMemo(
    () => (restaurant ? getMergedMenuForRestaurant(restaurant.id) : []),
    [restaurant, getMergedMenuForRestaurant]
  );

  const categories = useMemo(() => {
    const set = new Set(['All']);
    menuItems.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'non-veg' && item.isVeg) return false;
      if (dietFilter === 'bestseller' && !item.isBestseller) return false;

      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase().trim();
        if (
          !item.name.toLowerCase().includes(q) &&
          !(item.description || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietFilter, menuSearch]);

  const activeCoupons = useMemo(
    () => coupons.filter((c) => c.status === 'Active').slice(0, 3),
    [coupons]
  );

  if (!restaurant) {
    return (
      <CustomerLayout>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <Store className="w-12 h-12 mx-auto text-slate-300" />
          <h2 className="text-xl font-black text-[#202A24]">Restaurant Not Found</h2>
          <p className="text-xs text-slate-500">
            This partner kitchen may have been removed or is unavailable.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-5 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
          >
            Back to Restaurants
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const isFav = favoriteRestaurantIds.includes(restaurant.id);
  const isClosed = restaurant.status === 'Closed';

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate('/customer/restaurants')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Restaurants</span>
        </button>

        {/* Restaurant Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="relative h-52 sm:h-64 w-full bg-slate-900">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className={`w-full h-full object-cover ${isClosed ? 'grayscale opacity-70' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <button
              type="button"
              onClick={() => toggleFavoriteRestaurant(restaurant.id)}
              className={`absolute top-4 right-4 px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all ${
                isFav
                  ? 'bg-[#FF6B35] text-white shadow-md'
                  : 'bg-white/90 text-[#202A24] hover:text-[#FF6B35]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Saved' : 'Save'}</span>
            </button>

            <div className="absolute bottom-4 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isClosed ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {isClosed ? 'Currently Closed' : 'Open for Delivery'}
                  </span>
                  {restaurant.pureVeg && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                      <Leaf className="w-3 h-3" />
                      Pure Veg
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {restaurant.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 font-medium">
                  {(restaurant.cuisines || [restaurant.category]).join(' • ')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-2xl bg-[#163A2D] border border-white/15 text-center">
                  <div className="flex items-center gap-1 justify-center font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{restaurant.rating || '4.5'}</span>
                  </div>
                  <p className="text-[10px] text-emerald-200">{restaurant.reviews || '500+'} ratings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-[#FFF8F0]/60 border-t border-orange-100/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                {restaurant.address || restaurant.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#163A2D]" />
                {restaurant.deliveryTime || '30-40 mins'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E7EFE8] text-[#163A2D] font-bold">
              Delivery Fee: ₹{restaurant.deliveryFee ?? 35}
            </span>
          </div>
        </div>

        {isClosed && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              This restaurant is currently marked Closed. You can browse the menu, and ordering will resume once it reopens.
            </span>
          </div>
        )}

        {/* Available Offers Strip */}
        {activeCoupons.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeCoupons.map((cp) => (
              <div
                key={cp.id}
                onClick={() => {
                  navigator.clipboard.writeText(cp.code);
                  toast.success(`Coupon "${cp.code}" copied!`);
                }}
                className="p-3.5 rounded-2xl bg-white border border-dashed border-orange-300 hover:border-[#FF6B35] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#FF6B35]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{cp.offerTag}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                    Use <span className="font-mono font-bold text-[#163A2D]">{cp.code}</span> • Min ₹
                    {cp.minOrderAmount || 0}
                  </p>
                </div>
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Menu Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#FF6B35] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search dishes inside this restaurant..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFF8F0]/70 border border-slate-200 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Dishes' },
                { id: 'veg', label: 'Pure Veg' },
                { id: 'non-veg', label: 'Non-Veg' },
                { id: 'bestseller', label: 'Bestsellers', icon: Sparkles },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDietFilter(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    dietFilter === d.id
                      ? 'bg-[#163A2D] text-white border-[#163A2D]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#FFF8F0] text-[#202A24] hover:bg-orange-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenu.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-2">
            <p className="font-bold text-sm text-[#202A24]">No matching menu items</p>
            <p className="text-xs text-slate-500">Try clearing your dish search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map((dish) => (
              <FoodItemCardCustomer
                key={dish.id}
                dish={dish}
                restaurantStatus={restaurant.status}
              />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
