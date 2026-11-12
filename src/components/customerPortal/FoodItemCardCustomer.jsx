import React from 'react';
import { Star, Heart, Plus, Minus, Flame, Sparkles, Ban } from 'lucide-react';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function FoodItemCardCustomer({ dish, restaurantStatus = 'Open' }) {
  const {
    hydratedCartItems,
    addToCart,
    updateCartItemQty,
    favoriteDishIds,
    toggleFavoriteDish,
    setActiveFoodModal,
  } = useCustomerPortal();

  const cartEntry = hydratedCartItems.find((i) => i.id === dish.id);
  const qtyInCart = cartEntry?.qty || 0;
  const isFav = favoriteDishIds.includes(dish.id);
  const isUnavailable = dish.inStock === false || restaurantStatus === 'Closed';

  return (
    <div
      onClick={() => setActiveFoodModal(dish)}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#FF6B35]/35 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group ${
        dish.inStock === false ? 'opacity-75' : ''
      }`}
    >
      {/* Dish Image */}
      <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            dish.inStock === false ? 'grayscale' : ''
          }`}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {/* Veg / Non-Veg Badge */}
        <div
          className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg bg-white/95 flex items-center justify-center shadow-xs"
          title={dish.isVeg ? 'Pure Veg' : 'Non-Veg'}
        >
          <span
            className={`w-3 h-3 rounded-xs border-2 flex items-center justify-center ${
              dish.isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </span>
        </div>

        {/* Favorite Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteDish(dish);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
            isFav
              ? 'bg-[#FF6B35] text-white shadow-md'
              : 'bg-white/85 text-slate-600 hover:text-[#FF6B35]'
          }`}
          aria-label="Favorite dish"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Bestseller or Sold Out Tag */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
          {dish.inStock === false ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">
              <Ban className="w-3 h-3" />
              Unavailable
            </span>
          ) : dish.isBestseller ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-[#202A24] text-[10px] font-black">
              <Sparkles className="w-3 h-3" />
              Bestseller
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#163A2D] text-white text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {dish.rating || '4.6'}
          </span>
        </div>
      </div>

      {/* Info & Add to Cart */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#163A2D] bg-[#E7EFE8] px-2 py-0.5 rounded-md truncate">
              {dish.restaurantName || dish.category}
            </span>
            {dish.spicyLevel && dish.spicyLevel !== 'None' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF6B35]">
                <Flame className="w-3 h-3" />
                {dish.spicyLevel}
              </span>
            )}
          </div>
          <h4 className="font-black text-sm text-[#202A24] mt-1.5 line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
            {dish.name}
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
            {dish.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-[#202A24]">₹{dish.price}</span>
              {dish.originalPrice && dish.originalPrice > dish.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{dish.originalPrice}
                </span>
              )}
            </div>
          </div>

          {isUnavailable ? (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px]">
              {dish.inStock === false ? 'Sold Out' : 'Closed'}
            </span>
          ) : qtyInCart > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 bg-[#163A2D] text-white rounded-xl px-2 py-1 shadow-xs"
            >
              <button
                type="button"
                onClick={() => updateCartItemQty(dish.id, qtyInCart - 1)}
                className="w-6 h-6 rounded-lg hover:bg-white/15 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[14px] text-center">{qtyInCart}</span>
              <button
                type="button"
                onClick={() => addToCart(dish, 1)}
                className="w-6 h-6 rounded-lg hover:bg-white/15 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(dish, 1);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white border border-[#FF6B35]/50 font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
