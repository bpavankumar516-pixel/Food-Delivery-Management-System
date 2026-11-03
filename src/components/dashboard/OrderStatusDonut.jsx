import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';

export default function OrderStatusDonut() {
  const { orderDistribution } = useDashboard();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const segments = [
    { label: 'Preparing', percent: orderDistribution.preparingPercent, color: '#ff6900', lightColor: '#ffedd5' },
    { label: 'Out for Delivery', percent: orderDistribution.outForDeliveryPercent, color: '#00796b', lightColor: '#ccfbf1' },
    { label: 'Delivered', percent: orderDistribution.deliveredPercent, color: '#064e3b', lightColor: '#d1fae5' },
    { label: 'Cancelled', percent: orderDistribution.cancelledPercent, color: '#ef4444', lightColor: '#fee2e2' },
  ];

  // SVG Donut calculation
  // Circle radius 60, circumference = 2 * PI * 60 = 376.99
  const radius = 60;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke-dasharray and stroke-dashoffset for each segment
  let accumulatedPercent = 0;
  const computedSegments = segments.map((seg, idx) => {
    const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += seg.percent;
    return { ...seg, strokeDasharray, strokeDashoffset, idx };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900">Order Status Distribution</h3>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Arcs */}
            {computedSegments.map((seg) => {
              const isHovered = hoveredIndex === seg.idx;
              return (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(seg.idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-0.5">
              {hoveredIndex !== null
                ? `${segments[hoveredIndex].percent}%`
                : Number(orderDistribution.total).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {hoveredIndex !== null ? segments[hoveredIndex].label : 'Total Orders'}
            </span>
          </div>
        </div>

        {/* Legend on the right */}
        <div className="flex-1 w-full space-y-2.5">
          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: seg.color,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                  <span
                    className={`text-xs ${
                      isHovered ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                    }`}
                  >
                    {seg.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900">{seg.percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
