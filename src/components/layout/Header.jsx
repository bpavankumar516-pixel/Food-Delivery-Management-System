import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Shield, Store, Bike, Users, ChevronDown, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out successfully.');
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Shield,
        };
      case 'Restaurant':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Store,
        };
      case 'Delivery Partner':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Bike,
        };
      default:
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Users,
        };
    }
  };

  const roleMeta = getRoleBadge(user?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Logo theme="dark" size="normal" showSubtitle={false} />

          {/* Right Section: Role pill, Profile, Logout */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Live Operational Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Sync Active</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                alt={user?.name || 'User'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500/30 shadow-xs"
              />
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                    {user?.name || 'Guest User'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.bg}`}
                  >
                    <RoleIcon className="w-2.5 h-2.5" />
                    <span>{user?.role || 'Member'}</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {user?.email || 'user@foodix.com'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/60 cursor-pointer shadow-xs"
              title="Sign out of Foodix"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Confirm Logout</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to log out of your Foodix account session?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-md shadow-rose-600/20 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
