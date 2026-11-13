import React, { useState } from 'react';
import { BarChart3, ChevronDown, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

export default function RevenueChart() {
  const { revenueData, revenueTimeframe, setRevenueTimeframe } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeframes = ['Last 7 Days', 'Last 30 Days', 'This Month'];
  const points = revenueData.points || [];

  const formatAxisTick = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return `₹${num}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Revenue Overview</h3>
        </div>

        {/* Timeframe Dropdown Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <span>{revenueTimeframe}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setRevenueTimeframe(tf);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    tf === revenueTimeframe
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Revenue Total & Delta */}
      <div className="mb-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {revenueData.total}
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
          <span className="inline-flex items-center text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            {revenueData.growth}
          </span>
          <span>{revenueData.vsPeriod}</span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-52 sm:h-56 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="foodixRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAxisTick}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#05291e',
                borderColor: '#064e3b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#a7f3d0', fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#foodixRevenueFill)"
              activeDot={{ r: 5, fill: '#ff5722', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
