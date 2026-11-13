import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

export default function OrderStatusDonut() {
  const { orderDistribution } = useDashboard();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const segments = [
    { label: 'Preparing', percent: orderDistribution.preparingPercent, color: '#FF6B35' },
    { label: 'Out for Delivery', percent: orderDistribution.outForDeliveryPercent, color: '#00796b' },
    { label: 'Delivered', percent: orderDistribution.deliveredPercent, color: '#163A2D' },
    { label: 'Cancelled', percent: orderDistribution.cancelledPercent, color: '#ef4444' },
  ];

  const nonZeroSegments = segments.some((s) => s.percent > 0)
    ? segments.map((s) => ({ ...s, value: s.percent }))
    : [{ label: 'No Orders', percent: 100, value: 100, color: '#e2e8f0' }];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900">Order Status Distribution</h3>
      </div>

      {/* Recharts Donut Chart & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2">
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonZeroSegments}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {nonZeroSegments.map((entry, idx) => (
                  <Cell
                    key={entry.label}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={hoveredIndex === idx ? 3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Share']}
                contentStyle={{
                  backgroundColor: '#05291e',
                  borderColor: '#064e3b',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-0.5">
              {hoveredIndex !== null && segments[hoveredIndex]
                ? `${segments[hoveredIndex].percent}%`
                : Number(orderDistribution.total).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium px-2 truncate max-w-[100px]">
              {hoveredIndex !== null && segments[hoveredIndex]
                ? segments[hoveredIndex].label
                : 'Total Orders'}
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
