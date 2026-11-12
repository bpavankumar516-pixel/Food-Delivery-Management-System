import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  Headphones,
  Package,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  UtensilsCrossed,
  Grid2x2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import CustomerRestaurantCard from '../../components/customerPortal/CustomerRestaurantCard';
import FoodItemCardCustomer from '../../components/customerPortal/FoodItemCardCustomer';
import { useAuth } from '../../context/AuthContext';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

const HERO_SLIDES = [
  {
    headlineTop: 'Good Food',
    headlineAccent: 'Good Mood!',
    subtitle: 'Delicious food delivered fresh to your doorstep in minutes.',
    cta: 'Order Now',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=700',
    link: '/customer/restaurants',
  },
  {
    headlineTop: 'Hot & Fresh',
    headlineAccent: 'Biryani!',
    subtitle: 'Handcrafted Hyderabadi dum biryanis and royal kebabs.',
    cta: 'Explore Biryani',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=700',
    link: '/customer/restaurants?cuisine=Indian',
  },
  {
    headlineTop: 'Weekend',
    headlineAccent: 'Burger Fest!',
    subtitle: 'Double-patty flame-grilled burgers & crispy loaded fries.',
    cta: 'Browse Burgers',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=700',
    link: '/customer/restaurants?cuisine=Burgers',
  },
];

