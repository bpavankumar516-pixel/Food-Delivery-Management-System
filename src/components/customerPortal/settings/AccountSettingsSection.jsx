import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  Shield,
  Leaf,
  LogOut,
  Trash2,
  Lock,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import { useCustomerPortal } from '../../../context/CustomerPortalContext';

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'];

export default function AccountSettingsSection() {
  const navigate = useNavigate();
  const { logout, changePassword } = useAuth();
  const { preferences, updatePreferences, clearSearchHistory } = useCustomerPortal();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const togglePref = (key) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not update password');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A24]">Account Settings</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Manage notifications, language, privacy, password security, and session sign-out
          </p>
        </div>
      </div>

      {/* Language & Dining Defaults */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
        <h3 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
          <Globe className="w-4.5 h-4.5 text-[#FF6B35]" />
          <span>Language & Dining Preferences</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <p className="font-bold text-xs sm:text-sm text-[#202A24]">App Language</p>
            <p className="text-[11px] text-slate-500">
              Select your preferred language for alerts and interface communications.
            </p>
          </div>
          <select
            value={preferences.language || 'English'}
            onChange={(e) => updatePreferences({ language: e.target.value })}
            className="px-3.5 py-2 rounded-xl bg-[#FFF8F0] border border-orange-200 text-xs font-bold text-[#202A24] cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {[
          {
            key: 'vegOnlyDefault',
            title: 'Pure Veg Default Filter',
            desc: 'Automatically prioritize vegetarian kitchens when browsing Restaurants.',
            icon: Leaf,
          },
          {
            key: 'contactlessDelivery',
            title: 'Contactless Doorstep Delivery',
            desc: 'Pre-fill contactless instructions at checkout by default.',
            icon: Shield,
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
        <h3 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell className="w-4.5 h-4.5 text-[#FF6B35]" />
          <span>Notification Preferences</span>
        </h3>

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
            desc: 'Send itemized order summaries to your registered email.',
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

      {/* Password Management */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 text-xs shadow-2xs"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-black text-base text-[#202A24] flex items-center gap-2">
            <Lock className="w-4.5 h-4.5 text-[#163A2D]" />
            <span>Password Management</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Toggle password visibility"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="Current Password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200"
          />
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="New Password (min 6)"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200"
          />
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="Confirm New Password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#163A2D] hover:bg-[#0f2920] text-white font-bold cursor-pointer"
        >
          Update Account Password
        </button>
      </form>

      {/* Privacy & Session Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs text-xs">
        <h3 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="w-4.5 h-4.5 text-[#163A2D]" />
          <span>Privacy & Session Controls</span>
        </h3>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-xs sm:text-sm text-[#202A24]">Save Search History</p>
            <p className="text-[11px] text-slate-500">
              Keep recent food and restaurant searches in this browser for faster suggestions.
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

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-xs sm:text-sm text-[#202A24]">Share Usage Analytics</p>
            <p className="text-[11px] text-slate-500">
              Allow Foodix to improve cuisine recommendations using anonymized browsing preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => togglePref('shareAnalytics')}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
              preferences.shareAnalytics ? 'bg-[#163A2D]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                preferences.shareAnalytics ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-orange-100 text-slate-600 leading-relaxed">
          <strong className="text-[#202A24]">Privacy & Demo Sync Notice:</strong> Foodix persists your cart, favorites, saved addresses, and preferences in browser Local Storage scoped to your account, synchronized with the Admin portal within this session.
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
            onClick={() => setLogoutOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold cursor-pointer ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
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
    </div>
  );
}
