import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2, Heart } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function FoodItemCard({ item, onView, onEdit }) {
  const navigate = useNavigate();
  const { toggleMasterItemStock, toggleMasterItemFavorite, openDeleteMenuModal } = useRestaurants();

  const isAvailable = item.inStock !== false;

  const handleView = () => {
    if (onView) {
      onView(item);
    } else {
      navigate(`/menu/${item.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Image Container */}
      <div
        onClick={handleView}
        className="relative h-44 w-full overflow-hidden bg-slate-100 cursor-pointer"
        title={`View details for ${item.name}`}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=450';
          }}
        />

        {/* Veg / Non-Veg Chip Top Left */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-xs ${
              item.isVeg
                ? 'bg-[#10b981] text-white'
                : 'bg-[#ea580c] text-white'
            }`}
          >
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Favorite Heart Top Right */}
        <button
          type="button"
          onClick={() => toggleMasterItemFavorite(item.id)}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer shadow-xs ${
            item.isFavorite
              ? 'bg-white text-rose-500'
              : 'bg-black/30 hover:bg-black/50 text-white'
          }`}
          title={item.isFavorite ? 'Remove Favorite' : 'Save as Favorite'}
        >
          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3.5 pb-2 flex-1 flex flex-col justify-between space-y-2">
        {/* Title & Description */}
        <div>
          <h4
            onClick={handleView}
            className="font-extrabold text-sm text-slate-900 truncate tracking-tight hover:text-[#ff5722] cursor-pointer transition-colors"
          >
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
            {item.description}
          </p>
        </div>

        {/* Price & Category Badge Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900">₹{item.price}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                ₹{item.originalPrice}
              </span>
            )}
          </div>

          <span className="px-2 py-0.5 rounded-md bg-rose-50/80 text-rose-600 text-[10px] font-bold tracking-wide">
            {item.badgeCategory || item.category}
          </span>
        </div>

        {/* Availability Status Pill (Clickable Quick Toggle) */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => toggleMasterItemStock(item.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Click to toggle availability"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
          </button>
        </div>
      </div>

      {/* Card Action Buttons: View, Edit, Delete */}
      <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/40 grid grid-cols-3 gap-1.5 text-center text-xs">
        <button
          type="button"
          onClick={handleView}
          className="flex items-center justify-center gap-1 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold transition-colors cursor-pointer text-[11px]"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex items-center justify-center gap-1 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold transition-colors cursor-pointer text-[11px]"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => openDeleteMenuModal(item)}
          className="flex items-center justify-center gap-1 py-1.5 rounded-xl border border-slate-200/90 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold transition-colors cursor-pointer text-[11px]"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
