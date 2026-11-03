import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function PromoBanner() {
  const { setIsReportsOpen } = useDashboard();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d4e39] via-[#093c2c] to-[#05261c] text-white p-4 sm:p-5 shadow-lg border border-emerald-900/40 flex items-center justify-between min-h-[125px]">
      {/* Decorative leaf watermarks */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Background Floating Leaves (SVG) */}
      <svg
        className="absolute -top-2 left-1/3 w-8 h-8 text-emerald-400/20 transform -rotate-45 pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
      </svg>
      <svg
        className="absolute bottom-1 left-1/2 w-6 h-6 text-emerald-300/15 transform rotate-12 pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
      </svg>

      {/* Left Content */}
      <div className="relative z-10 max-w-[65%] sm:max-w-[70%]">
        <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight mb-1">
          Better Food <br className="hidden sm:inline" />
          <span className="text-white">Bigger Smiles</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-emerald-100/80 font-medium mb-3 line-clamp-1 sm:line-clamp-none">
          Grow your food business with Foodix
        </p>

        <button
          type="button"
          onClick={() => setIsReportsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff5e28] hover:bg-[#ff7539] text-white text-[11px] sm:text-xs font-bold shadow-md shadow-orange-600/30 transition-all hover:gap-2 cursor-pointer active:scale-95"
        >
          <span>View Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Burger Artwork matching reference */}
      <div className="relative z-10 shrink-0 -mr-2 sm:-mr-1 flex items-center justify-end">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
          {/* Ambient Amber Glow */}
          <div className="absolute inset-1 bg-amber-500/25 rounded-full blur-md" />

          {/* High-quality Burger Image */}
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400"
            alt="Foodix Gourmet Burger"
            className="w-full h-full object-cover rounded-full shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/food-hd-showcase.jpg';
            }}
          />

          {/* Leaf accent next to burger */}
          <div className="absolute -top-2 -right-1 w-6 h-6 text-emerald-300 drop-shadow-md pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
