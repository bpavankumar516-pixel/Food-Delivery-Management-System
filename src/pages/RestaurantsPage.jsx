import React, { useState } from 'react';
import { Store, Plus, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RestaurantCard from '../components/restaurants/RestaurantCard';
import RestaurantFilters from '../components/restaurants/RestaurantFilters';
import RestaurantStatsWidget from '../components/restaurants/RestaurantStatsWidget';
import CuisineCategoriesWidget from '../components/restaurants/CuisineCategoriesWidget';
import RestaurantPromoWidget from '../components/restaurants/RestaurantPromoWidget';

// Modals
import AddRestaurantModal from '../components/restaurants/AddRestaurantModal';
import EditRestaurantModal from '../components/restaurants/EditRestaurantModal';
import RestaurantDetailsModal from '../components/restaurants/RestaurantDetailsModal';
import DeleteConfirmModal from '../components/restaurants/DeleteConfirmModal';

import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    filteredRestaurants,
    paginatedRestaurants,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    viewMode,
    setIsAddModalOpen,
  } = useRestaurants();

  // Calculate showing range e.g. "Showing 1 - 8 of 24 restaurants"
  const totalCount = filteredRestaurants.length;
  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Dark Emerald Sidebar (Sticky on Desktop, Drawer on Mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header with Search, Notifications, Messages, Profile */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Body Layout */}
        <main className="p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1720px] w-full mx-auto">
          {/* Top Title Bar matching reference image */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ff5e28] text-white flex items-center justify-center shadow-md shadow-orange-600/20 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Restaurants
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Manage and monitor all restaurants on your platform.
                </p>
              </div>
            </div>

            {/* + Add Restaurant Orange Button matching reference */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Restaurant</span>
            </button>
          </div>

          {/* Filter, Search & View Controls */}
          <RestaurantFilters />

          {/* 2-Column Main Workspace: Left Grid (9 cols) + Right Stats (3 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Main Restaurant Grid (9 cols) */}
            <div className="xl:col-span-9 space-y-5 flex flex-col">
              {paginatedRestaurants.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5'
                      : 'space-y-3.5'
                  }
                >
                  {paginatedRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                /* Empty Search/Filter State */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <SearchX className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">No restaurants match your criteria</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your search query, selecting different cuisine categories, or clearing filters.
                  </p>
                </div>
              )}

              {/* Pagination Row matching reference image */}
              <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                {/* Left: Showing range */}
                <div className="font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-800">{startIdx} - {endIdx}</span> of{' '}
                  <span className="font-bold text-slate-800">{totalCount}</span> restaurants
                </div>

                {/* Right: Page numbers */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#ff5e28] text-white shadow-xs'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Widgets (3 cols) matching reference image */}
            <div className="xl:col-span-3 space-y-5 flex flex-col">
              {/* Widget 1: Restaurant Stats */}
              <RestaurantStatsWidget />

              {/* Widget 2: Cuisine Categories */}
              <CuisineCategoriesWidget />

              {/* Widget 3: More Restaurants Promo Card */}
              <RestaurantPromoWidget />
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <AddRestaurantModal />
      <EditRestaurantModal />
      <RestaurantDetailsModal />
      <DeleteConfirmModal />
    </div>
  );
}
