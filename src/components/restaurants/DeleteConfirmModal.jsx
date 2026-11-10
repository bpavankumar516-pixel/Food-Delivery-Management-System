import React, { useEffect } from 'react';
import { Trash2, X, Star, MapPin } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function DeleteConfirmModal() {
  const { deleteModalState, closeDeleteModal, confirmDelete } = useRestaurants();

  const { isOpen, restaurant, onConfirmed } = deleteModalState;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDeleteModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDeleteModal]);

  if (!isOpen || !restaurant) return null;

  const handleConfirm = () => {
    confirmDelete();
    if (onConfirmed) {
      onConfirmed();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={closeDeleteModal}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 border border-slate-100 text-center relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeDeleteModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <div className="absolute inset-0 rounded-2xl bg-rose-500/10 animate-ping pointer-events-none" />
          <Trash2 className="w-7 h-7 relative z-10" />
        </div>

        {/* Headline */}
        <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
          Delete Restaurant?
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
          Are you sure you want to permanently remove <span className="font-bold text-slate-800">{restaurant.name}</span> from the Foodix platform? All menus, orders, and ratings associated with this restaurant will be deleted.
        </p>

        {/* Restaurant Preview Chip */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/40 border border-rose-150/60 mb-6 text-left">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-12 h-12 rounded-xl object-cover border border-rose-200/80 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {restaurant.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{restaurant.rating}</span>
              </span>
              <span>•</span>
              <span className="truncate flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{restaurant.location}</span>
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              restaurant.status === 'Open'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            {restaurant.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
