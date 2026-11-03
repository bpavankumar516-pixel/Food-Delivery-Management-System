import React from 'react';
import { X, BarChart3, Download, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { toast } from 'react-toastify';

export default function ReportsModal() {
  const { isReportsOpen, setIsReportsOpen, stats, revenueData } = useDashboard();

  if (!isReportsOpen) return null;

  const handleDownload = () => {
    toast.success('Foodix Executive Business Report downloaded (PDF)!');
  };

  const metrics = [
    { label: 'Gross Platform Sales', value: '₹4,82,900', change: '+22.4%', positive: true },
    { label: 'Average Order Value (AOV)', value: '₹386', change: '+5.1%', positive: true },
    { label: 'Average Delivery Time', value: '24 mins', change: '-3.2 mins', positive: true },
    { label: 'Customer Satisfaction Score', value: '4.8 / 5.0', change: '+0.2', positive: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Platform Performance Analytics</h3>
              <p className="text-[11px] text-emerald-200/80">Executive Growth & Sales Metrics</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReportsOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block mb-1">
                  {m.label}
                </span>
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  {m.value}
                </span>
                <span className="text-[10.5px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  {m.change}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Platform Health: Optimal (99.98% Uptime)</span>
            </div>
            <p className="text-emerald-700/90 text-[11px]">
              Active restaurants: {stats.totalRestaurants} | Total delivered orders: {stats.deliveredOrders} | Active deliveries right now: {stats.activeOrders}.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportsOpen(false)}
            className="px-5 py-2 rounded-xl bg-[#05291e] hover:bg-[#073829] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
