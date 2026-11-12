import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, History, Flame, X, Leaf, Trash2 } from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import CustomerRestaurantCard from '../../components/customerPortal/CustomerRestaurantCard';
import FoodItemCardCustomer from '../../components/customerPortal/FoodItemCardCustomer';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

const POPULAR_SEARCHES = [
  'Pizza',
  'Biryani',
  'Burger',
  'Pasta',
  'Dosa',
  'Chocolate Cake',
  'Noodles',
];

export default function CustomerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const {
    restaurants,
    allPlatformDishes,
    recentSearches,
    addSearchHistory,
    removeSearchTerm,
    clearSearchHistory,
  } = useCustomerPortal();

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'dishes' | 'restaurants'
  const [vegOnly, setVegOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'price-low' | 'price-high' | 'rating'

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    if (qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  const applySearchTerm = (term) => {
    setQuery(term);
    if (term.trim()) {
      addSearchHistory(term);
      setSearchParams({ q: term });
    } else {
      setSearchParams({});
    }
  };

  const matchedRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (vegOnly && !r.pureVeg) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        (r.cuisines || []).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [restaurants, query, vegOnly]);

  const matchedDishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allPlatformDishes.filter((d) => {
      if (vegOnly && !d.isVeg) return false;
      if ((d.price || 0) > maxPrice) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.restaurantName?.toLowerCase().includes(q)
      );
    });

    const sorted = [...list];
    if (sortBy === 'price-low') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price-high') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [allPlatformDishes, query, vegOnly, maxPrice, sortBy]);

  return (
    <CustomerLayout>
      <div className="space-y-5">
        {/* Search Hero */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#202A24]">
            Search Restaurants & Cravings
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              applySearchTerm(query);
            }}
            className="relative"
          >
            <Search className="w-5 h-5 text-[#FF6B35] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a dish (e.g., Margherita Pizza, Biryani) or restaurant name..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-[#FFF8F0] border border-orange-200/80 text-sm text-[#202A24] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35]"
            />
            {query && (
              <button
                type="button"
                onClick={() => applySearchTerm('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Recent & Popular Searches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearSearchHistory}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() => applySearchTerm(term)}
                        className="hover:text-[#FF6B35] cursor-pointer"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSearchTerm(term)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF6B35]" />
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => applySearchTerm(term)}
                    className="px-3 py-1 rounded-full bg-[#FFF8F0] border border-orange-200/70 hover:bg-[#FF6B35] hover:text-white text-xs font-bold text-[#202A24] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Tab Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All (${matchedRestaurants.length + matchedDishes.length})` },
              { id: 'dishes', label: `Dishes (${matchedDishes.length})` },
              { id: 'restaurants', label: `Restaurants (${matchedRestaurants.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#163A2D] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setVegOnly((v) => !v)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              Pure Veg
            </button>

            <label className="flex items-center gap-2 font-bold text-slate-600">
              <span>Max ₹{maxPrice}</span>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[#FF6B35] cursor-pointer"
              />
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {(activeTab === 'all' || activeTab === 'restaurants') && matchedRestaurants.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-[#202A24]">
              Matching Restaurants ({matchedRestaurants.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {matchedRestaurants.slice(0, activeTab === 'all' ? 4 : 24).map((rest) => (
                <CustomerRestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'dishes') && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-[#202A24]">
              Matching Dishes ({matchedDishes.length})
            </h2>
            {matchedDishes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center text-xs text-slate-500">
                No dishes match your search criteria. Try another keyword or raise the max price slider.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {matchedDishes.slice(0, 24).map((dish) => (
                  <FoodItemCardCustomer
                    key={dish.id}
                    dish={dish}
                    restaurantStatus={dish.restaurantStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
