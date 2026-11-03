import React from 'react';
import { Clock, Bike, Store, Check, User, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { toast } from 'react-toastify';

export default function RecentActivities() {
  const { activities } = useDashboard();

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'restaurant':
        return <Store className="w-4 h-4 text-orange-600" />;
      case 'delivery':
        return <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />;
      case 'customer':
        return <User className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50';
      case 'restaurant':
        return 'bg-orange-50';
      case 'delivery':
        return 'bg-emerald-50';
      case 'customer':
        return 'bg-blue-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs h-full flex flex-col justify-between">
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
          onClick={() => toast.info('Displaying full platform activity timeline')}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Activity Items List matching reference - flex-1 and evenly distributed */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center gap-3 group">
            {/* Round Icon */}
            <div
              className={`w-8 h-8 rounded-full ${getBgColor(
                act.type
              )} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
            >
              {getIcon(act.type)}
            </div>

            {/* Texts */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-snug truncate">{act.title}</p>
              {act.subtitle && (
                <p className="text-[11px] font-medium text-slate-500 leading-snug">{act.subtitle}</p>
              )}
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
