import React from 'react';
import { Plus, Utensils, Tag, FileText, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function QuickActions() {
  const {
    setIsAddRestaurantOpen,
    setIsAddMenuItemOpen,
    setIsApplyCouponOpen,
    setIsReportsOpen,
  } = useDashboard();

  const actions = [
    {
      id: 'add_restaurant',
      title: 'Add Restaurant',
      subtitle: 'Grow your business',
      icon: Plus,
      badgeBg: 'bg-[#059669] text-white',
      cardBg: 'bg-[#f0fdf4] hover:bg-[#dcfce7]/80 border-emerald-100',
      textColor: 'text-slate-900',
      onClick: () => setIsAddRestaurantOpen(true),
    },
    {
      id: 'add_menu_item',
      title: 'Add Menu Item',
      subtitle: 'Update menu',
      icon: Utensils,
      badgeBg: 'bg-transparent text-[#f97316]',
      cardBg: 'bg-[#fff7ed] hover:bg-[#ffedd5]/80 border-orange-100',
      textColor: 'text-slate-900',
      onClick: () => setIsAddMenuItemOpen(true),
    },
    {
      id: 'apply_coupon',
      title: 'Apply Coupon',
      subtitle: 'Create offers',
      icon: Tag,
      badgeBg: 'bg-transparent text-[#0f766e]',
      cardBg: 'bg-[#f0fdf9] hover:bg-[#ccfbf1]/80 border-teal-100',
      textColor: 'text-slate-900',
      onClick: () => setIsApplyCouponOpen(true),
    },
    {
      id: 'view_reports',
      title: 'View Reports',
      subtitle: 'Check analytics',
      icon: FileText,
      badgeBg: 'bg-transparent text-[#15803d]',
      cardBg: 'bg-[#f7fee7] hover:bg-[#ecfccb]/80 border-lime-100',
      textColor: 'text-slate-900',
      onClick: () => setIsReportsOpen(true),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-sm text-slate-900">Quick Actions</h3>
      </div>

      {/* 2x2 Action Cards matching reference image - fills available height */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-[220px]">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className={`${act.cardBg} border rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center transition-all duration-150 cursor-pointer hover:shadow-xs group`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${act.badgeBg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-xs sm:text-[13px] font-bold ${act.textColor} leading-tight`}>
                {act.title}
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                {act.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
