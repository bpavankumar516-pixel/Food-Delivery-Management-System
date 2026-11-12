import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Clock, Flame, Heart, Plus, Minus, ShoppingBag, Store, Ban } from 'lucide-react';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function FoodItemDetailModal() {
  const navigate = useNavigate();
  const {
    activeFoodModal,
    setActiveFoodModal,
    restaurants,
    addToCart,
    favoriteDishIds,
    toggleFavoriteDish,
  } = useCustomerPortal();

  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [activeFoodModal?.id]);

  if (!activeFoodModal) return null;

  const dish = activeFoodModal;
  const rest =
    restaurants.find((r) => r.id === dish.restaurantId) ||
    restaurants.find((r) => r.name?.toLowerCase() === dish.restaurantName?.toLowerCase());
  const isFav = favoriteDishIds.includes(dish.id);
  const isUnavailable = dish.inStock === false || rest?.status === 'Closed';

  const handleAdd = () => {
    const ok = addToCart(dish, qty);
    if (ok) {
      setActiveFoodModal(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveFoodModal(null)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image */}
        <div className="relative h-56 w-full bg-slate-100">
          <img
            src={dish.image}
            alt={dish.name}
            className={`w-full h-full object-cover ${dish.inStock === false ? 'grayscale' : ''}`}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          <button
            type="button"
            onClick={() => setActiveFoodModal(null)}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleFavoriteDish(dish)}
            className={`absolute top-3.5 left-3.5 w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-pointer ${
              isFav ? 'bg-[#FF6B35] text-white' : 'bg-white/90 text-slate-600 hover:text-[#FF6B35]'
            }`}
          >
            <Heart className={`w-4.5 h-4.5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#163A2D] text-white text-[11px] font-bold mb-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {dish.rating || '4.7'} ({dish.votes || 240}+ ratings)
              </span>
              <h3 className="text-xl font-black tracking-tight leading-tight">{dish.name}</h3>
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                if (rest) {
                  setActiveFoodModal(null);
                  navigate(`/customer/restaurants/${rest.id}`);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFE8] text-[#163A2D] font-bold hover:bg-emerald-100 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{rest?.name || dish.restaurantName || 'Foodix Kitchen'}</span>
            </button>

            <div className="flex items-center gap-2 text-slate-500 font-semibold">
              {dish.prepTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#163A2D]" />
                  {dish.prepTime}
                </span>
              )}
              {dish.spicyLevel && (
                <span className="inline-flex items-center gap-1 text-[#FF6B35]">
                  <Flame className="w-3.5 h-3.5" />
                  {dish.spicyLevel}
                </span>
              )}
              {dish.calories && <span>• {dish.calories}</span>}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {dish.description ||
              'Prepared fresh to order using premium ingredients and signature house spices.'}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Price</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#202A24]">₹{dish.price}</span>
                {dish.originalPrice > dish.price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{dish.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {!isUnavailable && (
              <div className="flex items-center gap-2 bg-[#FFF8F0] border border-orange-200 rounded-2xl px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-xl bg-white text-[#202A24] flex items-center justify-center shadow-2xs cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-sm text-[#202A24] w-6 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-xl bg-white text-[#202A24] flex items-center justify-center shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {isUnavailable ? (
            <div className="w-full py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2">
              <Ban className="w-4 h-4" />
              <span>
                {dish.inStock === false
                  ? 'Currently Sold Out by Restaurant'
                  : 'Restaurant is Currently Closed'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart • ₹{(dish.price * qty).toLocaleString()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
