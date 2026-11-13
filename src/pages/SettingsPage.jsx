import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  User,
  Building,
  Receipt,
  Truck,
  Sliders,
  Lock,
  Headphones,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  MapPin,
  Mail,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import AdminSupportAlertsPanel from '../components/support/AdminSupportAlertsPanel';
import { getInitials } from '../components/common/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNotificationSupport } from '../context/NotificationSupportContext';

const ADMIN_SETTINGS_TABS = new Set([
  'profile',
  'business',
  'tax',
  'delivery',
  'app',
  'security',
  'support',
]);

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateProfile, changePassword } = useAuth();
  const {
    settings,
    updateBusinessSettings,
    updateTaxSettings,
    updateDeliverySettings,
    updateAppSettings,
  } = useSettings();
  const { unreadCount = 0, tickets = [] } = useNotificationSupport?.() || {};
  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;
  const supportAlertCount = unreadCount + openTicketsCount;

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    initialTab && ADMIN_SETTINGS_TABS.has(initialTab) ? initialTab : 'profile'
  );

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab && ADMIN_SETTINGS_TABS.has(paramTab) && paramTab !== activeTab) {
      setActiveTab(paramTab);
    }
  }, [searchParams, activeTab]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // Admin Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Pavan Kumar',
    email: user?.email || 'admin@foodix.com',
    phone: user?.phone || '+91 98765 43210',
    title: user?.title || 'Foodix Chief Administrator',
    department: user?.department || 'Platform Operations & Quality Assurance',
    location: user?.location || 'Bengaluru, Karnataka, India',
    bio: user?.bio || 'Senior Platform Administrator for Foodix.',
  });

  // Business Form State
  const [businessForm, setBusinessForm] = useState({ ...settings.business });

  // Tax Form State
  const [taxForm, setTaxForm] = useState({ ...settings.tax });

  // Delivery Form State
  const [deliveryForm, setDeliveryForm] = useState({ ...settings.delivery });

  // App Settings State
  const [appForm, setAppForm] = useState({ ...settings.app });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Admin name is required.');
      return;
    }
    if (!profileForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      toast.error('Please enter a valid admin email.');
      return;
    }
    try {
      if (updateProfile) {
        await updateProfile(profileForm);
      }
      toast.success('Admin profile saved successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to save profile');
    }
  };

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    updateBusinessSettings(businessForm);
  };

  const handleSaveTax = (e) => {
    e.preventDefault();
    updateTaxSettings(taxForm);
  };

  const handleSaveDelivery = (e) => {
    e.preventDefault();
    updateDeliverySettings(deliveryForm);
  };

  const handleSaveApp = (e) => {
    e.preventDefault();
    updateAppSettings(appForm);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter both current and new passwords.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      if (changePassword) {
        await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      }
      toast.success('Account password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1400px] mx-auto w-full space-y-6">
          {/* Top Hero Banner with Guaranteed High-Contrast White Typography (Fixes Image 1) */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-emerald-900">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/15 blur-2xl" />

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 relative z-10 text-center sm:text-left">
              {/* White boxed avatar with initials matching Image 1 */}
              <div className="relative shrink-0">
                <div className="w-22 h-22 rounded-2xl bg-[#ff5722] text-white flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-white/20">
                  <span>{getInitials(profileForm.name || 'Admin')}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                  <div className="w-4 h-4 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Text details in CRISP WHITE AND BRIGHT EMERALD to fix Image 1 contrast issue */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                    {profileForm.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/40 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified Super Admin</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-emerald-300 drop-shadow-2xs">
                  {profileForm.title} • <span className="text-emerald-100">{profileForm.department}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-200/90 font-medium pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{profileForm.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{profileForm.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Active since Jan 2024</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'profile', label: 'Admin Profile', icon: User },
              { id: 'business', label: 'Business & Operating Hours', icon: Building },
              { id: 'tax', label: 'GST & Taxes', icon: Receipt },
              { id: 'delivery', label: 'Delivery Parameters', icon: Truck },
              { id: 'app', label: 'Application Preferences', icon: Sliders },
              { id: 'support', label: 'Support & Alerts', icon: Headphones, badge: supportAlertCount },
              { id: 'security', label: 'Security & Password', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                        isActive ? 'bg-[#ff5722] text-white' : 'bg-[#ff5722] text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  Personal & Role Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Administrative Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold cursor-pointer shadow-md shadow-emerald-950/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: BUSINESS & OPERATING HOURS */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSaveBusiness} className="space-y-4 max-w-2xl text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  Foodix Platform & Logistics Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Platform Brand Name</label>
                    <input
                      type="text"
                      value={businessForm.platformName}
                      onChange={(e) => setBusinessForm({ ...businessForm, platformName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Legal Registered Entity</label>
                    <input
                      type="text"
                      value={businessForm.legalEntity}
                      onChange={(e) => setBusinessForm({ ...businessForm, legalEntity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Address</label>
                  <input
                    type="text"
                    value={businessForm.businessAddress}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={businessForm.supportEmail}
                      onChange={(e) => setBusinessForm({ ...businessForm, supportEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={businessForm.supportPhone}
                      onChange={(e) => setBusinessForm({ ...businessForm, supportPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Opening Hours</label>
                    <input
                      type="text"
                      value={businessForm.openingHours}
                      onChange={(e) => setBusinessForm({ ...businessForm, openingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Closing Hours</label>
                    <input
                      type="text"
                      value={businessForm.closingHours}
                      onChange={(e) => setBusinessForm({ ...businessForm, closingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Business Details</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: GST & TAX SETTINGS */}
          {activeTab === 'tax' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSaveTax} className="space-y-4 max-w-2xl text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  GST & Tax Compliance
                </h3>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <input
                    type="checkbox"
                    id="isTaxEnabled"
                    checked={taxForm.isTaxEnabled}
                    onChange={(e) => setTaxForm({ ...taxForm, isTaxEnabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm cursor-pointer"
                  />
                  <label htmlFor="isTaxEnabled" className="font-bold text-emerald-900 cursor-pointer">
                    Enable Automatic GST Calculation on Customer Orders
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total GST Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={taxForm.gstPercentage}
                      onChange={(e) => setTaxForm({ ...taxForm, gstPercentage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CGST Share (%)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={taxForm.cgstPercentage}
                      onChange={(e) => setTaxForm({ ...taxForm, cgstPercentage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SGST Share (%)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={taxForm.sgstPercentage}
                      onChange={(e) => setTaxForm({ ...taxForm, sgstPercentage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official GSTIN Number</label>
                  <input
                    type="text"
                    value={taxForm.gstinNumber}
                    onChange={(e) => setTaxForm({ ...taxForm, gstinNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-600 uppercase"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Tax Configuration</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: DELIVERY PARAMETERS */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSaveDelivery} className="space-y-4 max-w-2xl text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  Fulfillment & Rider Dispatch Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={deliveryForm.baseDeliveryFee}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, baseDeliveryFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Free Delivery Order Threshold (₹)</label>
                    <input
                      type="number"
                      value={deliveryForm.freeDeliveryThreshold}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Estimated Delivery Time (Minutes)</label>
                    <input
                      type="number"
                      value={deliveryForm.defaultEstimatedMinutes}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, defaultEstimatedMinutes: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Delivery Radius (Kilometers)</label>
                    <input
                      type="number"
                      value={deliveryForm.maxDeliveryDistanceKm}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, maxDeliveryDistanceKm: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Delivery Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: APPLICATION PREFERENCES */}
          {activeTab === 'app' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSaveApp} className="space-y-4 max-w-2xl text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  App Behavior & Notifications
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <p className="font-bold text-slate-900">Audio Chime on Incoming Orders</p>
                      <p className="text-[11px] text-slate-400">Play pleasant sound alert when new order is placed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appForm.soundNotifications}
                      onChange={(e) => setAppForm({ ...appForm, soundNotifications: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <p className="font-bold text-slate-900">Email Alerts on Order Cancellations</p>
                      <p className="text-[11px] text-slate-400">Send instant admin alert when customer requests refund</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appForm.emailOrderAlerts}
                      onChange={(e) => setAppForm({ ...appForm, emailOrderAlerts: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <p className="font-bold text-slate-900">Auto-Assign Nearby Rider on Confirmation</p>
                      <p className="text-[11px] text-slate-400">Instantly dispatch nearest delivery partner</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appForm.autoAssignRider}
                      onChange={(e) => setAppForm({ ...appForm, autoAssignRider: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Application Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SUPPORT & ALERTS */}
          {activeTab === 'support' && <AdminSupportAlertsPanel showSummaryStrip />}

          {/* TAB 7: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md text-xs">
                <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  Change Account Password
                </h3>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 pr-10 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 pr-10 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Update Account Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
