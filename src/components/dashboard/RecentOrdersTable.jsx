import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { toast } from 'react-toastify';

export default function RecentOrdersTable() {
  const { orders, setSelectedOrder } = useDashboard();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Preparing':
        return 'bg-amber-100/80 text-amber-800 border border-amber-200/60';
      case 'Out for Delivery':
        return 'bg-sky-100/80 text-sky-800 border border-sky-200/60';
      case 'Delivered':
        return 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/60';
      case 'Cancelled':
        return 'bg-rose-100/80 text-rose-800 border border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Recent Orders</h3>
        </div>

        <button
          type="button"
          onClick={() => toast.info('Navigating to full Orders management')}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 tracking-wider">
              <th className="py-2.5 font-semibold">Order ID</th>
              <th className="py-2.5 font-semibold">Customer</th>
              <th className="py-2.5 font-semibold">Restaurant</th>
              <th className="py-2.5 font-semibold">Amount</th>
              <th className="py-2.5 font-semibold">Status</th>
              <th className="py-2.5 font-semibold">Order Time</th>
              <th className="py-2.5 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                  No orders match your search criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Order ID */}
                  <td className="py-3 font-bold text-slate-900">{order.id}</td>

                  {/* Customer with Avatar */}
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={order.customer.avatar}
                        alt={order.customer.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {order.customer.name}
                      </span>
                    </div>
                  </td>

                  {/* Restaurant */}
                  <td className="py-3 text-slate-600 font-medium">{order.restaurant}</td>

                  {/* Amount */}
                  <td className="py-3 font-bold text-slate-900">₹{order.amount}</td>

                  {/* Status Pill */}
                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Order Time */}
                  <td className="py-3 text-slate-500 font-medium">{order.orderTime}</td>

                  {/* Action Button */}
                  <td className="py-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="px-3 py-1 rounded-md border border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
