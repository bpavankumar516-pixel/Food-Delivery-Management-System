import React from 'react';
import { AlertTriangle, Trash2, X, UtensilsCrossed } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function DeleteMenuConfirmModal() {
  const { deleteMenuModalState, closeDeleteMenuModal, confirmDeleteMenuItem } = useRestaurants();

  if (!deleteMenuModalState?.isOpen || !deleteMenuModalState?.item) {
    return null;
  }

  const { item } = deleteMenuModalState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Delete Food Item</h3>
              <p className="text-xs text-rose-600 font-medium">This action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeleteMenuModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">"{item.name}"</span>?
            This will permanently remove the dish from the central menu and any linked restaurant menus.
          </p>

          {/* Dish Summary Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    item.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
                  }`}
                />
                <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {item.category} • {item.restaurantName || 'Foodix Kitchen'}
              </p>
              <p className="text-xs font-black text-slate-900 mt-1">₹{item.price}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={closeDeleteMenuModal}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDeleteMenuItem}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete Dish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
