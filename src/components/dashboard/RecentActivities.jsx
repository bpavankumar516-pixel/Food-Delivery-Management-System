import React from 'react';
import { Clock, Bike, Store, Check, User, ArrowRight, Heart, Trash2, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';

export default function RecentActivities() {
  const { activities, setIsAllActivitiesOpen } = useDashboard();
  const navigate = useNavigate();

  const getIcon = (act) => {
    switch (act.action || act.type) {
      case 'create':
      case 'restaurant':
        return <Store className="w-4 h-4 text-orange-600" />;
      case 'status':
        return act.color === 'emerald' ? (
          <Store className="w-4 h-4 text-emerald-600" />
        ) : (
          <Store className="w-4 h-4 text-rose-600" />
        );
      case 'update':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'favorite':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />;
      case 'order':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'delivery':
        return <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />;
      case 'customer':
        return <User className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBgColor = (act) => {
    switch (act.color) {
      case 'orange':
        return 'bg-orange-50';
      case 'emerald':
        return 'bg-emerald-50';
      case 'blue':
        return 'bg-blue-50';
      case 'rose':
        return 'bg-rose-50';
      default:
        return 'bg-slate-50';
    }
  };

  const handleItemClick = (act) => {
    if (act.restaurantId) {
      navigate(`/restaurants/${act.restaurantId}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Recent Activities</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAllActivitiesOpen(true)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Activity Items List matching reference (showing top 4 real-time items) */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-2.5">
        {activities.slice(0, 4).map((act) => (
          <div
            key={act.id}
            onClick={() => handleItemClick(act)}
            className={`flex items-center gap-3 p-1.5 -mx-1.5 rounded-xl transition-all ${
              act.restaurantId ? 'cursor-pointer hover:bg-slate-50 group' : ''
            }`}
          >
            {/* Round Icon */}
            <div
              className={`w-8 h-8 rounded-full ${getBgColor(
                act
              )} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
            >
              {getIcon(act)}
            </div>

            {/* Texts */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-snug truncate group-hover:text-emerald-700 transition-colors">
                {act.title}
              </p>
              {act.subtitle && (
                <p className="text-[11px] font-medium text-slate-500 leading-snug truncate">
                  {act.subtitle}
                </p>
              )}
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{act.time}</span>
            </div>

            {act.restaurantId && (
              <span className="text-slate-300 group-hover:text-emerald-600 transition-colors text-xs font-bold hidden sm:inline">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
