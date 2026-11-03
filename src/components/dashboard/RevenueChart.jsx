import React, { useState } from 'react';
import { BarChart3, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function RevenueChart() {
  const { revenueData, revenueTimeframe, setRevenueTimeframe } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePointIndex, setActivePointIndex] = useState(revenueData.points.length - 1);

  const timeframes = ['Last 7 Days', 'Last 30 Days', 'This Month'];
  const points = revenueData.points;
  const activePoint = points[activePointIndex] || points[points.length - 1];

  // SVG Chart dimensions and coordinates calculation
  // ViewBox: 0 0 500 160
  const chartWidth = 500;
  const chartHeight = 150;
  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 20;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Max value calculation for Y-scale (default 80000 or scaled)
  const maxValue = Math.max(...points.map((p) => p.value), 80000);

  // Compute (x, y) coordinates for each point
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - (p.value / maxValue) * innerHeight;
    return { ...p, x, y };
  });

  // Generate smooth SVG Catmull-Rom or cubic Bezier spline
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${chartHeight} L ${coords[0].x},${chartHeight} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between">
      {/* Header Row: Title & Dropdown */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Revenue Overview</h3>
        </div>

        {/* Dropdown for Timeframe */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <span>{revenueTimeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setRevenueTimeframe(tf);
                    setIsDropdownOpen(false);
                    setActivePointIndex(0);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    revenueTimeframe === tf
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Stat & Growth indicator matching reference */}
      <div className="mb-2 shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            {activePoint ? `₹${Number(activePoint.value).toLocaleString()}` : revenueData.total}
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
          <span className="inline-flex items-center font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            {revenueData.growth}
          </span>
          <span>{revenueData.vsPeriod}</span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex gap-3 pt-2 pb-6">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[11px] font-medium text-slate-400 py-1 text-right w-9 shrink-0 select-none">
          <span>₹80k</span>
          <span>₹60k</span>
          <span>₹40k</span>
          <span>₹20k</span>
          <span>₹0</span>
        </div>

        {/* SVG Curve Container */}
        <div className="relative flex-1 h-44 sm:h-48">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
            <div className="w-full border-b border-slate-100/90" />
            <div className="w-full border-b border-slate-100/90" />
            <div className="w-full border-b border-slate-100/90" />
            <div className="w-full border-b border-slate-100/90" />
            <div className="w-full border-b border-slate-200/90" />
          </div>

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaPath} fill="url(#revenueGradient)" />

            {/* Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Data Nodes */}
            {coords.map((pt, idx) => {
              const isActive = idx === activePointIndex;
              return (
                <g key={pt.label} className="cursor-pointer">
                  {/* Outer glow on active */}
                  {isActive && (
                    <circle cx={pt.x} cy={pt.y} r="8" fill="#10b981" fillOpacity="0.25" />
                  )}
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive ? '4.5' : '3.5'}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all hover:scale-125"
                    onMouseEnter={() => setActivePointIndex(idx)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Pill matching reference image */}
          {coords[activePointIndex] && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
              style={{
                left: `${(coords[activePointIndex].x / chartWidth) * 100}%`,
                top: `${(coords[activePointIndex].y / chartHeight) * 100 - 12}%`,
              }}
            >
              <div className="relative bg-[#05291e] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                ₹{Number(coords[activePointIndex].value).toLocaleString()}
                {/* Pointer Arrow */}
                <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-2 h-2 bg-[#05291e] rotate-45" />
              </div>
            </div>
          )}

          {/* X-Axis Labels */}
          <div className="absolute -bottom-6 inset-x-0 flex justify-between text-[11px] font-medium text-slate-400 select-none px-2">
            {coords.map((pt, idx) => (
              <span
                key={pt.label}
                onClick={() => setActivePointIndex(idx)}
                className={`cursor-pointer transition-colors ${
                  idx === activePointIndex ? 'text-emerald-700 font-bold' : 'hover:text-slate-600'
                }`}
              >
                {pt.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
