import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ShoppingBag,
  Store,
  Download,
  Printer,
  PieChart,
  Users,
  Tag,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useOrders } from '../context/OrderContext';
import { useRestaurants } from '../context/RestaurantContext';
import { useCustomers } from '../context/CustomerContext';
import { useCoupons } from '../context/CouponContext';

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { orders } = useOrders();
  const { restaurants } = useRestaurants();
  const { customers } = useCustomers();
  const { coupons } = useCoupons();
  const [referenceTime] = useState(() => Date.now());

  // Filters
  const [timeframe, setTimeframe] = useState('Last 30 Days'); // 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'This Year'
  const [restaurantFilter, setRestaurantFilter] = useState('All');
  const [reportTab, setReportTab] = useState('overview'); // 'overview' | 'customers' | 'coupons'

  // Filter eligible orders based on timeframe and restaurant
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (restaurantFilter !== 'All') {
      list = list.filter((o) => o.restaurant === restaurantFilter);
    }

    if (timeframe === 'Today') {
      const oneDay = 24 * 60 * 60 * 1000;
      list = list.filter((o) => (o.timestamp || referenceTime) >= referenceTime - oneDay);
    } else if (timeframe === 'Last 7 Days') {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      list = list.filter((o) => (o.timestamp || referenceTime) >= referenceTime - sevenDays);
    } else if (timeframe === 'Last 30 Days') {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      list = list.filter((o) => (o.timestamp || referenceTime) >= referenceTime - thirtyDays);
    }

    return list;
  }, [orders, restaurantFilter, timeframe, referenceTime]);

  // Financial Metrics: Excludes Cancelled and Rejected orders
  const validCompletedOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected');
  }, [filteredOrders]);

  const financialMetrics = useMemo(() => {
    const totalRevenue = validCompletedOrders.reduce(
      (sum, o) => sum + (o.grandTotal || o.amount || 0),
      0
    );
    const totalDiscount = validCompletedOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalTaxes = validCompletedOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const totalDeliveryFees = validCompletedOrders.reduce(
      (sum, o) => sum + (o.deliveryFee || 0),
      0
    );
    const avgTicket =
      validCompletedOrders.length > 0
        ? Math.round(totalRevenue / validCompletedOrders.length)
        : 0;

    const cancelledCount = filteredOrders.filter((o) => o.status === 'Cancelled').length;
    const rejectedCount = filteredOrders.filter((o) => o.status === 'Rejected').length;
    const deliveredCount = filteredOrders.filter((o) => o.status === 'Delivered').length;

    return {
      totalRevenue,
      totalDiscount,
      totalTaxes,
      totalDeliveryFees,
      avgTicket,
      totalOrders: filteredOrders.length,
      validOrdersCount: validCompletedOrders.length,
      deliveredCount,
      cancelledCount,
      rejectedCount,
    };
  }, [filteredOrders, validCompletedOrders]);

  // Restaurant Performance Aggregation
  const restaurantPerformance = useMemo(() => {
    const map = {};
    validCompletedOrders.forEach((o) => {
      const name = o.restaurant || 'Other';
      if (!map[name]) {
        map[name] = { name, ordersCount: 0, revenue: 0 };
      }
      map[name].ordersCount += 1;
      map[name].revenue += o.grandTotal || o.amount || 0;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [validCompletedOrders]);

  // Top Selling Items Aggregation
  const topSellingItems = useMemo(() => {
    const map = {};
    validCompletedOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.name || 'Food item';
        if (!map[name]) {
          map[name] = { name, qty: 0, revenue: 0 };
        }
        const qty = item.qty || 1;
        map[name].qty += qty;
        map[name].revenue += (item.price || 0) * qty;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 7);
  }, [validCompletedOrders]);

  // Status breakdown for Donut Chart
  const statusBreakdown = useMemo(() => {
    const counts = {
      Delivered: 0,
      'Out for Delivery': 0,
      Preparing: 0,
      Confirmed: 0,
      Pending: 0,
      Cancelled: 0,
      Rejected: 0,
    };
    filteredOrders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });
    return counts;
  }, [filteredOrders]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.warn('No order records to export in the selected range.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer',
      'Restaurant',
      'Status',
      'Subtotal',
      'Discount',
      'Tax',
      'Delivery Fee',
      'Grand Total',
      'Payment Method',
      'Date',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.customer?.name || 'Customer'}"`,
      `"${o.restaurant}"`,
      o.status,
      o.subtotal || o.amount || 0,
      o.discount || 0,
      o.tax || 0,
      o.deliveryFee || 0,
      o.grandTotal || o.amount || 0,
      `"${o.paymentMethod || 'Online'}"`,
      `"${o.placedAt || 'Recent'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodix_sales_report_${timeframe.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sales report exported as CSV!');
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-6">
          {/* Top Pastel Hero Banner (Consistent across Foodix Pages) */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#fef8f0] via-[#fffbf6] to-[#f2f7ef] border border-orange-100/80 p-5 sm:p-6 overflow-hidden shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/15">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e22] tracking-tight">
                    Reports & Analytics Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Real-time sales telemetry, linked customer spend analytics, coupon redemptions, and fulfillment rates.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-bold text-xs shadow-md shadow-orange-600/25 transition-transform active:scale-98 cursor-pointer"
                  title="Download CSV dataset"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Report View Tabs & Timeframe Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'overview', label: 'Orders & Sales Overview', icon: BarChart3 },
                { id: 'customers', label: `Customer Insights (${customers.length})`, icon: Users },
                { id: 'coupons', label: `Coupon Analytics (${coupons.length})`, icon: Tag },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = reportTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReportTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#ff5722] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeframe === t
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}

              <select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="All">All Restaurants</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Net Eligible Revenue</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                ₹{financialMetrics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Excludes cancelled ({financialMetrics.cancelledCount}) & rejected ({financialMetrics.rejectedCount})
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Average Order Value</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{financialMetrics.avgTicket.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Per fulfilled diner cart</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Voucher Discounts Given</span>
              <p className="text-2xl sm:text-3xl font-black text-[#ff5722]">
                ₹{financialMetrics.totalDiscount.toLocaleString()}
              </p>
              <p className="text-[11px] text-orange-600 font-semibold">Subsidized promotion</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Fulfilled Orders</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {financialMetrics.validOrdersCount}{' '}
                <span className="text-sm font-normal text-slate-400">/ {financialMetrics.totalOrders}</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {financialMetrics.totalOrders > 0
                  ? `${Math.round((financialMetrics.validOrdersCount / financialMetrics.totalOrders) * 100)}% fulfillment rate`
                  : '100%'}
              </p>
            </div>
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Revenue & Volume Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900">Revenue Trajectory</h3>
                  <p className="text-xs text-slate-400">Visual breakdown across fulfillment batches</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Computed
                </span>
              </div>

              {/* Responsive SVG Bar Visualization */}
              <div className="pt-4">
                <div className="h-64 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                  {validCompletedOrders.slice(0, 8).map((ord, idx) => {
                    const maxVal = Math.max(...validCompletedOrders.map((o) => o.grandTotal || o.amount || 500));
                    const heightPercent = Math.max(Math.round(((ord.grandTotal || ord.amount || 100) / maxVal) * 100), 15);

                    return (
                      <div key={ord.id} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{ord.grandTotal || ord.amount}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-[#064e3b] to-[#10b981] rounded-t-xl group-hover:from-[#ff5722] group-hover:to-[#ff8a65] transition-all shadow-xs"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[50px]">
                          {ord.id.replace('#', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-2 px-2 font-medium">
                  <span>Earliest Orders</span>
                  <span>Latest Batch</span>
                </div>
              </div>
            </div>

            {/* Right Col: Order Status Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900">Order Status Distribution</h3>
                <PieChart className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Delivered', count: statusBreakdown.Delivered, color: 'bg-emerald-500' },
                  { label: 'Out for Delivery', count: statusBreakdown['Out for Delivery'], color: 'bg-sky-500' },
                  { label: 'Preparing / Kitchen', count: statusBreakdown.Preparing, color: 'bg-amber-500' },
                  { label: 'Pending / Confirmed', count: statusBreakdown.Pending + statusBreakdown.Confirmed, color: 'bg-indigo-500' },
                  { label: 'Cancelled / Rejected', count: statusBreakdown.Cancelled + statusBreakdown.Rejected, color: 'bg-rose-500' },
                ].map((s) => {
                  const pct =
                    filteredOrders.length > 0 ? Math.round((s.count / filteredOrders.length) * 100) : 0;
                  return (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                          <span>{s.label}</span>
                        </span>
                        <span>
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Restaurant & Menu Sales Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Merchant Revenue */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#064e3b]" />
                  <h3 className="font-black text-base text-slate-900">Restaurant Performance</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Ranked by revenue</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Restaurant</th>
                      <th className="py-2.5 px-3 text-center">Orders</th>
                      <th className="py-2.5 px-3 text-right">Net Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {restaurantPerformance.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No restaurant data in this range.
                        </td>
                      </tr>
                    ) : (
                      restaurantPerformance.map((r, i) => (
                        <tr key={r.name} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-black">
                              {i + 1}
                            </span>
                            <span>{r.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {r.ordersCount}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-700">
                            ₹{r.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Selling Food Items */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#ff5722]" />
                  <h3 className="font-black text-base text-slate-900">Top-Selling Dishes</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">By volume sold</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Dish Name</th>
                      <th className="py-2.5 px-3 text-center">Qty Sold</th>
                      <th className="py-2.5 px-3 text-right">Gross Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topSellingItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No menu item sales recorded in this range.
                        </td>
                      </tr>
                    ) : (
                      topSellingItems.map((item, i) => (
                        <tr key={item.name} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-orange-50 text-[#ff5722] text-[10px] flex items-center justify-center font-black">
                              {i + 1}
                            </span>
                            <span className="truncate max-w-[200px]">{item.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-black text-slate-800">
                            {item.qty}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-700">
                            ₹{item.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Customer Insights & Coupon Performance Sections (when selected or in overview) */}
          {reportTab === 'customers' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#064e3b]" />
                  <h3 className="font-black text-base text-slate-900">
                    Top Customers by Lifetime Spend (Live API)
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {customers.length} total API profiles
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4 text-center">Orders</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...customers]
                      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                      .slice(0, 10)
                      .map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={cust.avatar}
                              alt={cust.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{cust.fullName}</p>
                              <p className="text-[11px] text-slate-400">{cust.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">{cust.city}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {cust.ordersCount || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                cust.status === 'Blocked'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {cust.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">
                            ₹{(cust.totalSpent || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportTab === 'coupons' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#ff5722]" />
                  <h3 className="font-black text-base text-slate-900">
                    Promotional Coupon Redemptions
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {coupons.filter((c) => c.status === 'Active').length} active campaigns
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-black text-sm text-[#064e3b]">{c.code}</span>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{c.title}</p>
                      <span className="text-[10px] font-bold text-slate-400">
                        Min order: ₹{c.minOrderAmount || 0}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-base text-[#ff5722]">
                        {c.usedCount || 0}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
