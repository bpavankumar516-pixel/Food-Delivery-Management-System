import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function RestaurantPromoWidget() {
  const { setIsAddModalOpen } = useRestaurants();

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#062a1f] via-[#093527] to-[#041a13] text-white p-5 sm:p-6 overflow-hidden shadow-md select-none border border-emerald-900/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Food Illustration on Right matching reference */}
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 pointer-events-none opacity-90 drop-shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=250"
          alt="Culinary pizza"
          className="w-full h-full object-cover rounded-full rotate-12 border-2 border-white/20 shadow-2xl"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[65%]">
        <h4 className="text-base sm:text-lg font-black leading-tight text-white mb-3 tracking-tight">
          More Restaurants More Choices
        </h4>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white text-xs font-bold transition-all shadow-md shadow-orange-600/30 cursor-pointer active:scale-95"
        >
          <span>Add New Restaurant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
