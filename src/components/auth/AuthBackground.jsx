import React from 'react';

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Right Canvas Background: Soft Warm Ivory */}
      <div className="absolute inset-0 bg-[#faf8f3]" />

      {/* Main SVG Container for Precise Responsive S-Curve Boundary at 60% / 40% split */}
      <svg
        className="absolute inset-0 w-full h-full"
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

          {/* Top-to-Bottom Cinematic Forest Green Vignette */}
          <linearGradient id="cinematicOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#041a12" stopOpacity="0.88" />
            <stop offset="28%" stopColor="#05241a" stopOpacity="0.70" />
            <stop offset="52%" stopColor="#083324" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#083324" stopOpacity="0.08" />
          </linearGradient>

          {/* Left-to-Right Text Backdrop Shadow */}
          <linearGradient id="textBackdropVignette" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#041a12" stopOpacity="0.82" />
            <stop offset="45%" stopColor="#041a12" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#041a12" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Left 100vh Hero Panel with Cinematic Zoomed-In Food Background clipped by S-Curve */}
        <g clipPath="url(#heroCurveClip)">
          {/* Base Dark Green Underlay */}
          <rect x="0" y="0" width="700" height="1000" fill="#041a12" />

          {/* Cinematic Zoomed-In Macro Food Photography (Scaled 1.35x & centered on burger) */}
          <g transform="translate(325, 680) scale(1.35) translate(-325, -680)">
            <image
              href="/food-hd-showcase.jpg"
              x="0"
              y="0"
              width="650"
              height="1000"
              preserveAspectRatio="xMidYMax slice"
            />
          </g>

          {/* Top-to-Bottom Gradient Overlay */}
          <rect
            x="0"
            y="0"
            width="700"
            height="1000"
            fill="url(#cinematicOverlay)"
          />

          {/* Left-to-Right Backdrop Vignette for High Text Contrast */}
          <rect
            x="0"
            y="0"
            width="700"
            height="1000"
            fill="url(#textBackdropVignette)"
          />
        </g>
      </svg>

      {/* Decorative Organic Floating Leaves on Right Canvas */}
      <div className="hidden lg:block absolute top-[28%] right-5 w-7 h-7 text-[#97bd7c]/70 transform rotate-12 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>

      <div className="hidden lg:block absolute bottom-[6%] right-8 w-8 h-8 text-[#97bd7c]/60 transform -rotate-45 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>
    </div>
  );
}
