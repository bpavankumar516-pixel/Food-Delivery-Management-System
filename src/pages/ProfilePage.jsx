import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Activity,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Laptop,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import UserAvatar from '../components/common/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useRestaurants } from '../context/RestaurantContext';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();
  const { restaurants, allMenuItems, activities } = useRestaurants();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tab navigation: 'personal' | 'security' | 'preferences' | 'activity'
  const initialTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'security', 'preferences', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- Profile Form State ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Pavan Kumar',
    email: user?.email || 'admin@foodix.com',
    phone: user?.phone || '+91 98765 43210',
    title: user?.title || 'Foodix Chief Administrator',
    department: user?.department || 'Platform Operations & Quality Assurance',
    location: user?.location || 'Bengaluru, Karnataka, India',
    bio:
      user?.bio ||
      'Senior Platform Administrator responsible for restaurant onboarding, culinary catalog quality, merchant settlements, and operational delivery standards across Foodix.',
    useCustomAvatar: !!user?.useCustomAvatar,
    avatarGradient: user?.avatarGradient || 'orange',
    avatar: user?.avatar || '',
  });

  // Sync profileForm if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Pavan Kumar',
        email: user.email || 'admin@foodix.com',
        phone: user.phone || '+91 98765 43210',
        title: user.title || 'Foodix Chief Administrator',
        department: user.department || 'Platform Operations & Quality Assurance',
        location: user.location || 'Bengaluru, Karnataka, India',
        bio:
          user.bio ||
          'Senior Platform Administrator responsible for restaurant onboarding, culinary catalog quality, merchant settlements, and operational delivery standards across Foodix.',
        useCustomAvatar: !!user.useCustomAvatar,
        avatarGradient: user.avatarGradient || 'orange',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Password Form State ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Security & Preferences Toggles ---
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled !== false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+5:30) India Standard Time');

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        title: profileForm.title.trim(),
        department: profileForm.department.trim(),
        location: profileForm.location.trim(),
        bio: profileForm.bio.trim(),
        useCustomAvatar: profileForm.useCustomAvatar,
        avatarGradient: profileForm.avatarGradient,
        avatar: profileForm.avatar,
      });

      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Image File Upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({
        ...prev,
        avatar: reader.result,
        useCustomAvatar: true,
      }));
      toast.info('Custom photo selected! Click Save Profile to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Your account password has been updated!');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
      toast.error(err.message || 'Password update failed.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Dynamic user initials
  const initials = profileForm.name
    ? profileForm.name
        .trim()
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PK';

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header with real-time letter avatar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Profile Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          {/* Top Hero Banner & Profile Card */}
          <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Emerald Foodix Decorative Cover */}
            <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-[#05291e] via-[#094130] to-[#0c5942] relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Platform Super Administrator</span>
                </span>
              </div>
            </div>

            {/* Profile Bar (Avatar + Meta Details) */}
            <div className="px-5 sm:px-8 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
                {/* Large Avatar Showcase */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                  <div className="relative group">
                    <UserAvatar
                      name={profileForm.name}
                      avatar={profileForm.avatar}
                      useCustomAvatar={profileForm.useCustomAvatar}
                      gradient={profileForm.avatarGradient}
                      size="2xl"
                      showBadge={true}
                      badgeStatus="online"
                      className="ring-4 ring-white shadow-xl"
                    />

                    {/* Quick Camera Upload Icon */}
                    <label
                      htmlFor="profile-photo-upload"
                      className="absolute bottom-1 right-1 p-2 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 cursor-pointer transition-transform hover:scale-110"
                      title="Upload custom profile photo"
                    >
                      <Camera className="w-4 h-4 text-slate-600" />
                      <input
                        id="profile-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Name & Title */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {profileForm.name}
                      </h1>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" title="Verified Account" />
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-500">
                      {profileForm.title} • <span className="text-emerald-700 font-semibold">{profileForm.department}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profileForm.email}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profileForm.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Active since Jan 2024</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Platform Metrics */}
                <div className="flex items-center justify-center sm:justify-end gap-3 pt-2 sm:pt-0">
                  <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Restaurants</p>
                    <p className="text-base sm:text-lg font-black text-slate-900">{restaurants.length}</p>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Menu Items</p>
                    <p className="text-base sm:text-lg font-black text-slate-900">{allMenuItems.length}</p>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-700">Status</p>
                    <p className="text-base sm:text-lg font-black text-emerald-800">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-5 sm:px-8 border-t border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-slate-50/50">
              {[
                { id: 'personal', label: 'Personal Information', icon: User },
                { id: 'security', label: 'Security & Password', icon: ShieldCheck },
                { id: 'preferences', label: 'Preferences & System', icon: Bell },
                { id: 'activity', label: 'Audit & Activity Log', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-3.5 px-4 font-bold text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#ff5722] text-[#ff5722]'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab 1: Personal Information Form */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">
                  Update your personal details, profile presentation, and letter avatar styling.
                </p>
              </div>

              {/* Avatar Presentation Customization */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Profile Avatar Style</h4>
                    <p className="text-xs text-slate-500">
                      Choose between default dynamic Name-based letter avatar or custom uploaded photo.
                    </p>
                  </div>

                  {/* Toggle: Letter Avatar vs Custom Photo */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 self-start sm:self-auto shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, useCustomAvatar: false }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        !profileForm.useCustomAvatar
                          ? 'bg-[#ff5722] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Name-based Letters ({initials})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, useCustomAvatar: true }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        profileForm.useCustomAvatar
                          ? 'bg-[#ff5722] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Custom Photo
                    </button>
                  </div>
                </div>

                {/* Letter Avatar Color Palettes (If Letter Avatar active) */}
                {!profileForm.useCustomAvatar && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/70">
                    <p className="text-xs font-bold text-slate-700">Choose Avatar Gradient Style:</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        { id: 'orange', label: 'Foodix Orange', bg: 'bg-[#ff5722]' },
                        { id: 'emerald', label: 'Emerald Green', bg: 'bg-[#059669]' },
                        { id: 'indigo', label: 'Royal Indigo', bg: 'bg-[#4338ca]' },
                        { id: 'rose', label: 'Rose Pink', bg: 'bg-[#e11d48]' },
                        { id: 'amber', label: 'Amber Gold', bg: 'bg-[#d97706]' },
                        { id: 'dark', label: 'Dark Pine', bg: 'bg-[#05291e]' },
                      ].map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setProfileForm((prev) => ({ ...prev, avatarGradient: pal.id }))}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            profileForm.avatarGradient === pal.id
                              ? 'border-slate-800 bg-white ring-2 ring-slate-800/10 shadow-xs'
                              : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${pal.bg}`} />
                          <span>{pal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Upload Box (If Custom Photo active) */}
                {profileForm.useCustomAvatar && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/70">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="custom-avatar-file-input"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="custom-avatar-file-input"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload New Image</span>
                      </label>
                      <span className="text-xs text-slate-400">PNG, JPG or WebP up to 2MB</span>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL..."
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, avatar: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Personal Details Inputs Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10"
                      placeholder="Pavan Kumar"
                    />
                  </div>

                  {/* Email Address (Verified) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-emerald-600 font-bold lowercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> verified
                      </span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100/70 text-sm font-mono text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:border-orange-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Designation / Job Title
                    </label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:border-orange-500"
                      placeholder="Foodix Chief Administrator"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:border-orange-500"
                      placeholder="Operations & Technology"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:border-orange-500"
                      placeholder="Bengaluru, Karnataka, India"
                    />
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Bio / Responsibilities
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-hidden focus:border-orange-500"
                    placeholder="Brief description about your responsibilities..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff7539] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Account Security & Password</h3>
                  <p className="text-xs text-slate-500">
                    Manage your administrator credentials and two-factor authentication.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-700 text-xs font-semibold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-orange-500"
                        placeholder="••••••••"
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

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-orange-500"
                        placeholder="Min. 6 characters"
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

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-orange-500"
                      placeholder="Repeat new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication & Active Sessions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2FA Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Two-Factor Authentication</h4>
                        <p className="text-xs text-slate-500">Adds extra security layer at sign-in</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        toast.info(
                          `2FA ${!twoFactorEnabled ? 'Enabled' : 'Disabled'} for this account.`
                        );
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={twoFactorEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    When active, signing in requires your password and a secure time-sensitive verification code sent to your phone or authenticator app.
                  </p>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-slate-500" />
                    <span>Active Sessions</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="font-bold text-slate-900">Chrome on Windows (Current)</p>
                          <p className="text-[11px] text-slate-500">Bengaluru, India • IP 106.51.x.x</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Active Now
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        <div>
                          <p className="font-bold text-slate-700">Foodix Admin App (iOS)</p>
                          <p className="text-[11px] text-slate-400">Bengaluru, India • 2 days ago</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Signed Out</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Preferences & System */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">System Preferences & Alerts</h3>
                <p className="text-xs text-slate-500">
                  Configure notification preferences, platform regional localization, and UI defaults.
                </p>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Notification Channels
                </h4>

                {[
                  {
                    title: 'New Restaurant Registration Alerts',
                    subtitle: 'Receive instant alerts when a new food vendor applies on Foodix',
                    state: emailAlerts,
                    setter: setEmailAlerts,
                  },
                  {
                    title: 'Large Value Orders & Surges',
                    subtitle: 'Notify on peak rush hour volume and high order counts',
                    state: orderAlerts,
                    setter: setOrderAlerts,
                  },
                  {
                    title: 'System & Security Health Checks',
                    subtitle: 'Real-time uptime notifications and audit trail backups',
                    state: systemAlerts,
                    setter: setSystemAlerts,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70"
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        item.setter(!item.state);
                        toast.info(`Updated: ${item.title}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        item.state ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          item.state ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Localization Settings */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Platform Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      toast.success(`Language set to ${e.target.value}`);
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="English">English (United States)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="(GMT+5:30) India Standard Time">
                      (GMT+5:30) India Standard Time (IST - Asia/Kolkata)
                    </option>
                    <option value="(GMT+0:00) UTC">
                      (GMT+0:00) Coordinated Universal Time (UTC)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Audit & Activity Log */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Admin Activity & Audit Trail</h3>
                  <p className="text-xs text-slate-500">
                    Real-time chronological events performed by {profileForm.name}.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  {activities.length} Recorded Events
                </span>
              </div>

              {/* Activities Feed */}
              <div className="space-y-3">
                {activities.slice(0, 10).map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">{act.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>
                      {act.subtitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
