import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import FoodItemCard from '../components/menu/FoodItemCard';
import AddMenuItemPanel from '../components/menu/AddMenuItemPanel';
import EditMenuItemModal from '../components/menu/EditMenuItemModal';
import DeleteMenuConfirmModal from '../components/menu/DeleteMenuConfirmModal';
import { useRestaurants } from '../context/RestaurantContext';

export default function MenuManagementPage() {
  const navigate = useNavigate();
  const { allMenuItems, menuSearchQuery, setMenuSearchQuery } = useRestaurants();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(true);

  // Filter & Search states (search is 2-way synced with Header)
  const searchQuery = menuSearchQuery;
  const setSearchQuery = setMenuSearchQuery;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All Types'); // 'All Types' | 'Veg' | 'Non-Veg'
  const [selectedStatus, setSelectedStatus] = useState('All Status'); // 'All Status' | 'Available' | 'Unavailable'
  const [sortBy, setSortBy] = useState('Price: Low to High'); // 'Price: Low to High' | 'Price: High to Low' | 'Name: A-Z' | 'Rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [editingItem, setEditingItem] = useState(null);

  // Dynamic category counts computed from all current menu items
  const categoryCounts = useMemo(() => {
    const counts = {
      All: allMenuItems.length,
      Pizza: 0,
      Burger: 0,
      Pasta: 0,
      'South Indian': 0,
      Chinese: 0,
      Desserts: 0,
    };

    allMenuItems.forEach((item) => {
      const cat = item.category;
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        counts[cat] = 1;
      }
    });

    return counts;
  }, [allMenuItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return allMenuItems
      .filter((item) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchRest = item.restaurantName?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat && !matchRest) return false;
        }

        // Category filter (pills or dropdown)
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Dietary Type filter (Veg / Non-Veg)
        if (selectedType === 'Veg' && !item.isVeg) return false;
        if (selectedType === 'Non-Veg' && item.isVeg) return false;

        // Availability Status filter
        if (selectedStatus === 'Available' && item.inStock === false) return false;
        if (selectedStatus === 'Unavailable' && item.inStock !== false) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        if (sortBy === 'Name: A-Z') return a.name.localeCompare(b.name);
        if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [allMenuItems, searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // Paginated items
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentDishes = filteredItems.slice(startIndex, endIndex);

  const categoryPills = useMemo(() => {
    const orderedBase = ['All', 'Pizza', 'Burger', 'Pasta', 'South Indian', 'Chinese', 'Desserts', 'Snacks'];
    const dynamicExtras = Object.keys(categoryCounts).filter(
      (cat) => !orderedBase.includes(cat) && (categoryCounts[cat] || 0) > 0
    );
    return [...orderedBase, ...dynamicExtras].map((label) => ({
      label,
      count: categoryCounts[label] || 0,
    }));
  }, [categoryCounts]);

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Dark Emerald Sidebar (Menu Management active) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header with Search, Notifications, Admin Avatar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Container */}
        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-5">
          {/* Top Banner Header matching Reference Design */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#fef5ec] via-[#fffbf7] to-[#f4f7f4] border border-orange-100/80 p-5 sm:p-6 overflow-hidden shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e22] tracking-tight">
                  Menu Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Manage your menu items, add new dishes and keep your menu updated.
                </p>
              </div>

              {/* Add Menu Item Button */}
              <button
                type="button"
                onClick={() => setIsAddPanelOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/20 transition-transform active:scale-[0.98] cursor-pointer self-start md:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Menu Item</span>
              </button>
            </div>

            {/* Decorative Pizza Banner Illustration on Right */}
            <div className="hidden lg:block absolute -right-6 -top-10 w-96 h-48 pointer-events-none opacity-90 select-none">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=650"
                alt="Banner Pizza"
                className="w-full h-full object-cover rounded-full shadow-2xl transform rotate-12 scale-110 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#fef5ec] via-transparent to-transparent" />
            </div>
          </div>

          {/* Search, Dropdowns, & View Mode Filter Bar matching Reference */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Food Items input */}
              <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* All Categories Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categoryPills
                    .filter((c) => c.label !== 'All')
                    .map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                </select>

                {/* All Types (Veg / Non-Veg) Dropdown */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All Types">All Types</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>

                {/* All Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                >
                  <option value="Price: Low to High">Sort by: Price: Low to High</option>
                  <option value="Price: High to Low">Sort by: Price: High to Low</option>
                  <option value="Name: A-Z">Sort by: Name (A-Z)</option>
                  <option value="Rating">Sort by: Rating</option>
                </select>

                {/* Grid / List View Toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 ml-auto sm:ml-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Pills matching Reference [All (24), Pizza (5), Burger (5), etc.] */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categoryPills.map((cat) => {
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-[#ff5722] text-white shadow-md shadow-orange-500/25'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1.5 opacity-90">({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Content Layout: Menu Items Grid (Left/Center) + Add Menu Item Panel (Right) */}
          <div className="flex flex-col xl:flex-row items-start gap-6">
            {/* Left/Center Column: 8 Dishes Grid + Pagination */}
            <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
              {currentDishes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                    <UtensilsCrossed className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No Menu Items Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No dishes matched your current search and filter criteria. Try clearing filters or add a new menu item.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedType('All Types');
                      setSelectedStatus('All Status');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* 4-Columns Grid (8 Cards per page) matching Reference */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-4.5">
                  {currentDishes.map((item) => (
                    <FoodItemCard
                      key={item.id}
                      item={item}
                      onView={(dish) => navigate(`/menu/${dish.id}`)}
                      onEdit={(dish) => setEditingItem(dish)}
                    />
                  ))}
                </div>
              ) : (
                /* List View (Table layout) */
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Dish</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Restaurant</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentDishes.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div
                                onClick={() => navigate(`/menu/${item.id}`)}
                                className="flex items-center gap-3 cursor-pointer group"
                                title={`View details for ${item.name}`}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 group-hover:text-[#ff5722] transition-colors">{item.name}</p>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{item.category}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  item.isVeg ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900">₹{item.price}</td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{item.restaurantName || 'Foodix Central'}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.inStock !== false
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {item.inStock !== false ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/menu/${item.id}`)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(item)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-[11px] cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Pagination matching Reference Design */}
              {totalItems > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                  <p className="font-medium">
                    Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> -{' '}
                    <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
                    <span className="font-bold text-slate-800">{totalItems}</span> menu items
                  </p>

                  <div className="flex items-center gap-1.5 self-center sm:self-auto">
                    {/* Previous Page */}
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Numbered Page Buttons */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-2xs ${
                            isActive
                              ? 'bg-[#ff5722] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Page */}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: "Add Menu Item" Form Panel matching Reference */}
            {isAddPanelOpen && (
              <AddMenuItemPanel
                isOpen={isAddPanelOpen}
                onClose={() => setIsAddPanelOpen(false)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <EditMenuItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />

      {/* Delete Confirmation Modal (User rule: Zero browser confirms, 100% React modal) */}
      <DeleteMenuConfirmModal />
    </div>
  );
}
