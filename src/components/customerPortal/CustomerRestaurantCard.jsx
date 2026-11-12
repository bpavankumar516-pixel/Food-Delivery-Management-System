import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Heart, Leaf, MapPin } from 'lucide-react';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerRestaurantCard({ restaurant, compact = false }) {
  const navigate = useNavigate();
  const { favoriteRestaurantIds, toggleFavoriteRestaurant } = useCustomerPortal();

  const isFav = favoriteRestaurantIds.includes(restaurant.id);
  const isClosed = restaurant.status === 'Closed';

  return (
    <div
      onClick={() => navigate(`/customer/restaurants/${restaurant.id}`)}
      className={`group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-lg hover:border-[#FF6B35]/40 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
        isClosed ? 'opacity-80' : ''
      }`}
    >
      {/* Image Container */}
      <div className={`relative ${compact ? 'h-36' : 'h-44'} w-full overflow-hidden bg-slate-100`}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isClosed ? 'grayscale-[40%]' : ''
          }`}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

        {/* Top-left Forest Green Rating Badge (matching reference image) */}
        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#163A2D] text-white text-[11px] font-bold shadow-sm">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{restaurant.rating || '4.5'}</span>
        </div>

        {/* Favorite Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteRestaurant(restaurant.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
            isFav
              ? 'bg-[#FF6B35] text-white shadow-md'
              : 'bg-white/85 text-slate-600 hover:text-[#FF6B35]'
          }`}
          aria-label="Toggle favorite restaurant"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2">
          {restaurant.pureVeg && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
              <Leaf className="w-3 h-3" />
              Pure Veg
            </span>
          )}
          <span
            className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isClosed
                ? 'bg-rose-600 text-white'
                : 'bg-white/95 text-[#163A2D]'
            }`}
          >
            {isClosed ? 'Closed Now' : restaurant.formattedFee || `₹${restaurant.deliveryFee ?? 35} fee`}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <h3 className="font-black text-sm sm:text-[15px] text-[#202A24] truncate group-hover:text-[#FF6B35] transition-colors">
            {restaurant.name}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {Array.isArray(restaurant.cuisines)
              ? restaurant.cuisines.slice(0, 2).join(' • ')
              : restaurant.category || 'Multi-Cuisine'}
          </p>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium mt-2">
            <span className="inline-flex items-center gap-1 text-[#202A24] font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#163A2D]" />
              <span>{restaurant.deliveryTime || '25-35 mins'}</span>
            </span>
            {!compact && (
              <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                <MapPin className="w-3 h-3 text-[#FF6B35] shrink-0" />
                <span className="truncate">{restaurant.location?.split(',')[0]}</span>
              </span>
            )}
          </div>
        </div>

        {/* Outlined Orange "Order Now" CTA matching reference image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customer/restaurants/${restaurant.id}`);
          }}
          className={`w-full py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isClosed
              ? 'border-slate-200 bg-slate-50 text-slate-400'
              : 'border-[#FF6B35]/60 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white hover:border-[#FF6B35]'
          }`}
        >
          {isClosed ? 'Currently Closed' : 'Order Now'}
        </button>
      </div>
    </div>
  );
}
