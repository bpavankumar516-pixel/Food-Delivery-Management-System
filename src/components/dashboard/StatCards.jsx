import React from 'react';
import { Store, Utensils, ShoppingBag, Clock, CheckCircle2, Users, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function StatCards() {
  const { stats } = useDashboard();

  const cardData = [
    {
      id: 'restaurants',
      title: 'Total Restaurants',
      value: stats.totalRestaurants,
      change: stats.totalRestaurantsChange,
      icon: Store,
      iconColor: 'text-[#0f766e]',
      iconBg: 'bg-[#e6f4ea]',
      trendColor: 'text-emerald-600',
      sparklineColor: '#10b981',
      sparkPath: 'M0,25 C15,22 25,28 35,20 C45,12 55,22 65,14 C75,8 85,14 100,2',
    },
    {
      id: 'food_items',
      title: 'Total Food Items',
      value: stats.totalFoodItems,
      change: stats.totalFoodItemsChange,
      icon: Utensils,
      iconColor: 'text-[#ea580c]',
      iconBg: 'bg-[#fef3e6]',
      trendColor: 'text-orange-600',
      sparklineColor: '#f97316',
      sparkPath: 'M0,22 C15,24 25,18 38,20 C50,22 60,10 75,14 C85,16 92,8 100,4',
    },
    {
      id: 'total_orders',
      title: 'Total Orders',
      value: Number(stats.totalOrders).toLocaleString(),
      change: stats.totalOrdersChange,
      icon: ShoppingBag,
      iconColor: 'text-[#0d9488]',
      iconBg: 'bg-[#e6f7ef]',
      trendColor: 'text-emerald-600',
      sparklineColor: '#10b981',
      sparkPath: 'M0,26 C12,24 24,18 36,22 C48,26 60,12 72,16 C84,18 92,6 100,2',
    },
    {
      id: 'active_orders',
      title: 'Active Orders',
      value: stats.activeOrders,
      change: stats.activeOrdersChange,
      icon: Clock,
      iconColor: 'text-[#2563eb]',
      iconBg: 'bg-[#e8f0fe]',
      trendColor: 'text-blue-600',
      sparklineColor: '#3b82f6',
      sparkPath: 'M0,24 C14,24 26,16 40,22 C52,26 65,12 78,18 C88,20 94,8 100,3',
    },
    {
      id: 'delivered_orders',
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      change: stats.deliveredOrdersChange,
      icon: CheckCircle2,
      iconColor: 'text-[#7c3aed]',
      iconBg: 'bg-[#f3e8fd]',
      trendColor: 'text-purple-600',
      sparklineColor: '#8b5cf6',
      sparkPath: 'M0,25 C12,26 24,19 38,23 C50,26 62,14 74,17 C85,18 92,7 100,2',
    },
    {
      id: 'total_customers',
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: stats.totalCustomersChange,
      icon: Users,
      iconColor: 'text-[#059669]',
      iconBg: 'bg-[#e6f4ea]',
      trendColor: 'text-emerald-600',
      sparklineColor: '#10b981',
      sparkPath: 'M0,26 C15,22 25,26 38,18 C50,10 62,24 75,14 C85,8 92,15 100,3',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
      {cardData.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between group"
          >
            {/* Top row: Icon container */}
            <div className="flex items-center justify-between mb-2 sm:mb-2.5">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Middle: Label and Big Value */}
            <div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight mb-1">
                {card.title}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-2.5">
                {card.value}
              </h3>
            </div>

            {/* Bottom: Trend and Sparkline matching reference */}
            <div className="flex items-center justify-between pt-1">
              <div className={`flex items-center gap-0.5 text-xs font-bold ${card.trendColor}`}>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{card.change}</span>
              </div>

              {/* Sparkline curve */}
              <div className="w-14 sm:w-16 h-7 flex items-center">
                <svg viewBox="0 0 100 30" fill="none" className="w-full h-full overflow-visible">
                  <path
                    d={card.sparkPath}
                    stroke={card.sparklineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
