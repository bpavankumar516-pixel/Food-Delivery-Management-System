import React from 'react';

export default function Logo({ theme = 'dark', size = 'normal', showSubtitle = true, className = '' }) {
  const isLight = theme === 'light'; // Light for dark backgrounds (Hero), dark for white cards
  const isVertical = className.includes('flex-col');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Signature Foodix Chef Hat with Fork Motif */}
      <div className="relative shrink-0 flex items-center justify-center">
        {isLight ? (
          // Hero Theme: Crisp White Chef Hat with Orange Fork Badge (matches reference image)
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              {/* Chef Hat Puffs */}
              <path
                d="M16 27C13.2 27 11 24.8 11 22C11 19.5 12.8 17.5 15.2 17.1C15 16.1 14.8 15.1 14.8 14C14.8 8.8 18.9 4.5 24 4.5C29.1 4.5 33.2 8.8 33.2 14C33.2 15.1 33 16.1 32.8 17.1C35.2 17.5 37 19.5 37 22C37 24.8 34.8 27 32 27"
                fill="white"
              />
              {/* Hat Brim */}
              <rect x="13" y="27" width="22" height="4" rx="2" fill="white" />
              {/* Orange Circle Badge with Fork */}
              <circle cx="31" cy="28" r="8.5" fill="#ff6422" />
              <path
                d="M28.5 24.5V27.5M31 24.5V27.5M33.5 24.5V27.5M28.5 27C28.5 29 33.5 29 33.5 27M31 28.5V32.5"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          // Card Theme: Rich Orange Chef Hat with White Fork (matches reference image)
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11 drop-shadow-xs">
              {/* Orange Chef Hat Puffs */}
              <path
                d="M16 27C13.2 27 11 24.8 11 22C11 19.5 12.8 17.5 15.2 17.1C15 16.1 14.8 15.1 14.8 14C14.8 8.8 18.9 4.5 24 4.5C29.1 4.5 33.2 8.8 33.2 14C33.2 15.1 33 16.1 32.8 17.1C35.2 17.5 37 19.5 37 22C37 24.8 34.8 27 32 27"
                fill="#ff6422"
              />
              {/* Orange Hat Brim */}
              <rect x="13" y="27" width="22" height="4" rx="2" fill="#ff6422" />
              {/* White Fork Cutout in Badge */}
              <circle cx="31" cy="28" r="8" fill="#ff7a3d" />
              <path
                d="M28.5 24.5V27.5M31 24.5V27.5M33.5 24.5V27.5M28.5 27C28.5 29 33.5 29 33.5 27M31 28.5V32.5"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Typography: Perfectly centered when vertical, left-aligned when horizontal */}
      <div className={`flex flex-col ${isVertical ? 'items-center text-center' : 'text-left'}`}>
        <div className={`flex items-center leading-none ${isVertical ? 'justify-center' : ''}`}>
          <span
            className={`font-black tracking-tight ${
              size === 'large' ? 'text-3xl' : 'text-2xl'
            } ${isLight ? 'text-white' : 'text-slate-900'}`}
          >
            Food
          </span>
          <span
            className={`font-black tracking-tight ${
              size === 'large' ? 'text-3xl' : 'text-2xl'
            } text-[#ff6422]`}
          >
            ix
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] sm:text-[11px] font-medium tracking-normal mt-1 leading-tight ${
              isLight ? 'text-emerald-100/75' : 'text-slate-400'
            } ${isVertical ? 'text-center' : ''}`}
          >
            Food Delivery Management System
          </span>
        )}
      </div>
    </div>
  );
}
