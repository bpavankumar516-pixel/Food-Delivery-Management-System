import React from "react";
import Logo from "../common/Logo";

export default function AuthHero() {
  return (
    <div className="relative w-full h-full max-h-screen flex flex-col justify-between pt-5 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 px-4 sm:px-8 lg:px-10 xl:px-12 select-none overflow-hidden">
      {/* Mobile Food Background (< lg screens) */}
      <div className="lg:hidden absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <img
          src="/food-hd-showcase.jpg"
          alt="Fresh Gourmet Food Delivery"
          className="w-full h-full object-cover object-center filter brightness-[0.80]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#052419]/92 via-[#052419]/75 to-[#041a12]/95" />
      </div>

      {/* Top Section: Brand Logo */}
      <div className="relative z-10 flex items-center shrink-0 mb-3 sm:mb-4 lg:mb-0">
        <Logo theme="light" size="normal" showSubtitle={true} />
      </div>

      {/* Middle Section: Typography & 3 Core Features matching reference image */}
      <div className="relative z-10 my-auto py-2 sm:py-3 shrink-0">
        <div className="max-w-md xl:max-w-lg">
          {/* Main Headline with High-Contrast Multi-Layer Shadows */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[50px] font-black tracking-tight leading-[1.08] mb-2 sm:mb-2.5">
            <span
              className="text-white block drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              style={{
                textShadow:
                  "0 2px 4px rgba(0,0,0,0.95), 0 4px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)",
              }}
            >
              Good Food
            </span>
            <span
              className="text-[#ff6022] block drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
              style={{
                textShadow:
                  "0 2px 4px rgba(0,0,0,0.95), 0 4px 14px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.75)",
              }}
            >
              Better Mood
            </span>
          </h1>

          {/* Subtitle with High Legibility */}
          <p
            className="text-white text-xs sm:text-sm max-w-sm font-semibold leading-relaxed mb-3 sm:mb-4"
            style={{
              textShadow:
                "0 1px 3px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8)",
            }}
          >
            Manage restaurants, orders, customers and more – all in one place.
          </p>

          {/* 3 Core Feature Items Strip with Vertical Dividers matching reference image */}
          <div className="flex items-center justify-between max-w-[340px] sm:max-w-[380px] my-2 py-1">
            {/* Feature 1: Fast Delivery */}
            <div className="flex-1 flex flex-col items-center justify-center text-center group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0a3a29] border border-emerald-400/30 flex items-center justify-center text-white shadow-lg mb-1.5 group-hover:scale-105 transition-transform">
                {/* Delivery Scooter SVG with Cargo Box */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <circle cx="6" cy="18" r="2.5" />
                  <circle cx="18" cy="18" r="2.5" />
                  <path d="M8.5 18h6.5" />
                  <path d="M6 15.5l2.5-5h3l2.5 5" />
                  <path d="M14 7.5l1.5 3" />
                  <path d="M13 7.5h3" />
                  <rect x="3.5" y="9" width="4.5" height="4.5" rx="1" />
                </svg>
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Fast
              </span>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Delivery
              </span>
            </div>

            {/* Vertical Divider 1 */}
            <div
              className="h-12 sm:h-14 w-px bg-white/40 shrink-0 mx-2"
              style={{ boxShadow: "0 0 4px rgba(0,0,0,0.8)" }}
            />

            {/* Feature 2: Fresh & Hygienic */}
            <div className="flex-1 flex flex-col items-center justify-center text-center group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0a3a29] border border-emerald-400/30 flex items-center justify-center text-white shadow-lg mb-1.5 group-hover:scale-105 transition-transform">
                {/* Shield Check SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Fresh &
              </span>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Hygienic
              </span>
            </div>

            {/* Vertical Divider 2 */}
            <div
              className="h-12 sm:h-14 w-px bg-white/40 shrink-0 mx-2"
              style={{ boxShadow: "0 0 4px rgba(0,0,0,0.8)" }}
            />

            {/* Feature 3: Wide Variety */}
            <div className="flex-1 flex flex-col items-center justify-center text-center group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0a3a29] border border-emerald-400/30 flex items-center justify-center text-white shadow-lg mb-1.5 group-hover:scale-105 transition-transform">
                {/* Fork and Knife SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <path d="M7 2v6a2 2 0 0 0 2 2v12" />
                  <path d="M7 2v6" />
                  <path d="M5 2v4a2 2 0 0 0 2 2" />
                  <path d="M16 2v20" />
                  <path d="M16 2c3 0 3 4 3 8v4h-3" />
                </svg>
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Wide
              </span>
              <span
                className="text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                Variety
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: "Freshly Made Just for You ♡" on the rustic wooden table surface matching reference */}
      <div className="relative z-10 shrink-0 pb-3 sm:pb-5 lg:pb-6 pt-1 select-none">
        <div className="inline-block transform -rotate-[8deg] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <p
            className="text-white text-2xl sm:text-3xl lg:text-[34px] font-bold leading-tight"
            style={{
              fontFamily: "'Caveat', cursive",
              textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.8)",
            }}
          >
            <span className="block tracking-wide">Freshly Made</span>
            <span className="flex items-center gap-1.5">
              <span className="tracking-wide">Just for You</span>
              <span className="text-[#ff6022] text-xl sm:text-2xl font-bold ml-1">♡</span>
            </span>
          </p>

          {/* Orange underline swoosh curve matching reference */}
          <svg
            viewBox="0 0 160 14"
            fill="none"
            className="w-32 sm:w-40 lg:w-44 h-3.5 mt-0.5 drop-shadow-[0_2px_6px_rgba(255,96,34,0.4)]"
          >
            <path
              d="M 4,5 C 50,13 115,12 156,2"
              stroke="#ff6022"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
