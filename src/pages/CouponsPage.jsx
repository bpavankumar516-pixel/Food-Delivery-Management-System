import React, { useState, useMemo } from 'react';
import {
  Tag,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  Star,
  Eye,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useCoupons } from '../context/CouponContext';

export default function CouponsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    coupons,
    stats,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useCoupons();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [copiedCode, setCopiedCode] = useState(null);

  // Pagination State (8 cards per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteCouponTarget, setDeleteCouponTarget] = useState(null);

  // Form State for Add / Edit
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    offerTag: '20% OFF',
    minOrderAmount: 199,
    maxDiscount: 100,
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: 'Dec 31, 2026',
    dateLabel: 'Valid till: Dec 31, 2026',
    category: 'General',
    status: 'Active',
    bannerImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        const matchCategory = (c.category || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchDesc && !matchCategory) return false;
      }

      // Status
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      // Type / Category
      if (typeFilter !== 'All') {
        const cat = (c.category || '').toLowerCase();
        const dtype = (c.discountType || '').toLowerCase();
        const t = typeFilter.toLowerCase();
        if (cat !== t && dtype !== t) return false;
      }

      // Date Range Filter
      if (dateFilter !== 'All') {
        if (dateFilter === 'Active') {
          if (c.status !== 'Active') return false;
        } else if (dateFilter === 'Expired') {
          if (c.status !== 'Expired') return false;
        } else if (dateFilter === 'Scheduled') {
          if (c.status !== 'Scheduled') return false;
        }
      }

      return true;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter, dateFilter]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / itemsPerPage));
  const paginatedCoupons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCoupons, currentPage]);

  const startIndex = filteredCoupons.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCoupons.length);

  // Form Handlers
  const handleOpenAdd = () => {
    setForm({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 20,
      offerTag: '20% OFF',
      minOrderAmount: 199,
      maxDiscount: 100,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: 'Dec 31, 2026',
      dateLabel: 'Valid till: Dec 31, 2026',
      category: 'General',
      status: 'Active',
      bannerImage:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      title: c.title || '',
      description: c.description || '',
      discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || 20,
      offerTag: c.offerTag || `${c.discountValue}% OFF`,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscount: c.maxDiscount || 0,
      startDate: c.startDate || new Date().toISOString().slice(0, 10),
      expiryDate: c.expiryDate || 'Dec 31, 2026',
      dateLabel: c.dateLabel || `Valid till: ${c.expiryDate || 'Dec 31, 2026'}`,
      category: c.category || 'General',
      status: c.status || 'Active',
      bannerImage:
        c.bannerImage ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Coupon title is required.');
      return;
    }

    const success = addCoupon({
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: Number(form.maxDiscount),
      categoryColor:
        form.category === 'Pizza'
          ? 'bg-orange-50 text-orange-600 border border-orange-100'
          : form.category === 'Beverages'
          ? 'bg-purple-50 text-purple-600 border border-purple-100'
          : form.category === 'Delivery'
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : form.category === 'Festival'
          ? 'bg-rose-50 text-rose-600 border border-rose-100'
          : form.category === 'Biryani'
          ? 'bg-blue-50 text-blue-600 border border-blue-100'
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    });

    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const success = updateCoupon(editingCoupon.id, {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: Number(form.maxDiscount),
    });

    if (success) {
      setEditingCoupon(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCouponTarget) return;
    deleteCoupon(deleteCouponTarget.id);
    setDeleteCouponTarget(null);
  };

  // Helper to render discount text overlays matching reference image
  const renderOfferOverlay = (c) => {
    const code = c.code?.toUpperCase();

    if (code === 'WELCOME50') {
      return (
        <div className="flex flex-col leading-none drop-shadow-lg">
          <span className="text-amber-300 font-black text-sm tracking-widest uppercase">
            FLAT
          </span>
          <span className="text-amber-400 font-black text-2xl sm:text-3xl tracking-tight">
            50% OFF
          </span>
        </div>
      );
    }

    if (code === 'BOGOFREE') {
      return (
        <div className="flex flex-col leading-tight drop-shadow-lg">
          <span className="text-white font-black text-xs tracking-wider">BUY 1</span>
          <span className="text-white font-black text-xs tracking-wider">GET 1</span>
          <span className="text-amber-400 font-black text-2xl tracking-tight">FREE</span>
        </div>
      );
    }

    if (code === 'SUMMER20') {
      return (
        <div className="flex flex-col leading-none drop-shadow-lg">
          <span className="text-white font-black text-3xl sm:text-4xl tracking-tight">20%</span>
          <span className="text-white font-black text-sm tracking-wider">OFF</span>
        </div>
      );
    }

    if (code === 'FREEDLV') {
      return (
        <div className="flex flex-col leading-tight drop-shadow-lg">
          <span className="text-emerald-300 font-black text-xl tracking-tight">FREE</span>
          <span className="text-white font-black text-xs tracking-widest">DELIVERY</span>
        </div>
      );
    }

    if (code === 'FOOD100') {
      return (
        <div className="leading-none drop-shadow-lg">
          <span className="text-amber-400 font-black text-2xl tracking-tight">₹100 OFF</span>
        </div>
      );
    }

    if (code === 'FESTIVE15') {
      return (
        <div className="leading-none drop-shadow-lg">
          <span className="text-white font-black text-2xl tracking-tight">15% OFF</span>
        </div>
      );
    }

    if (code === 'BIRYANI30') {
      return (
        <div className="leading-none drop-shadow-lg">
          <span className="text-amber-400 font-black text-2xl tracking-tight">30% OFF</span>
        </div>
      );
    }

    if (code === 'DRINKFREE') {
      return (
        <div className="flex flex-col leading-none drop-shadow-lg">
          <span className="text-emerald-300 font-black text-xl tracking-tight">FREE</span>
          <span className="text-white font-black text-xl tracking-tight">DRINK</span>
        </div>
      );
    }

    // Generic fallback for custom coupons
    return (
      <div className="leading-tight drop-shadow-lg">
        <span className="text-amber-300 font-black text-xl tracking-tight block">
          {c.offerTag || `${c.discountValue}% OFF`}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-5 sm:space-y-6">
          {/* 1. TOP HERO BANNER (Pixel-perfect match to reference image) */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#fef8f0] via-[#fffbf4] to-[#fef6ed] border border-[#f5e5d3] p-5 sm:p-6 lg:p-7 shadow-2xs overflow-hidden">
            {/* Background decorative botanical elements */}
            <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-25">
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-800 fill-current">
                <path d="M40,20 C60,40 80,70 70,120 C50,110 30,80 40,20 Z" />
                <path d="M120,40 C140,60 160,90 150,140 C130,130 110,100 120,40 Z" />
              </svg>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Left Column: Coupon Icon & Titles */}
              <div className="flex items-center gap-4">
                {/* Green Ticket Badge Icon */}
                <div className="w-13 h-13 rounded-2xl bg-[#097956] text-white flex items-center justify-center shadow-lg shadow-emerald-800/20 shrink-0 transform -rotate-3">
                  <div className="border border-dashed border-white/60 p-2 rounded-xl flex items-center justify-center">
                    <Percent className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Coupons & Offers
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Create and manage special offers for your customers.
                  </p>
                </div>
              </div>

              {/* Center & Right Column: 3D Gift Box + Script Headline */}
              <div className="flex items-center justify-between sm:justify-end gap-5 lg:gap-8">
                {/* 3D Gift Box Graphic */}
                <div className="relative w-24 h-20 sm:w-28 sm:h-24 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-orange-400/15 rounded-full blur-xl pointer-events-none" />
                  {/* Decorative 3D Gift Illustration with satin ribbon */}
                  <div className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 bg-gradient-to-br from-[#fff7ed] to-[#fed7aa] rounded-2xl shadow-xl border border-white flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                    {/* Ribbon Cross */}
                    <div className="absolute inset-x-0 h-4 bg-gradient-to-r from-[#ea580c] to-[#ff5722] top-1/2 -translate-y-1/2 shadow-xs" />
                    <div className="absolute inset-y-0 w-4 bg-gradient-to-b from-[#ea580c] to-[#ff5722] left-1/2 -translate-x-1/2 shadow-xs" />
                    {/* Ribbon Bow on top */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-[#ea580c] bg-orange-500 transform -rotate-45" />
                      <div className="w-5 h-5 rounded-full border-2 border-[#ea580c] bg-orange-500 transform rotate-45 -ml-1.5" />
                    </div>
                    {/* Tiny Sparkle */}
                    <Sparkles className="w-4 h-4 text-amber-500 absolute top-1 right-1 animate-pulse" />
                  </div>
                </div>

                {/* Right Calligraphy Script Text */}
                <div className="text-right">
                  <h2 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl font-bold text-[#083c2e] tracking-tight leading-none drop-shadow-xs">
                    Special Offers
                  </h2>
                  <p className="font-serif italic text-xs sm:text-sm text-[#083c2e]/80 font-semibold mt-1">
                    More Savings, More Happiness!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FOUR KPI STAT CARDS (Exact match to reference image) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* Card 1: Total Coupons */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500 block truncate">
                  Total Coupons
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {stats.total ?? 10}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  ↑ +12%
                </span>
              </div>
            </div>

            {/* Card 2: Active Coupons */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ff5722] flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500 block truncate">
                  Active Coupons
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {stats.active ?? 8}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  ↑ +8%
                </span>
              </div>
            </div>

            {/* Card 3: Expired Coupons */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500 block truncate">
                  Expired Coupons
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {stats.expired ?? 2}
                </p>
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5 mt-0.5">
                  ↓ -5%
                </span>
              </div>
            </div>

            {/* Card 4: Total Discount Given */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ff5722] flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500 block truncate">
                  Total Discount Given
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  ₹12,450
                </p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  ↑ +15%
                </span>
              </div>
            </div>
          </div>

          {/* 3. SEARCH & FILTERS BAR */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by coupon code or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs transition-colors"
              />
            </div>

            {/* Dropdown Filters & Add Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
              </select>

              {/* Types Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="General">General</option>
                <option value="Pizza">Pizza</option>
                <option value="Beverages">Beverages</option>
                <option value="Delivery">Delivery</option>
                <option value="Festival">Festival</option>
                <option value="Biryani">Biryani</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="All">Select Date Range</option>
                <option value="Active">Currently Valid</option>
                <option value="Scheduled">Upcoming / Scheduled</option>
                <option value="Expired">Expired Past Offers</option>
              </select>

              {/* Add Coupon Button */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] hover:from-[#f44a14] hover:to-[#ff5722] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all transform active:scale-98 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Coupon</span>
              </button>
            </div>
          </div>

          {/* 4. COUPONS 2x4 CARD GRID (8 Cards Per Page) */}
          {paginatedCoupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 space-y-3">
              <Tag className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-base font-bold text-slate-700">No coupons match your criteria</p>
              <p className="text-xs text-slate-500">
                Try searching with different keywords or reset your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setTypeFilter('All');
                  setDateFilter('All');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {paginatedCoupons.map((c) => {
                const isToggleOn = c.status === 'Active' || c.status === 'Scheduled';

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Top Section: Banner Image with Dark Gradient & Overlays */}
                    <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-900">
                      {/* Culinary Photography */}
                      <img
                        src={c.bannerImage}
                        alt={c.title || c.code}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                        }}
                      />

                      {/* Dark Gradient Overlay for optimal contrast */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

                      {/* Top Badges Row */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        {/* Status Pill Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                            c.status === 'Active'
                              ? 'bg-[#10b981] text-white'
                              : c.status === 'Scheduled'
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-[#94a3b8] text-white'
                          }`}
                        >
                          {c.status}
                        </span>

                        {/* Interactive Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => toggleCouponStatus(c.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shadow-xs ${
                            isToggleOn ? 'bg-[#10b981]' : 'bg-slate-400'
                          }`}
                          title={`Toggle ${c.code} status`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isToggleOn ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Bottom-Left Offer Overlay Text */}
                      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                        {renderOfferOverlay(c)}
                      </div>
                    </div>

                    {/* Middle Section: Coupon Details */}
                    <div className="p-3.5 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Coupon Code with Copy Action */}
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-black text-slate-900 tracking-wide">
                            {c.code}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Title / Description */}
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {c.title || c.description}
                        </p>
                      </div>

                      {/* Calendar Date & Category Pill */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        {/* Calendar Date Label */}
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {c.dateLabel || `Valid till: ${c.expiryDate}`}
                          </span>
                        </div>

                        {/* Category Tag */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                            c.categoryColor ||
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}
                        >
                          {c.category || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Section: 3 Colored Action Buttons (Only Icons: View, Edit, Delete) */}
                    <div className="p-3 sm:p-3.5 pt-0 grid grid-cols-3 gap-2">
                      {/* 1. View Icon Button (Dark Green) */}
                      <button
                        type="button"
                        onClick={() => setViewingCoupon(c)}
                        className="h-8.5 rounded-lg bg-[#053b2c] hover:bg-[#084e3a] text-white flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer group/btn"
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      </button>

                      {/* 2. Edit Icon Button (Vibrant Orange) */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="h-8.5 rounded-lg bg-[#ff5722] hover:bg-[#f4511e] text-white flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer group/btn"
                        title="Edit Coupon"
                        aria-label="Edit Coupon"
                      >
                        <Edit2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      </button>

                      {/* 3. Delete Icon Button (Vibrant Red) */}
                      <button
                        type="button"
                        onClick={() => setDeleteCouponTarget(c)}
                        className="h-8.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer group/btn"
                        title="Delete Coupon"
                        aria-label="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. FOOTER & PAGINATION (Exact match to reference image) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200/80">
            {/* Showing count */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Showing {startIndex} – {endIndex} of {filteredCoupons.length} coupons
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                &lt;
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#ff5722] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* --- MODAL 1: VIEW COUPON DETAILS --- */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="relative h-44 bg-slate-900">
              <img
                src={viewingCoupon.bannerImage}
                alt={viewingCoupon.code}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                type="button"
                onClick={() => setViewingCoupon(null)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3.5 left-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {viewingCoupon.category} Offer
                </span>
                <h3 className="text-2xl font-black">{viewingCoupon.code}</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{viewingCoupon.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {viewingCoupon.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Discount
                  </span>
                  <p className="font-black text-emerald-700 text-base mt-0.5">
                    {viewingCoupon.discountType === 'percentage'
                      ? `${viewingCoupon.discountValue}% OFF`
                      : `₹${viewingCoupon.discountValue} FLAT`}
                  </p>
                  {viewingCoupon.maxDiscount > 0 && (
                    <span className="text-[10px] text-slate-400">
                      Up to ₹{viewingCoupon.maxDiscount}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Min Order Spend
                  </span>
                  <p className="font-black text-slate-800 text-base mt-0.5">
                    ₹{viewingCoupon.minOrderAmount || 0}
                  </p>
                  <span className="text-[10px] text-slate-400">Required subtotal</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Validity Range
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-1">
                    {viewingCoupon.dateLabel || viewingCoupon.expiryDate}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    From {viewingCoupon.startDate}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Status
                  </span>
                  <span
                    className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      viewingCoupon.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingCoupon.status === 'Scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {viewingCoupon.status}
                  </span>
                </div>
              </div>

              {/* Redemptions Progress */}
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-orange-950">Customer Redemptions</span>
                  <span className="text-[#ff5722]">
                    {viewingCoupon.usedCount || 0} / {viewingCoupon.usageLimit || 500} used
                  </span>
                </div>
                <div className="h-2 w-full bg-orange-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-[#ff5722] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((viewingCoupon.usedCount || 0) /
                            (viewingCoupon.usageLimit || 500)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCoupon;
                    setViewingCoupon(null);
                    handleOpenEdit(c);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5722] text-xs font-bold cursor-pointer transition-colors"
                >
                  Edit This Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCoupon(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD COUPON --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ff5722] flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Add New Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE50"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase().trim() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Festival">Festival</option>
                    <option value="Biryani">Biryani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Off on Gourmet Combos"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed offer terms..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                    <option value="bogo">BOGO / Freebie</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="Dec 31, 2026"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expiryDate: e.target.value,
                        dateLabel: `Valid till: ${e.target.value}`,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] text-white font-bold shadow-md shadow-orange-600/25 cursor-pointer transition-transform active:scale-98"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: EDIT COUPON --- */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ff5722] flex items-center justify-center">
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Edit Coupon ({editingCoupon.code})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase().trim() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Festival">Festival</option>
                    <option value="Biryani">Biryani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                    <option value="bogo">BOGO / Freebie</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expiryDate: e.target.value,
                        dateLabel: `Valid till: ${e.target.value}`,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] text-white font-bold shadow-md shadow-orange-600/25 cursor-pointer transition-transform active:scale-98"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: DELETE CONFIRMATION --- */}
      {deleteCouponTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Coupon?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete coupon voucher{' '}
                <span className="font-bold text-slate-800">
                  "{deleteCouponTarget.code}"
                </span>
                ? Diners will no longer be able to apply this discount.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCouponTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-transform active:scale-98"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
