import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      logout();
      toast.info('You have been logged out successfully.');
      navigate('/login');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 border border-slate-100 text-center relative animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning / LogOut Icon Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <div className="absolute inset-0 rounded-2xl bg-rose-500/10 animate-ping pointer-events-none" />
          <LogOut className="w-7 h-7 relative z-10" />
        </div>

        {/* Headline */}
        <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
          Confirm Logout
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
          Are you sure you want to log out of your <span className="font-semibold text-slate-700">Foodix</span> session?
        </p>

        {/* User Card Preview */}
        {user && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 mb-6 text-left">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
              alt={user.name || 'Admin'}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono">
                {user.email || 'admin@foodix.com'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              {user.role || 'Admin'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
