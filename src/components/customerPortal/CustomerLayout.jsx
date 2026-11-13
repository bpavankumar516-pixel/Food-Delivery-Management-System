import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Tag,
  MapPin,
  User,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Truck,
  ArrowRight,
  Compass,
  Bike,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Logo from '../common/Logo';
import UserAvatar from '../common/UserAvatar';
import ConfirmDialog from './ConfirmDialog';
import FoodItemDetailModal from './FoodItemDetailModal';
import CustomerLocationModal from './CustomerLocationModal';
import { useAuth } from '../../context/AuthContext';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerLayout({ children, hideStickyCart = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    liveLocation,
    selectedLocation,
    locationLoading,
    setIsLocationModalOpen,
    detectCurrentLocation,
    cartItemCount,
    cartTotals,
    cartRestaurant,
    favoriteRestaurantIds,
    favoriteDishIds,
    myUnreadNotificationsCount,
    restaurants,
    allPlatformDishes,
    addSearchHistory,
    cartConflict,
    confirmReplaceCart,
    cancelReplaceCart,
  } = useCustomerPortal();

  const favoritesCount = favoriteRestaurantIds.length + favoriteDishIds.length;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Main sidebar navigation items
  const navItems = [
    { name: 'Home', path: '/customer/home', icon: Home },
    { name: 'Restaurants', path: '/customer/restaurants', icon: UtensilsCrossed },
    { name: 'Search & Explore', path: '/customer/search', icon: Compass },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { name: 'Live Tracking', path: '/customer/tracking', icon: Truck },
    { name: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  // Live Top Search Suggestions
  const searchSuggestions = useMemo(() => {
    const q = topSearch.trim().toLowerCase();
    if (!q) return { rests: [], dishes: [] };
    return {
      rests: restaurants
        .filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.cuisines || []).some((c) => c.toLowerCase().includes(q))
        )
        .slice(0, 3),
      dishes: allPlatformDishes
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [topSearch, restaurants, allPlatformDishes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = topSearch.trim();
    if (q) addSearchHistory(q);
    setShowSuggestions(false);
    navigate(`/customer/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#faf8f4] text-[#202A24] overflow-hidden font-sans select-none">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Forest Green Sidebar (#163A2D) matching reference image */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[250px] xl:w-[265px] bg-[#163A2D] text-white flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <Link to="/customer/home" className="flex flex-col">
            <Logo theme="light" size="normal" showSubtitle={false} />
            <span className="text-[10px] text-emerald-200/75 font-medium tracking-wide pl-12 -mt-0.5">
              Delicious Food, Delivered
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/customer/home' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#ff7d4d] text-white font-bold shadow-md shadow-orange-600/25'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/[0.08] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-300/75'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-[#FF6B35]'
                        : 'bg-[#FF6B35] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Promo Card + Logout matching reference image */}
        <div className="p-3.5 pt-2 space-y-2 shrink-0">
          <div className="rounded-2xl p-3 bg-[#102c22] border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white leading-tight">Fast Delivery</p>
              <p className="text-[10.5px] text-emerald-200/80 font-medium">Fresh Food Always</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar pb-20 md:pb-6">
        {/* Top Sticky Header matching reference image */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
            {/* Left: Menu Button + Location Pill + Search Bar */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#FFF8F0] border border-orange-200/70 text-[#202A24] cursor-pointer shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Live Location Selector + Refresh Control */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setIsLocationModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
                    liveLocation
                      ? 'bg-[#FFF8F0] border-orange-200/80 text-[#202A24] hover:border-[#FF6B35]'
                      : 'bg-orange-50 border-[#FF6B35] text-[#FF6B35] animate-pulse'
                  }`}
                  title={liveLocation?.fullAddress || 'Set your delivery location'}
                >
                  {locationLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#FF6B35] animate-spin shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />
                  )}
                  <span className="max-w-[115px] sm:max-w-[180px] truncate">
                    {locationLoading
                      ? 'Detecting location...'
                      : selectedLocation || 'Use Current Location'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  disabled={locationLoading}
                  onClick={() => detectCurrentLocation({ saveAsAddress: true })}
                  className="p-2 rounded-full bg-[#E7EFE8] hover:bg-[#163A2D] text-[#163A2D] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Detect / Refresh Current GPS Location"
                  aria-label="Refresh current location"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Warm Cream Search Bar with Suggestions */}
              <div className="relative flex-1 max-w-md hidden sm:block">
                <form onSubmit={handleSearchSubmit}>
                  <Search className="w-4 h-4 text-[#FF6B35] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topSearch}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                    onChange={(e) => {
                      setTopSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Search for restaurants, food..."
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-[#FFF8F0] border border-orange-200/60 text-xs sm:text-sm text-[#202A24] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35] transition-all"
                  />
                </form>

                {showSuggestions && topSearch.trim() && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 space-y-2.5">
                    {searchSuggestions.rests.length === 0 &&
                    searchSuggestions.dishes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">
                        Press Enter to search "{topSearch}"
                      </p>
                    ) : (
                      <>
                        {searchSuggestions.rests.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">
                              Restaurants
                            </p>
                            {searchSuggestions.rests.map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onMouseDown={() => navigate(`/customer/restaurants/${r.id}`)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FFF8F0] text-left cursor-pointer"
                              >
                                <img
                                  src={r.image}
                                  alt={r.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#202A24] truncate">{r.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {r.category} • {r.deliveryTime}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchSuggestions.dishes.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">
                              Dishes
                            </p>
                            {searchSuggestions.dishes.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onMouseDown={() =>
                                  navigate(`/customer/search?q=${encodeURIComponent(d.name)}`)
                                }
                                className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-[#FFF8F0] text-left cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#202A24] truncate">{d.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {d.restaurantName}
                                  </p>
                                </div>
                                <span className="text-xs font-black text-[#163A2D]">₹{d.price}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Mobile Search + Favorites + Notifications + Cart + Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/customer/search')}
                className="sm:hidden p-2 rounded-full bg-[#FFF8F0] border border-orange-200/70 hover:border-[#FF6B35] text-[#202A24] cursor-pointer transition-colors"
                aria-label="Search food and restaurants"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/settings?tab=favorites')}
                className="relative p-2 rounded-full bg-[#FFF8F0] border border-orange-200/70 hover:border-[#FF6B35] text-[#202A24] cursor-pointer transition-colors"
                aria-label="Favorites"
                title="Saved Restaurants & Dishes"
              >
                <Heart className={`w-4.5 h-4.5 ${favoritesCount > 0 ? 'text-[#FF6B35]' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#163A2D] text-white text-[10px] font-black flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/settings?tab=notifications')}
                className="relative p-2 rounded-full bg-[#FFF8F0] border border-orange-200/70 hover:border-[#FF6B35] text-[#202A24] cursor-pointer transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {myUnreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#FF6B35] text-white text-[10px] font-black flex items-center justify-center">
                    {myUnreadNotificationsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/cart')}
                className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#E7EFE8] hover:bg-emerald-100 text-[#163A2D] font-bold text-xs cursor-pointer transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FF6B35] text-white text-[10px] font-black">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen((o) => !o);
                  }}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <UserAvatar
                    name={user?.name || 'Customer'}
                    avatar={user?.avatar}
                    useCustomAvatar={!!user?.avatar}
                    gradient="emerald"
                    size="sm"
                    showBadge={true}
                  />
                  <span className="hidden md:inline text-xs font-bold text-[#202A24] max-w-[110px] truncate">
                    {user?.name || 'Customer'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2.5 z-50 space-y-1">
                    <div className="p-2.5 rounded-xl bg-[#FFF8F0] mb-1">
                      <p className="text-xs font-black text-[#202A24] truncate">{user?.name}</p>
                      <p className="text-[10.5px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    {[
                      { label: 'My Profile', path: '/customer/settings?tab=profile', icon: User },
                      { label: 'My Addresses', path: '/customer/settings?tab=addresses', icon: MapPin },
                      { label: 'Favorites', path: '/customer/settings?tab=favorites', icon: Heart },
                      { label: 'Offers & Coupons', path: '/customer/settings?tab=offers', icon: Tag },
                      { label: 'Notifications', path: '/customer/settings?tab=notifications', icon: Bell },
                      { label: 'Help & Support', path: '/customer/settings?tab=support', icon: HelpCircle },
                      { label: 'Account Settings', path: '/customer/settings?tab=account', icon: Settings },
                    ].map((link) => {
                      const LIcon = link.icon;
                      return (
                        <button
                          key={link.path}
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate(link.path);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#E7EFE8] hover:text-[#163A2D] cursor-pointer"
                        >
                          <LIcon className="w-3.5 h-3.5" />
                          <span>{link.label}</span>
                        </button>
                      );
                    })}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setLogoutConfirmOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Sticky Floating Cart Summary Bar */}
      {!hideStickyCart && cartItemCount > 0 && (
        <div className="fixed bottom-16 md:bottom-5 right-4 left-4 md:left-auto md:w-[390px] z-30">
          <div className="bg-[#163A2D] text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black truncate">
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} • ₹{cartTotals.grandTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-200/85 truncate">
                From {cartRestaurant?.name || 'Selected Restaurant'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/cart')}
              className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 grid grid-cols-5 gap-1">
        {[
          { label: 'Home', path: '/customer/home', icon: Home },
          { label: 'Search', path: '/customer/search', icon: Search },
          { label: 'Cart', path: '/customer/cart', icon: ShoppingCart, badge: cartItemCount },
          { label: 'Orders', path: '/customer/orders', icon: ShoppingBag },
          { label: 'Settings', path: '/customer/settings', icon: Settings },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold ${
                active ? 'text-[#FF6B35]' : 'text-slate-500'
              }`}
            >
              <TabIcon className="w-4.5 h-4.5" />
              <span className="mt-0.5">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-0.5 right-3 px-1 rounded-full bg-[#FF6B35] text-white text-[9px] font-black">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Food Item Detail Modal & Live Location Modal */}
      <FoodItemDetailModal />
      <CustomerLocationModal />

      {/* Cart Restaurant Conflict Dialog */}
      <ConfirmDialog
        isOpen={!!cartConflict}
        variant="warning"
        title="Replace Cart Items?"
        message={
          cartConflict
            ? `Your cart currently contains items from ${cartConflict.existingRestName}. Would you like to clear your cart and add items from ${cartConflict.targetRestName}?`
            : ''
        }
        confirmLabel="Replace Cart"
        cancelLabel="Keep Existing"
        onConfirm={confirmReplaceCart}
        onCancel={cancelReplaceCart}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        variant="danger"
        title="Sign out of Foodix?"
        message="You will be signed out of your Customer Portal session. Your saved cart, favorites, and addresses remain stored safely for your next login."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
