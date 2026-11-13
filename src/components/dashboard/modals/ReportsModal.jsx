import React from 'react';
import { X, BarChart3, Download, ArrowUpRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../../context/DashboardContext';
import { toast } from 'react-toastify';

export default function ReportsModal() {
  const navigate = useNavigate();
  const { isReportsOpen, setIsReportsOpen, stats, revenueData, allOrders } = useDashboard();

  if (!isReportsOpen) return null;

  const eligibleOrders = (allOrders || []).filter(
    (o) => !['Cancelled', 'Rejected'].includes(o.status)
  );
  const completionRate =
    eligibleOrders.length > 0
      ? Math.round((stats.deliveredOrders / Math.max(stats.totalOrders, 1)) * 100)
      : 0;

  const handleDownload = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Gross Platform Sales', `₹${(stats.eligibleRevenue || 0).toLocaleString('en-IN')}`],
      ['Average Order Value (AOV)', `₹${stats.averageOrderValue || 0}`],
      ['Total Orders', stats.totalOrders || 0],
      ['Delivered Orders', stats.deliveredOrders || 0],
      ['Active Restaurants', stats.totalRestaurants || 0],
      ['Total Customers', stats.totalCustomers || 0],
    ];
    const csvContent = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foodix-executive-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Foodix Executive Summary exported as CSV!');
  };

  const metrics = [
    {
      label: 'Gross Platform Sales',
      value: `₹${(stats.eligibleRevenue || 0).toLocaleString('en-IN')}`,
      change: `${revenueData.growth || '+0%'} trend`,
      positive: true,
    },
    {
      label: 'Average Order Value (AOV)',
      value: `₹${stats.averageOrderValue || 0}`,
      change: `${eligibleOrders.length} valid orders`,
      positive: true,
    },
    {
      label: 'Order Fulfillment Rate',
      value: `${completionRate}%`,
      change: `${stats.deliveredOrders} delivered`,
      positive: true,
    },
    {
      label: 'Avg Restaurant Rating',
      value: `${stats.avgRestaurantRating || '4.5'} / 5.0`,
      change: `${stats.totalCustomers} customers`,
      positive: true,
    },
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsReportsOpen(false);
                navigate('/reports');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#05291e] text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Analytics</span>
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
    </div>
  );
}
