import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Camera, Eye, EyeOff, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import UserAvatar from '../../components/common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useCustomerPortal } from '../../context/CustomerPortalContext';
import { useCustomers } from '../../context/CustomerContext';

export default function CustomerProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { myOrders, linkedCustomer } = useCustomerPortal();
  const { updateCustomer } = useCustomers();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || linkedCustomer?.city || 'Bengaluru',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || linkedCustomer?.city || 'Bengaluru',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, linkedCustomer]);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);

  const totalSpent = myOrders
    .filter((o) => !['Cancelled', 'Rejected'].includes(o.status))
    .reduce((sum, o) => sum + (o.grandTotal || o.amount || 0), 0);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    await updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      city: profileForm.city.trim(),
      bio: profileForm.bio.trim(),
      avatar: profileForm.avatar,
      useCustomAvatar: !!profileForm.avatar,
    });

    if (linkedCustomer) {
      updateCustomer(linkedCustomer.id, {
        fullName: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        avatar: profileForm.avatar || linkedCustomer.avatar,
      });
    }
    toast.success('Your customer profile has been updated!');
  };

  const handlePasswordSubmit = async (e) => {
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
    <CustomerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Top Profile Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#163A2D] to-[#0f2920] p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <UserAvatar
              name={profileForm.name || 'Customer'}
              avatar={profileForm.avatar}
              useCustomAvatar={!!profileForm.avatar}
              gradient="orange"
              size="lg"
              showBadge={true}
            />
            <label
              htmlFor="cust-avatar-upload"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-md cursor-pointer"
              title="Upload profile photo"
            >
              <Camera className="w-4 h-4" />
              <input
                id="cust-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black">{profileForm.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Foodie Club Member
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-100/85 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {profileForm.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {profileForm.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profileForm.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-200">Orders</p>
              <p className="text-lg font-black">{myOrders.length}</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-200">Spent</p>
              <p className="text-lg font-black">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Edit Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 text-xs shadow-2xs"
          >
            <h2 className="font-black text-base text-[#202A24] flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4.5 h-4.5 text-[#FF6B35]" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Food Preferences / Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#163A2D] hover:bg-[#0f2920] text-white font-bold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 text-xs shadow-2xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-black text-base text-[#202A24] flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-[#163A2D]" />
                <span>Update Password</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold cursor-pointer"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}
