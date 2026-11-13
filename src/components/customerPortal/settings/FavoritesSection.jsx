import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, UtensilsCrossed } from 'lucide-react';
import CustomerRestaurantCard from '../CustomerRestaurantCard';
import FoodItemCardCustomer from '../FoodItemCardCustomer';
import { useCustomerPortal } from '../../../context/CustomerPortalContext';

export default function FavoritesSection() {
  const navigate = useNavigate();
  const {
    restaurants,
    allPlatformDishes,
    favoriteRestaurantIds,
    favoriteDishIds,
  } = useCustomerPortal();

  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'dishes'

  const favoriteRestaurants = useMemo(
    () => restaurants.filter((r) => favoriteRestaurantIds.includes(r.id)),
    [restaurants, favoriteRestaurantIds]
  );

  const favoriteDishes = useMemo(
    () => allPlatformDishes.filter((d) => favoriteDishIds.includes(d.id)),
    [allPlatformDishes, favoriteDishIds]
  );

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A24]">
            Wishlist & Favorites
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Your saved partner kitchens and favorite dishes — remove or add straight to cart
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('restaurants')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border cursor-pointer ${
            activeTab === 'restaurants'
              ? 'bg-[#163A2D] text-white border-[#163A2D]'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Saved Restaurants ({favoriteRestaurants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dishes')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border cursor-pointer ${
            activeTab === 'dishes'
              ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Favorite Food Items ({favoriteDishes.length})</span>
        </button>
      </div>

      {activeTab === 'restaurants' ? (
        favoriteRestaurants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <Heart className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-black text-base text-[#202A24]">No Favorite Restaurants Yet</h3>
            <p className="text-xs text-slate-500">
              Tap the heart icon on any restaurant card to save it here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/customer/restaurants')}
              className="px-5 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteRestaurants.map((rest) => (
              <CustomerRestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )
      ) : favoriteDishes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-black text-base text-[#202A24]">No Favorite Dishes Yet</h3>
          <p className="text-xs text-slate-500">
            Save dishes you love while browsing restaurant menus for instant reordering.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/search')}
            className="px-5 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer"
          >
            Browse Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteDishes.map((dish) => (
            <FoodItemCardCustomer
              key={dish.id}
              dish={dish}
              restaurantStatus={dish.restaurantStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
