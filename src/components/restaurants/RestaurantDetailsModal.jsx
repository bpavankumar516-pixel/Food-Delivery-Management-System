import React from 'react';
import { X, Star, Clock, MapPin, Phone, CheckCircle2, XCircle, Edit3, Trash2, Heart, DollarSign } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function RestaurantDetailsModal() {
  const {
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedRestaurant,
    toggleStatus,
    toggleFavorite,
    openEditModal,
    openDeleteModal,
  } = useRestaurants();

  if (!isDetailsModalOpen || !selectedRestaurant) return null;

  const isOpen = selectedRestaurant.status === 'Open';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsDetailsModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Photo */}
        <div className="relative h-48 w-full bg-slate-100 shrink-0">
          <img
            src={selectedRestaurant.image}
            alt={selectedRestaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsDetailsModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(selectedRestaurant.id)}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 ${
                selectedRestaurant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* Bottom Title overlay */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedRestaurant.logo}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
              />
              <div className="text-white">
                <h3 className="font-black text-lg sm:text-xl leading-tight drop-shadow-sm">
                  {selectedRestaurant.name}
                </h3>
                <p className="text-xs text-emerald-200/90 font-medium">
                  {selectedRestaurant.category} • {selectedRestaurant.location}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleStatus(selectedRestaurant.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-1 ${
                isOpen ? 'bg-[#00875a] hover:bg-emerald-700' : 'bg-[#e11d48] hover:bg-rose-700'
              }`}
            >
              <span>{isOpen ? '● Open' : '● Closed'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-150/70 text-center">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Rating</p>
              <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedRestaurant.rating}</span>
                <span className="text-slate-400 font-normal">({selectedRestaurant.reviews})</span>
              </p>
            </div>
            <div className="border-x border-slate-200/80">
              <p className="text-[11px] text-slate-400 font-medium">Delivery Time</p>
              <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedRestaurant.deliveryTime}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Delivery Fee</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {selectedRestaurant.formattedFee}
              </p>
            </div>
          </div>

          {/* Cuisines Tags */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Cuisine Specialities</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedRestaurant.cuisines?.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Popular Menu Dishes */}
          {selectedRestaurant.featuredDishes && selectedRestaurant.featuredDishes.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Customer Favorites</h4>
              <div className="space-y-1.5">
                {selectedRestaurant.featuredDishes.map((dish, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-xs font-semibold text-slate-800">{dish}</span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Bestseller
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Address */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-start gap-2.5 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{selectedRestaurant.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{selectedRestaurant.phone}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-150/70 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsDetailsModalOpen(false);
              openDeleteModal(selectedRestaurant);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsDetailsModalOpen(false);
                openEditModal(selectedRestaurant);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#05291e] hover:bg-[#084231] rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
