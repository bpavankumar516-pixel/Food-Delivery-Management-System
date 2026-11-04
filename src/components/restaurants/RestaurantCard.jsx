import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Clock, MapPin, MoreVertical, CheckCircle2, XCircle, Trash2, Edit3, Eye, Bike, ExternalLink } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function RestaurantCard({ restaurant, viewMode = 'grid' }) {
  const { toggleFavorite, toggleStatus, openEditModal, openDeleteModal } = useRestaurants();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const isOpen = restaurant.status === 'Open';

  const handleNavigateDetails = () => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none group">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* Thumbnail */}
          <div
            onClick={handleNavigateDetails}
            className="relative w-24 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-slate-100 cursor-pointer"
          >
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=300';
              }}
            />
            <span
              className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                isOpen ? 'bg-[#00875a]' : 'bg-[#e11d48]'
              }`}
            >
              {restaurant.status}
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <img
                src={restaurant.logo}
                alt=""
                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <h3
                onClick={handleNavigateDetails}
                className="font-bold text-sm text-slate-900 truncate cursor-pointer hover:text-[#ff5e28] transition-colors"
              >
                {restaurant.name}
              </h3>
              <button
                type="button"
                onClick={() => toggleFavorite(restaurant.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${restaurant.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {restaurant.cuisines?.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{restaurant.rating}</span>
                <span className="text-slate-400 font-normal">({restaurant.reviews})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{restaurant.deliveryTime}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{restaurant.location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* List Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <button
            type="button"
            onClick={handleNavigateDetails}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(restaurant)}
            className="px-4 py-1.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => toggleStatus(restaurant.id)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isOpen
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
            title={`Toggle status to ${isOpen ? 'Closed' : 'Open'}`}
          >
            {isOpen ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(restaurant)}
            className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Delete Restaurant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View (Pixel-perfect match to reference image)
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group select-none relative">
      {/* Top Banner Image with Status & Favorite Badge */}
      <div
        onClick={handleNavigateDetails}
        className="relative h-44 sm:h-46 w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400';
          }}
        />

        {/* Gradient vignette on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20 pointer-events-none" />

        {/* Open/Closed Badge on Top-Left matching reference */}
        <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 backdrop-blur-2xs ${
              isOpen ? 'bg-[#00875a]' : 'bg-[#e11d48]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isOpen ? 'animate-pulse' : ''}`} />
            <span>{restaurant.status}</span>
          </span>
        </div>

        {/* Favorite Heart Button on Top-Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(restaurant.id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-xs flex items-center justify-center text-white transition-all cursor-pointer"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              restaurant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Logo & Name Row */}
          <div
            onClick={handleNavigateDetails}
            className="flex items-center gap-2.5 cursor-pointer group-hover:text-[#ff5e28]"
          >
            <img
              src={restaurant.logo}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-slate-200/90 shadow-2xs shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h3 className="font-bold text-base text-slate-900 tracking-tight truncate leading-tight transition-colors">
              {restaurant.name}
            </h3>
          </div>

          {/* Cuisine Tags Pills Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {restaurant.cuisines?.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 leading-tight"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {/* Rating & Delivery Time Row */}
          <div className="flex items-center gap-4 text-xs pt-0.5">
            {/* Rating */}
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating}</span>
              <span className="text-slate-400 font-normal">({restaurant.reviews})</span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>

          {/* Delivery Fee Row */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <span>{restaurant.formattedFee}</span>
          </div>

          {/* Location Row */}
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium truncate pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{restaurant.location}</span>
          </div>
        </div>

        {/* Action Buttons Row matching reference */}
        <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-150/70 relative">
          {/* View Details Button -> Opens dedicated restaurant details page */}
          <button
            type="button"
            onClick={handleNavigateDetails}
            className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1"
          >
            <span>View Details</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => openEditModal(restaurant)}
            className="px-4 py-2 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-xs active:scale-95"
          >
            Edit
          </button>

          {/* More Options '...' Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Quick Action Popup Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      handleNavigateDetails();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Details Page</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleStatus(restaurant.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    {isOpen ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Mark as Closed</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark as Open</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openEditModal(restaurant);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit Details</span>
                  </button>
                  {/* Delete Restaurant with dedicated confirmation modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      openDeleteModal(restaurant);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left border-t border-slate-100 mt-1 pt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Restaurant</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
