import React, { useState } from 'react';
import { Search, Bell, Menu, Shield, LogOut, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, activities } = useDashboard();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#fcfbf9]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar matching reference image */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, orders, customers..."
              className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e4d3a] focus:ring-2 focus:ring-[#0e4d3a]/10 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Notifications & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-slate-700" />
              {/* Notification count badge '3' matching reference */}
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {activities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{act.title}</p>
                        {act.subtitle && <p className="text-[11px] text-slate-500">{act.subtitle}</p>}
                        <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile matching reference: Avatar + Name + Super Administrator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-white/80 transition-all cursor-pointer text-left"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                alt={user?.name || 'Admin'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shadow-xs"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {user?.role === 'Admin' ? 'Admin' : (user?.name || 'Admin')}
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium leading-tight">
                  Super Administrator
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'admin@foodix.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
