import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Shield, Leaf, LogOut, Trash2, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import ConfirmDialog from '../../components/customerPortal/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { preferences, updatePreferences, clearSearchHistory } = useCustomerPortal();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const togglePref = (key) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  return (
    <CustomerLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202A24]">
              Customer Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Personalize your dining defaults, notifications, and privacy controls
            </p>
          </div>
        </div>

        {/* Dining & Delivery Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
          <h2 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Leaf className="w-4.5 h-4.5 text-emerald-600" />
            <span>Dining & Delivery Preferences</span>
          </h2>

          {[
            {
              key: 'vegOnlyDefault',
              title: 'Pure Veg Default Filter',
              desc: 'Automatically prioritize vegetarian kitchens when browsing Restaurants.',
            },
            {
              key: 'contactlessDelivery',
              title: 'Contactless Doorstep Delivery',
              desc: 'Pre-fill contactless instructions at checkout by default.',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-xs sm:text-sm text-[#202A24]">{item.title}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePref(item.key)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  preferences[item.key] ? 'bg-[#163A2D]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    preferences[item.key] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
          <h2 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4.5 h-4.5 text-[#FF6B35]" />
            <span>Notification Settings</span>
          </h2>

          {[
            {
              key: 'orderUpdates',
              title: 'Live Order & Rider Alerts',
              desc: 'Receive real-time updates when restaurant confirms or dispatches orders.',
            },
            {
              key: 'promoOffers',
              title: 'Exclusive Coupons & Flash Deals',
              desc: 'Get notified when Admin launches new Foodix promotional codes.',
            },
            {
              key: 'emailAlerts',
              title: 'Email Receipts & Summaries',
              desc: 'Send itemized order invoices to your registered email.',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-xs sm:text-sm text-[#202A24]">{item.title}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePref(item.key)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  preferences[item.key] ? 'bg-[#FF6B35]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    preferences[item.key] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Privacy & Account Security */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs text-xs">
          <h2 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4.5 h-4.5 text-[#163A2D]" />
            <span>Privacy & Account Security</span>
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-xs sm:text-sm text-[#202A24]">Save Search History</p>
              <p className="text-[11px] text-slate-500">
                Keep recent food & restaurant searches on this browser for quick access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => togglePref('saveSearchHistory')}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                preferences.saveSearchHistory ? 'bg-[#163A2D]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  preferences.saveSearchHistory ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-orange-100 text-slate-600 leading-relaxed">
            <strong className="text-[#202A24]">Privacy & Demo Storage Notice:</strong> Foodix stores your customer cart, wishlist, delivery addresses, and preferences locally in your browser scoped to your account session.
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                clearSearchHistory();
                toast.success('Search history cleared');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Search History</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/profile')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E7EFE8] hover:bg-emerald-100 text-[#163A2D] font-bold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Manage Password</span>
            </button>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold cursor-pointer ml-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={logoutOpen}
        variant="danger"
        title="Logout of Foodix?"
        message="You will be returned to the login screen."
        confirmLabel="Logout"
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
          navigate('/login');
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </CustomerLayout>
  );
}
