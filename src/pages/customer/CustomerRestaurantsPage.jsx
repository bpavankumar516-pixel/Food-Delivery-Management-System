import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Store, Leaf, SlidersHorizontal, X, MapPin, LocateFixed } from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import CustomerRestaurantCard from '../../components/customerPortal/CustomerRestaurantCard';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerRestaurantsPage() {
  const [searchParams] = useSearchParams();
  const {
    restaurants,
    preferences,
    liveLocation,
    selectedLocation,
    setIsLocationModalOpen,
  } = useCustomerPortal();

  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(
    searchParams.get('cuisine') || 'All'
  );
  const [minRating, setMinRating] = useState('All'); // 'All' | '4.0' | '4.5'
  const [maxDeliveryTime, setMaxDeliveryTime] = useState('All'); // 'All' | '35'
  const [maxFee, setMaxFee] = useState('All'); // 'All' | '35' | '50'
  const [pureVegOnly, setPureVegOnly] = useState(!!preferences.vegOnlyDefault);
  const [openOnly, setOpenOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') === 'rating' ? 'rating' : 'recommended'
  );
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFiltering, setIsFiltering] = useState(false);

  // Sync URL query params if user navigates via Home category/banner CTA
  useEffect(() => {
    const cuisineParam = searchParams.get('cuisine');
    const sortParam = searchParams.get('sort');
    if (cuisineParam) setSelectedCuisine(cuisineParam);
    if (sortParam === 'rating') setSortBy('rating');
  }, [searchParams]);

  // Brief skeleton shimmer + reset pagination when filters change
  useEffect(() => {
    setIsFiltering(true);
    setVisibleCount(12);
    const t = setTimeout(() => setIsFiltering(false), 180);
    return () => clearTimeout(t);
  }, [selectedCuisine, minRating, maxDeliveryTime, maxFee, pureVegOnly, openOnly, nearbyOnly, sortBy, query]);

  const cuisineOptions = useMemo(() => {
    const set = new Set(['All']);
    restaurants.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [restaurants]);

  const parseMaxMinutes = (str = '') => {
    const nums = String(str).match(/\d+/g);
    if (!nums) return 40;
    return parseInt(nums[nums.length - 1], 10) || 40;
  };

  const filteredRestaurants = useMemo(() => {
    const list = restaurants.filter((r) => {
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchCuisine = (r.cuisines || []).some((c) => c.toLowerCase().includes(q));
        const matchLoc = r.location?.toLowerCase().includes(q);
        if (!matchName && !matchCuisine && !matchLoc) return false;
      }

      if (selectedCuisine !== 'All') {
        const matchesCat = r.category?.toLowerCase() === selectedCuisine.toLowerCase();
        const matchesList = (r.cuisines || []).some(
          (c) => c.toLowerCase() === selectedCuisine.toLowerCase()
        );
        if (!matchesCat && !matchesList) return false;
      }

      if (pureVegOnly && !r.pureVeg) return false;
      if (openOnly && r.status !== 'Open') return false;
      if (nearbyOnly && liveLocation && !r.isNearby) return false;

      if (minRating !== 'All' && (r.rating || 0) < parseFloat(minRating)) return false;
      if (maxDeliveryTime === '35' && parseMaxMinutes(r.effectiveEta || r.deliveryTime) > 35) return false;
      const feeVal = r.effectiveDeliveryFee ?? r.deliveryFee ?? 40;
      if (maxFee === '35' && feeVal > 35) return false;
      if (maxFee === '50' && feeVal > 50) return false;

      return true;
    });

    const sorted = [...list];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'distance') {
      sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else if (sortBy === 'delivery-time') {
      sorted.sort(
        (a, b) =>
          parseMaxMinutes(a.effectiveEta || a.deliveryTime) -
          parseMaxMinutes(b.effectiveEta || b.deliveryTime)
      );
    } else if (sortBy === 'fee-low') {
      sorted.sort(
        (a, b) =>
          (a.effectiveDeliveryFee ?? a.deliveryFee ?? 40) -
          (b.effectiveDeliveryFee ?? b.deliveryFee ?? 40)
      );
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Open + Nearby first, then rating
      sorted.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'Open' ? -1 : 1;
        if (liveLocation && a.isNearby !== b.isNearby) return a.isNearby ? -1 : 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }
    return sorted;
  }, [
    restaurants,
    query,
    selectedCuisine,
    pureVegOnly,
    openOnly,
    nearbyOnly,
    liveLocation,
    minRating,
    maxDeliveryTime,
    maxFee,
    sortBy,
  ]);

  const visibleList = filteredRestaurants.slice(0, visibleCount);

  const resetFilters = () => {
    setQuery('');
    setSelectedCuisine('All');
    setMinRating('All');
    setMaxDeliveryTime('All');
    setMaxFee('All');
    setPureVegOnly(false);
    setOpenOnly(false);
    setNearbyOnly(false);
    setSortBy('recommended');
  };

  return (
    <CustomerLayout>
      <div className="space-y-5">
        {/* Hero Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#202A24] tracking-tight">
                Explore Restaurants
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium flex flex-wrap items-center gap-1.5">
                <span>{filteredRestaurants.length} partner kitchens</span>
                <span>•</span>
                {selectedLocation ? (
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-[#163A2D] hover:text-[#FF6B35] underline cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Near {selectedLocation}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-[#FF6B35] underline cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Set live location for distance & fees</span>
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#FF6B35] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurant, cuisine, or area..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#FF6B35]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cuisine Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {cuisineOptions.map((c) => {
            const active = selectedCuisine === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCuisine(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF6B35]/50'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#163A2D] mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters:
            </span>

            <button
              type="button"
              onClick={() => setPureVegOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                pureVegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Pure Veg</span>
            </button>

            <button
              type="button"
              onClick={() => setOpenOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                openOnly
                  ? 'bg-[#163A2D] text-white border-[#163A2D]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Open Now</span>
            </button>

            {liveLocation && (
              <button
                type="button"
                onClick={() => setNearbyOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  nearbyOnly
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Nearby Only</span>
              </button>
            )}

            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">Any Rating</option>
              <option value="4.0">Rating 4.0+</option>
              <option value="4.5">Rating 4.5+</option>
            </select>

            <select
              value={maxDeliveryTime}
              onChange={(e) => setMaxDeliveryTime(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">Any Delivery Time</option>
              <option value="35">Under 35 mins</option>
            </select>

            <select
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">Any Delivery Fee</option>
              <option value="35">Fee ≤ ₹35</option>
              <option value="50">Fee ≤ ₹50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#FFF8F0] border border-orange-200/70 text-xs font-bold text-[#202A24] cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              {liveLocation && <option value="distance">Sort: Nearest First</option>}
              <option value="rating">Sort: Top Rated</option>
              <option value="delivery-time">Sort: Fastest Delivery</option>
              <option value="fee-low">Sort: Lowest Delivery Fee</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Grid / Skeleton / Empty */}
        {isFiltering ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 p-3 space-y-3 animate-pulse"
              >
                <div className="h-40 rounded-xl bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-8 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : visibleList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <Store className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-black text-[#202A24]">No restaurants found</h3>
            <p className="text-xs text-slate-500">
              Try relaxing your rating, dietary, or delivery filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleList.map((rest) => (
                <CustomerRestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>

            {visibleCount < filteredRestaurants.length && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 8)}
                  className="px-6 py-2.5 rounded-full bg-white border border-[#163A2D] text-[#163A2D] hover:bg-[#163A2D] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Load More Restaurants ({filteredRestaurants.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
