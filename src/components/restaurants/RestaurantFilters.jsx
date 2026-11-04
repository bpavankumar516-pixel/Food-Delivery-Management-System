import React from 'react';
import { Search, ChevronDown, LayoutGrid, List, X } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function RestaurantFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCuisine,
    setSelectedCuisine,
    selectedRating,
    setSelectedRating,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  } = useRestaurants();

  const cuisineOptions = [
    'All Cuisines',
    'Burgers',
    'Pizza',
    'Indian',
    'Chinese',
    'Mexican',
    'Japanese',
    'Fast Food',
    'Others',
  ];

  const ratingOptions = ['All Ratings', '4.5 & above', '4.0 & above', '3.5 & above'];

  const sortOptions = ['Most Popular', 'Highest Rated', 'Delivery Time', 'Delivery Fee', 'Name (A-Z)'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs select-none">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0e4d3a] focus:ring-2 focus:ring-[#0e4d3a]/10 transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns + View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Cuisine Dropdown */}
          <div className="relative flex items-center bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <span className="text-slate-400 font-normal mr-1.5 hidden sm:inline">Cuisine</span>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {cuisineOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>

          {/* Rating Dropdown */}
          <div className="relative flex items-center bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <span className="text-slate-400 font-normal mr-1.5 hidden sm:inline">Rating</span>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {ratingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <span className="text-slate-400 font-normal mr-1.5 hidden sm:inline">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>

          {/* View Mode Toggle: Grid & List */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#ff5e28] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#ff5e28] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
