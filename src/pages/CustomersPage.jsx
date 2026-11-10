import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  ShoppingBag,
  Crown,
  Ban,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CustomerTableView from '../components/customers/CustomerTableView';
import CustomerDetailsModal from '../components/customers/CustomerDetailsModal';
import EditCustomerModal from '../components/customers/EditCustomerModal';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import DeleteCustomerConfirmModal from '../components/customers/DeleteCustomerConfirmModal';
import { useCustomers } from '../context/CustomerContext';

export default function CustomersPage() {
  const {
    filteredCustomers,
    paginatedCustomers,
    stats,
    cities,
    isLoading,
    isRefreshingApi,
    refreshFromDummyJson,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedCity,
    setSelectedCity,
    selectedDateRange,
    setSelectedDateRange,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setIsAddCustomerOpen,
  } = useCustomers();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalItems = filteredCustomers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Export to CSV functionality
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      toast.warn('No customer records to export.');
      return;
    }

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'City', 'Status', 'Tier', 'Total Orders', 'Total Spent (INR)'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.fullName}"`,
      c.email,
      c.phone,
      `"${c.city || ''}"`,
      c.status,
      c.tier,
      c.ordersCount || 0,
      c.totalSpent || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodix_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customer list exported as CSV successfully!');
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Sidebar with Customers active */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-5">
          {/* Top Banner matching Image 2 reference */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#fef8f0] via-[#fffbf6] to-[#f2f7ef] border border-orange-100/60 p-5 sm:p-6 overflow-hidden shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                {/* Green circular icon with users */}
                <div className="w-13 h-13 rounded-2xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 border border-[#064e3b]/15">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e22] tracking-tight">
                      Customers
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Manage and view all registered customers on your platform.
                  </p>
                </div>
              </div>

              {/* Decorative Right Illustration: Leafy graphics & "Our Valued Customers" script */}
              <div className="hidden md:flex items-center gap-4 pr-3 select-none pointer-events-none">
                {/* Silhouettes Graphic */}
                <div className="flex items-end -space-x-2 text-emerald-800/40">
                  <div className="w-7 h-10 rounded-t-full bg-emerald-800/20" />
                  <div className="w-9 h-13 rounded-t-full bg-emerald-800/35" />
                  <div className="w-11 h-16 rounded-t-full bg-[#064e3b]/45" />
                  <div className="w-9 h-13 rounded-t-full bg-emerald-800/35" />
                  <div className="w-7 h-10 rounded-t-full bg-emerald-800/20" />
                </div>

                {/* Handwritten Calligraphy */}
                <div className="text-right">
                  <p className="text-lg lg:text-xl font-bold tracking-tight text-[#064e3b] italic drop-shadow-2xs font-serif">
                    Our Valued
                  </p>
                  <p className="text-xl lg:text-2xl font-black tracking-tight text-[#064e3b] italic drop-shadow-2xs font-serif -mt-1">
                    Customers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 KPI Overview Cards matching Image 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Customers */}
            <div className="bg-[#eaf5ef] p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 relative z-10">
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalCustomers || 892}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Total Customers</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <span>↑ 12%</span>
                </p>
              </div>
              <Users className="w-24 h-24 absolute -right-3 -bottom-4 text-emerald-900/5 pointer-events-none" />
            </div>

            {/* Card 2: Active Customers */}
            <div className="bg-[#fff4eb] p-4 sm:p-5 rounded-3xl border border-orange-100 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 relative z-10">
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.activeCustomers || 648}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Active Customers</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <span>↑ 10%</span>
                </p>
              </div>
              <ShoppingBag className="w-24 h-24 absolute -right-3 -bottom-4 text-orange-900/5 pointer-events-none" />
            </div>

            {/* Card 3: VIP Customers */}
            <div className="bg-[#eff9f0] p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                  <Crown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 relative z-10">
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.vipCustomers || 244}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">VIP Customers</p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <span>↑ 8%</span>
                </p>
              </div>
              <Crown className="w-24 h-24 absolute -right-3 -bottom-4 text-emerald-900/5 pointer-events-none" />
            </div>

            {/* Card 4: Blocked Customers */}
            <div className="bg-[#fef0f0] p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
                  <Ban className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 relative z-10">
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.blockedCustomers || 32}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Blocked Customers</p>
                <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                  <span>↓ 5%</span>
                </p>
              </div>
              <Ban className="w-24 h-24 absolute -right-3 -bottom-4 text-rose-900/5 pointer-events-none" />
            </div>
          </div>

          {/* Filter, Search & Export Bar matching Image 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search input with "Search customers by name, email..." placeholder */}
              <div className="relative flex-1 min-w-[260px] sm:min-w-[320px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Dropdown Filters & Export button */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>

                {/* Cities Dropdown */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer max-w-[150px] truncate"
                >
                  <option value="All Cities">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Date Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="All Time">All Time</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Export Button matching Image 2 */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ff5722] text-[#ff5722] hover:bg-orange-50 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                  title="Export filtered customer list to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                {/* Add Customer Button */}
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Customer</span>
                </button>

                {/* Live DummyJSON API Sync Button */}
                <button
                  type="button"
                  onClick={refreshFromDummyJson}
                  disabled={isRefreshingApi}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-sync data from DummyJSON Users API"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingApi ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table View matching Image 2 */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs">
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800">Fetching customer profiles from DummyJSON API...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to https://dummyjson.com/users</p>
            </div>
          ) : paginatedCustomers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="font-bold text-slate-700">No matching customers found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
            </div>
          ) : (
            <CustomerTableView customers={paginatedCustomers} />
          )}

          {/* Footer & Pagination matching Image 2 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 pb-4">
            <p className="text-xs text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> –{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-900">{totalItems}</span> customers
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#ff5722] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reusable Modals: View, Edit, Add, Delete */}
      <CustomerDetailsModal />
      <EditCustomerModal />
      <AddCustomerModal />
      <DeleteCustomerConfirmModal />
    </div>
  );
}
