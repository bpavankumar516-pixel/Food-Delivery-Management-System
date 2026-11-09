import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  BookOpen,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import Logo from '../common/Logo';
import LogoutModal from '../common/LogoutModal';

export default function Sidebar({ isOpen, onClose }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Restaurants', path: '/restaurants', icon: Store },
    { name: 'Menu Management', path: '/menu', icon: BookOpen },
    { name: 'Customers', path: '#customers', icon: Users },
    { name: 'Orders', path: '#orders', icon: ShoppingBag },
    { name: 'Coupons & Offers', path: '#coupons', icon: Tag },
    { name: 'Reports', path: '#reports', icon: BarChart3 },
    { name: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] xl:w-[280px] bg-[#05291e] text-white flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5 xl:p-6 pb-2">
          <div className="flex items-center justify-between">
            {/* Logo Lockup */}
            <div className="flex flex-col text-left">
              <Logo theme="light" size="normal" showSubtitle={false} />
              <span className="text-[10px] text-emerald-300/80 font-medium tracking-wide mt-0.5 pl-12">
                Delicious Food, Delivered
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 xl:px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/restaurants' && location.pathname.startsWith('/restaurants')) ||
              (item.path === '/menu' && location.pathname.startsWith('/menu')) ||
              (item.path === '/profile' && location.pathname.startsWith('/profile'));

            if (isActive) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[#ff5e28] to-[#ff7539] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/30 cursor-pointer transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path.startsWith('#') ? '#' : item.path}
                onClick={(e) => {
                  if (item.path.startsWith('#')) {
                    e.preventDefault();
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-emerald-100/75 hover:text-white hover:bg-white/[0.08] transition-all text-xs sm:text-[13px] font-medium group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-emerald-300/70 group-hover:text-white transition-colors" />
                  <span>{item.name}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300/50 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-emerald-100/75 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs sm:text-[13px] font-medium group cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4 text-emerald-300/70 group-hover:text-rose-400 transition-colors" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom Section: Decorative Food Illustration & Slogan matching reference */}
        <div className="p-4 xl:p-5 pt-1 relative overflow-hidden shrink-0">
          <div className="relative rounded-2xl p-3 bg-gradient-to-b from-white/[0.04] to-black/30 border border-white/10 text-center">
            {/* Handwritten Script Headline */}
            <p className="font-script text-base sm:text-lg text-emerald-100 font-bold tracking-wide mb-2 flex items-center justify-center gap-1.5 drop-shadow-sm">
              <span>Good Food</span>
              <span>Good Mood</span>
              <span className="text-[#ff6022]">♡</span>
            </p>

            {/* Culinary Dish Illustration */}
            <div className="relative mx-auto w-32 h-20 sm:w-36 sm:h-24 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=350"
                alt="Culinary pasta special"
                className="w-28 h-20 sm:w-32 sm:h-22 object-cover rounded-xl shadow-xl border border-white/15"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Floating Basil Leaves */}
              <div className="absolute -top-1 -left-1 w-5 h-5 text-emerald-400/90 transform rotate-45 pointer-events-none drop-shadow">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 -right-1 w-5 h-5 text-emerald-400/90 transform -rotate-12 pointer-events-none drop-shadow">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
