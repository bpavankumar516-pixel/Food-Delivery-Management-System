import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ShoppingBag, Tag, Info, Sliders } from 'lucide-react';
import { useCustomerPortal } from '../../../context/CustomerPortalContext';

export default function NotificationsSection() {
  const navigate = useNavigate();
  const {
    myNotifications,
    myUnreadNotificationsCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    preferences,
    updatePreferences,
  } = useCustomerPortal();

  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    return myNotifications.filter((n) => {
      if (filter === 'Unread') return !n.isRead;
      if (filter === 'Orders') return ['order', 'status', 'cancellation'].includes(n.type);
      if (filter === 'Offers') return ['coupon', 'offer'].includes(n.type);
      return true;
    });
  }, [myNotifications, filter]);

  const getIcon = (type) => {
    if (type === 'coupon' || type === 'offer') return Tag;
    if (type === 'order' || type === 'status' || type === 'cancellation') return ShoppingBag;
    return Info;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#202A24]">Notifications</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {myUnreadNotificationsCount} unread alert{myUnreadNotificationsCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#163A2D] text-white font-bold text-xs cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          {myNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Notification Preferences Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-black text-[#163A2D]">
          <Sliders className="w-3.5 h-3.5 text-[#FF6B35]" />
          Alert Channels:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { key: 'orderUpdates', label: 'Order Updates' },
            { key: 'promoOffers', label: 'Promo Offers' },
            { key: 'emailAlerts', label: 'Email Receipts' },
          ].map((pref) => (
            <label key={pref.key} className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={!!preferences[pref.key]}
                onChange={() => updatePreferences({ [pref.key]: !preferences[pref.key] })}
                className="accent-[#FF6B35]"
              />
              <span>{pref.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Unread', 'Orders', 'Offers'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold border cursor-pointer ${
              filter === f
                ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-2">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-black text-sm text-[#202A24]">No Notifications</p>
          <p className="text-xs text-slate-500">You are all caught up on order and promo alerts.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.orderId) {
                    navigate(`/customer/tracking/${encodeURIComponent(n.orderId)}`);
                  } else if (n.type === 'coupon') {
                    navigate('/customer/settings?tab=offers');
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-200/70'
                    : 'bg-[#FFF8F0] border-orange-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.isRead
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-[#FF6B35] text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-xs sm:text-sm text-[#202A24]">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B35] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <span className="text-[10.5px] text-slate-400 font-semibold block mt-1">
                      {n.timeFormatted || 'Recent'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
