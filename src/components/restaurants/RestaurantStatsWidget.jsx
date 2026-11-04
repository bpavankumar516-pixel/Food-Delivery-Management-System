import React from 'react';
import { Store, CheckCircle, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function RestaurantStatsWidget() {
  const { stats } = useRestaurants();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Store className="w-4.5 h-4.5" />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
          Restaurant Stats
        </h3>
      </div>

      {/* 3 Metrics Rows */}
      <div className="space-y-3.5">
        {/* Total Restaurants */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 hover:bg-emerald-50/80 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 font-medium">Total Restaurants</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {stats.totalRestaurants}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{stats.totalChange}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Open Restaurants */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-teal-50/40 border border-teal-100/60 hover:bg-teal-50/80 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 font-medium">Open Restaurants</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {stats.openRestaurants}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{stats.openChange}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Closed Restaurants */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50/80 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 font-medium">Closed Restaurants</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {stats.closedRestaurants}
              </span>
              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                <span>{stats.closedChange}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
