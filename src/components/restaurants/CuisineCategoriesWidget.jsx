import React from 'react';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function CuisineCategoriesWidget() {
  const { cuisineCategories, selectedCuisine, setSelectedCuisine } = useRestaurants();

  // Helper icons and colors matching the reference design
  const getCategoryMeta = (name) => {
    switch (name) {
      case 'Burgers':
        return {
          emoji: '🍔',
          bg: 'bg-orange-50 text-orange-600 border-orange-200/60',
        };
      case 'Pizza':
        return {
          emoji: '🍕',
          bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
        };
      case 'Indian':
        return {
          emoji: '🍛',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        };
      case 'Chinese':
        return {
          emoji: '🍜',
          bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
        };
      case 'Mexican':
        return {
          emoji: '🌮',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
        };
      case 'Japanese':
        return {
          emoji: '🍣',
          bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
        };
      case 'Fast Food':
        return {
          emoji: '🍟',
          bg: 'bg-teal-50 text-teal-700 border-teal-200/60',
        };
      default:
        return {
          emoji: '🍱',
          bg: 'bg-purple-50 text-purple-600 border-purple-200/60',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
          Cuisine Categories
        </h3>
        <button
          type="button"
          onClick={() => setSelectedCuisine('All Cuisines')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-1">
        {cuisineCategories.map((cat) => {
          const meta = getCategoryMeta(cat.name);
          const isSelected = selectedCuisine === cat.name;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCuisine(isSelected ? 'All Cuisines' : cat.name)}
              className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border ${meta.bg}`}
                >
                  <span>{meta.emoji}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold">{cat.name}</span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-100'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