const QUICK_CATEGORIES = [
  {
    label: 'Pizza',
    query: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=250',
  },
  {
    label: 'Burger',
    query: 'Burgers',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=250',
  },
  {
    label: 'Biryani',
    query: 'Biryani',
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=250',
  },
  {
    label: 'Pasta',
    query: 'Pasta',
    image:
      'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=250',
  },
];

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedLocation,
    restaurants,
    allPlatformDishes,
    coupons,
    myOrders,
    activeOrders,
    recentlyViewedIds,
  } = useCustomerPortal();

  const [slideIdx, setSlideIdx] = useState(0);
  const currentSlide = HERO_SLIDES[slideIdx];

  const activeCoupons = useMemo(
    () => coupons.filter((c) => c.status === 'Active'),
    [coupons]
  );
  const topCoupon = activeCoupons[0] || coupons[0];
  const secondaryCoupon = activeCoupons[1] || activeCoupons[0] || coupons[1];

  const popularRestaurants = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4),
    [restaurants]
  );

  const recommendedRestaurants = useMemo(() => {
    const recentSet = new Set(recentlyViewedIds);
    const recentlyViewed = recentlyViewedIds
      .map((id) => restaurants.find((r) => r.id === id))
      .filter(Boolean);
    const others = restaurants.filter((r) => !recentSet.has(r.id) && r.status === 'Open');
    return [...recentlyViewed, ...others].slice(0, 4);
  }, [restaurants, recentlyViewedIds]);

  const popularDishes = useMemo(
    () =>
      allPlatformDishes
        .filter((d) => d.inStock !== false)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4),
    [allPlatformDishes]
  );

  const handleCopyCoupon = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied! Apply it at checkout.`);
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Preparing':
      case 'Confirmed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Welcome Subtitle Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#202A24] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Foodie'}!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Delivering hot & fresh across <span className="font-bold text-[#163A2D]">{selectedLocation}</span>
            </p>
          </div>
          {activeOrders.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(`/customer/tracking/${encodeURIComponent(activeOrders[0].id)}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#163A2D] hover:bg-[#0f2920] text-white text-xs font-bold shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
              <span>
                Active Order {activeOrders[0].id} ({activeOrders[0].status}) • Track Live
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1. Hero Section Row (Left Forest Green Banner + Right Warm Cream Offer Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left 8 Cols: Dark Forest Green Hero Banner */}
          <div className="lg:col-span-8 relative rounded-3xl bg-gradient-to-r from-[#163A2D] via-[#133328] to-[#0b2019] p-6 sm:p-8 text-white overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 max-w-md space-y-2.5">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                <span className="block">{currentSlide.headlineTop}</span>
                <span className="text-[#FF6B35] block mt-1">{currentSlide.headlineAccent}</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {currentSlide.subtitle}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(currentSlide.link)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Dots */}
            <div className="relative z-10 flex items-center gap-2 mt-5">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.headlineAccent}
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === slideIdx ? 'w-6 bg-[#FF6B35]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Right-Side High-Res Food Photography */}
            <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[48%] pointer-events-none">
              <img
                src={currentSlide.image}
                alt={currentSlide.headlineAccent}
                className="w-full h-full object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#133328] via-[#133328]/40 to-transparent" />
            </div>
          </div>

          {/* Right 4 Cols: Warm Cream First-Order Promo Card */}
          <div className="lg:col-span-4 relative rounded-3xl bg-gradient-to-br from-[#FFF8F0] via-[#ffefe0] to-[#fde5cf] border border-orange-200/70 p-6 overflow-hidden shadow-2xs flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 space-y-2 max-w-[65%]">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 text-[#FF6B35] text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Featured Offer
              </span>
              <h3 className="text-2xl font-black text-[#202A24] leading-tight">
                {topCoupon?.offerTag || 'Flat 50% OFF'}
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                {topCoupon?.title || 'On your first order across partner kitchens'}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyCoupon(topCoupon?.code || 'WELCOME50')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#163A2D] hover:bg-[#0f2920] text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                >
                  <span>Use Code: {topCoupon?.code || 'WELCOME50'}</span>
                  <Copy className="w-3 h-3 text-emerald-300" />
                </button>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=350"
              alt="Biryani bowl"
              className="absolute -right-8 -bottom-6 w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white/60 pointer-events-none"
            />
          </div>
        </div>

        {/* 2. Four Quick Feature Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              title: 'Live Tracking',
              subtitle: 'Track your order in real-time',
              icon: Truck,
              bg: 'bg-[#E7EFE8]',
              color: 'text-[#163A2D]',
              to: '/customer/tracking',
            },
            {
              title: 'Exclusive Offers',
              subtitle: 'Save more with coupons',
              icon: Tag,
              bg: 'bg-orange-50',
              color: 'text-[#FF6B35]',
              to: '/customer/offers',
            },
            {
              title: 'Top Rated',
              subtitle: 'Best rated restaurants',
              icon: Star,
              bg: 'bg-amber-50',
              color: 'text-amber-500',
              to: '/customer/restaurants?sort=rating',
            },
            {
              title: '24/7 Support',
              subtitle: "We're here to help",
              icon: Headphones,
              bg: 'bg-[#E7EFE8]',
              color: 'text-[#163A2D]',
              to: '/customer/support',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.title}
                type="button"
                onClick={() => navigate(feat.to)}
                className="bg-white hover:bg-[#FFF8F0]/60 rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full ${feat.bg} ${feat.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-xs sm:text-sm text-[#202A24] truncate">
                      {feat.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{feat.subtitle}</p>
                  </div>
                </div>
                <span className="w-7 h-7 rounded-full bg-[#FFF8F0] text-[#FF6B35] flex items-center justify-center shrink-0 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Middle Split Grid: Popular Restaurants (7 cols) + Your Recent Orders (5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* Popular Restaurants */}
          <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E7EFE8] text-[#163A2D] flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-[#202A24]">Popular Restaurants</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/restaurants')}
                className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-3.5">
              {popularRestaurants.map((rest) => (
                <CustomerRestaurantCard key={rest.id} restaurant={rest} compact={true} />
              ))}
            </div>
          </div>

          {/* Your Recent Orders */}
          <div className="xl:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E7EFE8] text-[#163A2D] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-[#202A24]">Your Recent Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/orders')}
                className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2 bg-[#FFF8F0]/50 rounded-2xl border border-dashed border-orange-200">
                <Package className="w-8 h-8 text-[#FF6B35]/60" />
                <p className="text-xs font-bold text-[#202A24]">No orders placed yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Order from your favorite restaurants to see live updates here!
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {myOrders.slice(0, 3).map((ord) => {
                  const restObj = restaurants.find(
                    (r) => r.id === ord.restaurantId || r.name === ord.restaurant
                  );
                  return (
                    <div
                      key={ord.id}
                      onClick={() =>
                        navigate(`/customer/tracking/${encodeURIComponent(ord.id)}`)
                      }
                      className="p-3 rounded-2xl bg-[#faf8f4] hover:bg-[#FFF8F0] border border-slate-200/70 hover:border-[#FF6B35]/40 transition-all flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            restObj?.image ||
                            'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={ord.restaurant}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-black text-xs text-[#202A24] truncate">
                            {ord.restaurant}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {ord.id} • ₹{(ord.grandTotal || ord.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getOrderStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                        <span className="text-[10.5px] text-slate-400 hidden sm:inline">
                          {ord.placedAt || 'Recent'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 4. Bottom Split Grid: Special Offers (7 cols) + Quick Categories (5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* Special Offers */}
          <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-[#202A24]">Special Offers</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/offers')}
                className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative rounded-2xl bg-gradient-to-r from-[#163A2D] via-[#123126] to-[#0a1d16] p-5 text-white overflow-hidden flex items-center justify-between gap-4">
              <div className="relative z-10 space-y-1.5">
                <h4 className="text-lg sm:text-xl font-black tracking-tight">
                  Get{' '}
                  <span className="text-[#FF6B35]">
                    {secondaryCoupon?.offerTag || '₹100 OFF'}
                  </span>
                </h4>
                <p className="text-xs text-emerald-100/85">
                  {secondaryCoupon?.title || 'On orders above ₹499 across Foodix partners'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(secondaryCoupon?.code || 'FOOD100')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer"
                  >
                    <span>Use Code: {secondaryCoupon?.code || 'FOOD100'}</span>
                    <Copy className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300"
                alt="Special Offer Dish"
                className="hidden sm:block w-28 h-24 rounded-2xl object-cover border border-white/15 shrink-0"
              />
            </div>
          </div>

          {/* Quick Categories */}
          <div className="xl:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[#202A24]">Quick Categories</h3>
              <button
                type="button"
                onClick={() => navigate('/customer/search')}
                className="text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
              >
                Explore All
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() =>
                    navigate(`/customer/search?q=${encodeURIComponent(cat.query)}`)
                  }
                  className="bg-[#faf8f4] hover:bg-[#FFF8F0] border border-slate-200/70 hover:border-[#FF6B35]/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-11 h-11 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-[#202A24]">{cat.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => navigate('/customer/restaurants')}
                className="bg-[#E7EFE8] hover:bg-[#163A2D] text-[#163A2D] hover:text-white rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-white/80 text-[#163A2D] flex items-center justify-center">
                  <Grid2x2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">More</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Popular Food Items (Instant Add to Cart) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#202A24]">Popular Food Items</h3>
                <p className="text-[11px] text-slate-500">Top-ordered dishes across Foodix partners</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/search')}
              className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularDishes.map((dish) => (
              <FoodItemCardCustomer
                key={dish.id}
                dish={dish}
                restaurantStatus={dish.restaurantStatus}
              />
            ))}
          </div>
        </div>

        {/* 6. Recommended & Recently Viewed Restaurants */}
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E7EFE8] text-[#163A2D] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#202A24]">
                  Recommended & Recently Viewed
                </h3>
                <p className="text-[11px] text-slate-500">Curated based on your browsing history</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedRestaurants.map((rest) => (
              <CustomerRestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
