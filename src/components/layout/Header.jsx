import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  MessageSquare,
  X,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { useRestaurants } from '../../context/RestaurantContext';
import { useNotificationSupport } from '../../context/NotificationSupportContext';
import LogoutModal from '../common/LogoutModal';
import UserAvatar from '../common/UserAvatar';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotificationSupport?.() || { notifications: [], unreadCount: 0 };

  const isRestaurantsPage = location.pathname.startsWith('/restaurants');
  const isMenuPage = location.pathname.startsWith('/menu');

  const { activities, searchQuery: dashSearch, setSearchQuery: setDashSearch } = useDashboard();
  const {
    searchQuery: restSearch,
    setSearchQuery: setRestSearch,
    menuSearchQuery,
    setMenuSearchQuery,
  } = useRestaurants();

  const searchQuery = isRestaurantsPage
    ? restSearch
    : isMenuPage
    ? menuSearchQuery
    : dashSearch;
  const setSearchQuery = isRestaurantsPage
    ? setRestSearch
    : isMenuPage
    ? setMenuSearchQuery
    : setDashSearch;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#fcfbf9]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 select-none">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section: Mobile Menu Button & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
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
                placeholder={
                  isRestaurantsPage
                    ? 'Search restaurants by name, cuisine, or location...'
                    : isMenuPage
                    ? 'Search food items by name, category...'
                    : 'Search restaurants, orders, menu items...'
                }
                className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e4d3a] focus:ring-2 focus:ring-[#0e4d3a]/10 shadow-2xs transition-all"
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
          </div>

          {/* Right Section: Notifications, POS Cart & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      {unreadCount} Unread
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {(notifications.length > 0 ? notifications : activities).slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          if (act.orderId || act.type === 'order') {
                            navigate('/orders');
                          }
                        }}
                        className="flex items-start gap-2.5 p-2 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{act.title}</p>
                          {(act.message || act.subtitle) && (
                            <p className="text-[11px] text-slate-500">{act.message || act.subtitle}</p>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {act.timeFormatted || act.time || 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/orders');
                      }}
                      className="text-xs font-bold text-[#064e3b] hover:text-[#043d2e] cursor-pointer"
                    >
                      View All Live Orders →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat / Message icon */}
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Alerts"
              title="Recent Activity"
            >
              <MessageSquare className="w-4.5 h-4.5 text-slate-700" />
            </button>

            {/* User Profile: Name-Based Letter Avatar by default + Name + Super Administrator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-white/80 transition-all cursor-pointer text-left group"
              >
                {/* Name-based letter avatar by default */}
                <UserAvatar
                  name={user?.name || 'Pavan Kumar'}
                  avatar={user?.avatar}
                  useCustomAvatar={user?.useCustomAvatar}
                  gradient={user?.avatarGradient || 'orange'}
                  size="md"
                  showBadge={true}
                  badgeStatus="online"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover:text-[#ff5e28] transition-colors">
                    {user?.name || 'Pavan Kumar'}
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-medium leading-tight">
                    Super Administrator
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  {/* User Profile Mini Header */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100/80">
                    <UserAvatar
                      name={user?.name || 'Pavan Kumar'}
                      avatar={user?.avatar}
                      useCustomAvatar={user?.useCustomAvatar}
                      gradient={user?.avatarGradient || 'orange'}
                      size="sm"
                      showBadge={true}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Pavan Kumar'}</p>
                      <p className="text-[10.5px] text-slate-500 font-mono truncate">{user?.email || 'admin@foodix.com'}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span>View Profile</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span>Platform Settings</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
