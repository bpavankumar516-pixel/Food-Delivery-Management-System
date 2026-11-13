import React, { useState } from 'react';
import { X, Clock, Store, Bike, Check, User, Heart, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRestaurants } from '../../../context/RestaurantContext';

export default function AllActivitiesModal({ isOpen, onClose }) {
  const { activities, clearActivities } = useRestaurants();
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    if (filterType === 'restaurants') return act.type === 'restaurant';
    if (filterType === 'orders') return act.type === 'order' || act.type === 'delivery';
    if (filterType === 'customers') return act.type === 'customer';
    return true;
  });

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
      onClose();
      navigate(`/restaurants/${act.restaurantId}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#05291e] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Live Platform Activities</h3>
              <p className="text-xs text-emerald-300/80">Real-time audit log of platform operations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-150 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'restaurants', label: 'Restaurants' },
            { id: 'orders', label: 'Orders & Deliveries' },
            { id: 'customers', label: 'Customers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((act) => (
              <div
                key={act.id}
                onClick={() => handleItemClick(act)}
                className={`flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all ${
                  act.restaurantId ? 'cursor-pointer hover:bg-slate-50/80 group' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${getBgColor(
                    act
                  )} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {getIcon(act)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {act.time}
                    </span>
                  </div>
                  {act.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{act.subtitle}</p>
                  )}
                  {act.badge && (
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {act.badge}
                    </span>
                  )}
                </div>

                {act.restaurantId && (
                  <div className="self-center text-slate-300 group-hover:text-emerald-700 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No activities found under this filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between shrink-0 gap-2">
          <span className="text-xs text-slate-400">
            Showing {filtered.length} recent activity logs
          </span>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                type="button"
                onClick={clearActivities}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
