import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

export default function AddCustomerModal() {
  const { isAddCustomerOpen, setIsAddCustomerOpen, addCustomer } = useCustomers();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    address: '',
    company: '',
    role: '',
    favoriteCuisine: 'Pizza',
  });

  const [error, setError] = useState('');

  if (!isAddCustomerOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Valid Email is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    addCustomer({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city,
      address: formData.address.trim() || `${formData.city} Central`,
      company: formData.company.trim() || 'Independent Professional',
      role: formData.role.trim() || 'Foodix Member',
      favoriteCuisine: formData.favoriteCuisine,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        formData.fullName.trim()
      )}&background=ff5722&color=fff&bold=true`,
    });

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      city: 'Bengaluru',
      address: '',
      company: '',
      role: '',
      favoriteCuisine: 'Pizza',
    });
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Add New Customer</h3>
              <p className="text-xs text-emerald-700 font-medium">Onboard a customer to Foodix platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddCustomerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Varma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                placeholder="customer@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* City & Favorite Cuisine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">City *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Favorite Food Category</label>
              <select
                value={formData.favoriteCuisine}
                onChange={(e) => setFormData({ ...formData, favoriteCuisine: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                <option value="Pizza">Pizza</option>
                <option value="Burgers">Burgers</option>
                <option value="South Indian">South Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Biryani">Biryani</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>

          {/* Delivery Street Address */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Street Address</label>
            <input
              type="text"
              placeholder="Flat 102, Green Avenue, Landmark..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Company / Workplace</label>
              <input
                type="text"
                placeholder="e.g. Infosys, Wipro..."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Job Role / Title</label>
              <input
                type="text"
                placeholder="e.g. Lead Designer..."
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#064e3b] to-[#0a664e] hover:from-[#043d2e] hover:to-[#064e3b] text-white font-bold shadow-md shadow-emerald-950/20 transition-transform active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
