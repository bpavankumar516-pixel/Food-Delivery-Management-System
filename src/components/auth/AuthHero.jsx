import React from 'react';
import { Bike, ShieldCheck, Utensils } from 'lucide-react';
import Logo from '../common/Logo';

export default function AuthHero() {
  return (
    <div className="relative w-full h-full max-h-screen flex flex-col justify-between pt-6 sm:pt-7 lg:pt-8 pb-6 px-6 lg:px-10 xl:px-12 select-none overflow-hidden">
      {/* Top Section: Brand Logo */}
      <div className="relative z-10 flex items-center shrink-0">
        <Logo theme="light" size="normal" showSubtitle={true} />
      </div>

      {/* Middle Section: Typography & Feature Badges */}
      <div className="relative z-10 my-auto py-2 sm:py-3 shrink-0">
        <div className="max-w-md xl:max-w-lg">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-black tracking-tight leading-[1.08] mb-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            <span className="text-white block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Good Food</span>
            <span className="text-[#ff6022] block drop-shadow-[0_2px_14px_rgba(255,96,34,0.45)]">Better Mood</span>
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-50 text-xs sm:text-sm max-w-sm font-medium leading-relaxed mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Manage restaurants, orders, customers and more – all in one place.
          </p>

          {/* 3 Core Feature Badges (Enhanced High-Contrast Glassmorphic Cards) */}
          <div className="flex items-center gap-3 sm:gap-4 max-w-md mb-2">
            {/* Feature 1: Fast Delivery */}
            <div className="flex flex-col items-center justify-center bg-[#052419]/90 backdrop-blur-md hover:bg-[#052419] transition-all border border-emerald-400/35 rounded-2xl px-4 py-2.5 text-center min-w-[95px] sm:min-w-[105px] shadow-xl shadow-black/40">
              <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-1 shadow-inner">
                <Bike className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-[11px] font-bold text-white leading-tight">Fast Delivery</span>
            </div>

            {/* Feature 2: Fresh & Hygienic */}
            <div className="flex flex-col items-center justify-center bg-[#052419]/90 backdrop-blur-md hover:bg-[#052419] transition-all border border-emerald-400/35 rounded-2xl px-4 py-2.5 text-center min-w-[95px] sm:min-w-[105px] shadow-xl shadow-black/40">
              <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-1 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-[11px] font-bold text-white leading-tight">Fresh & Hygienic</span>
            </div>

            {/* Feature 3: Wide Variety */}
            <div className="flex flex-col items-center justify-center bg-[#052419]/90 backdrop-blur-md hover:bg-[#052419] transition-all border border-emerald-400/35 rounded-2xl px-4 py-2.5 text-center min-w-[95px] sm:min-w-[105px] shadow-xl shadow-black/40">
              <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-1 shadow-inner">
                <Utensils className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-[11px] font-bold text-white leading-tight">Wide Variety</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section Spacer */}
      <div className="relative z-10 shrink-0 h-8 sm:h-12 lg:h-16 pointer-events-none select-none" />
    </div>
  );
}
