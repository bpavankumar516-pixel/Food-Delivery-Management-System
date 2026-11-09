import React from 'react';
import {
  X,
  Star,
  Clock,
  Flame,
  Store,
  CheckCircle2,
  XCircle,
  Heart,
  Share2,
  Edit3,
  Trash2,
  UtensilsCrossed,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRestaurants } from '../../context/RestaurantContext';

export default function ViewMenuItemModal({ isOpen, onClose, item, onEdit }) {
  const { toggleMasterItemStock, toggleMasterItemFavorite, openDeleteMenuModal } = useRestaurants();

  if (!isOpen || !item) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out ${item.name} on Foodix!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/menu#${item.id}`);
      toast.success('Food item link copied to clipboard!');
    }
  };

  const handleDelete = () => {
    onClose();
    openDeleteMenuModal(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Image Showcase */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Actions Floating */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 ${
                item.isVeg
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMasterItemFavorite(item.id)}
                className={`p-2 rounded-2xl backdrop-blur-md transition-colors cursor-pointer ${
                  item.isFavorite
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 text-white hover:bg-black/60'
                }`}
                title={item.isFavorite ? 'Remove Favorite' : 'Save as Favorite'}
              >
                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-white' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Share Dish"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Price on Image Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/30 backdrop-blur-xs border border-emerald-400/40 uppercase tracking-wider text-[10px] font-bold">
                {item.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{item.rating || 4.7}</span>
                <span className="text-white/60">({item.votes || 120})</span>
              </span>
            </div>
            <h2 className="text-2xl font-black drop-shadow-md">{item.name}</h2>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Price & Availability Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Pricing</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">₹{item.price}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ₹{item.originalPrice}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  Save ₹{(item.originalPrice || Math.round(item.price * 1.25)) - item.price}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleMasterItemStock(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                item.inStock
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
              }`}
            >
              {item.inStock ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Available</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Unavailable</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              {item.description}
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <Clock className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</p>
              <p className="text-xs font-bold text-slate-800">{item.prepTime || '15-20 mins'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <Flame className="w-4 h-4 text-orange-500 mx-auto" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Spice Level</p>
              <p className="text-xs font-bold text-slate-800">{item.spicyLevel || 'Mild'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <Sparkles className="w-4 h-4 text-amber-500 mx-auto" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Calories</p>
              <p className="text-xs font-bold text-slate-800">{item.calories || '450 kcal'}</p>
            </div>
          </div>

          {/* Associated Restaurant Card */}
          {item.restaurantId && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Associated Restaurant
                  </p>
                  <h4 className="font-bold text-sm text-slate-900">{item.restaurantName}</h4>
                </div>
              </div>

              <Link
                to={`/restaurants/${item.restaurantId}`}
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                View Restaurant
              </Link>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between p-4.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Dish</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(item);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5e28] to-[#ff7539] hover:from-[#e04f1e] hover:to-[#ff5e28] text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Dish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
