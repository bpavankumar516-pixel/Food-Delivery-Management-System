import React from "react";

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Right Canvas Background: Soft Warm Ivory */}
      <div className="absolute inset-0 bg-[#faf8f3]" />

      {/* Main SVG Container for Precise Responsive S-Curve Boundary at 60% / 40% split (Desktop: lg+) */}
      <svg
        className="hidden lg:block absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* S-Curve Boundary Clip Path at 60% */}
          <clipPath id="heroCurveClip">
            <path
              d="
                M 0,0 
                L 600,0 
                C 615,60  642,130  635,210
                C 626,305  560,405  565,520
                C 570,630  625,720  616,810
                C 606,890  578,955  570,1000
                L 0,1000
                Z
              "
            />
          </clipPath>

          {/* Seamless Top Text Overlay: ONLY covers top 45% for text readability */}
          {/* Bottom 55% where food lives is 100% transparent and crystal-clear */}
          <linearGradient
            id="textTopGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#052419" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#062e20" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#083a29" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#083a29" stopOpacity="0.0" />
          </linearGradient>

          {/* Ultra-HD Clarity & Contrast Boost Filter */}
          <filter id="hdClarityFilter" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.08" intercept="-0.02" />
              <feFuncG type="linear" slope="1.08" intercept="-0.02" />
              <feFuncB type="linear" slope="1.08" intercept="-0.02" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* Left 100vh Hero Panel with Crystal-Clear HD Food Photography */}
        <g clipPath="url(#heroCurveClip)">
          {/* Base Dark Green Underlay */}
          <rect x="0" y="0" width="700" height="1000" fill="#041a12" />

          {/* 100vh Ultra-HD Commercial Food Photography (Native resolution, 100% crisp & sharp) */}
          <image
            href="/food-hd-showcase.jpg"
            x="0"
            y="0"
            width="650"
            height="1000"
            preserveAspectRatio="xMidYMax slice"
            filter="url(#hdClarityFilter)"
            style={{ imageRendering: "high-quality" }}
          />

          {/* Top Text Backdrop Overlay: Strictly covers upper region (y: 0 to 460) */}
          <rect
            x="0"
            y="0"
            width="700"
            height="460"
            fill="url(#textTopGradient)"
          />
        </g>
      </svg>

      {/* Decorative Organic Floating Leaves on Canvas (Visible on Tablet & Desktop) */}
      <div className="hidden sm:block absolute top-[28%] right-4 lg:right-6 w-6 h-6 lg:w-7 lg:h-7 text-[#97bd7c]/70 transform rotate-12 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>

      <div className="hidden sm:block absolute bottom-[6%] right-6 lg:right-8 w-7 h-7 lg:w-8 lg:h-8 text-[#97bd7c]/60 transform -rotate-45 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>
    </div>
  );
}
