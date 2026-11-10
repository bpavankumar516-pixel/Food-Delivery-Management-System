import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

export default function EditCustomerModal() {
  const { selectedCustomer, isEditModalOpen, closeEditModal, updateCustomer } = useCustomers();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    address: '',
    status: 'Active',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        fullName: selectedCustomer.fullName || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        city: selectedCustomer.city || 'Bengaluru',
        address: selectedCustomer.address || '',
        status: selectedCustomer.status || 'Active',
      });
      setError('');
    }
  }, [selectedCustomer]);

  if (!isEditModalOpen || !selectedCustomer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    updateCustomer(selectedCustomer.id, {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city,
      address: formData.address.trim(),
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff5722] flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Edit Customer</h3>
              <p className="text-xs text-slate-500">
                Update account details for <span className="font-bold text-slate-800">{selectedCustomer.fullName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* City & Account Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">City</label>
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
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-emerald-600"
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6b3d] hover:from-[#f44e19] hover:to-[#ff5722] text-white font-bold shadow-md shadow-orange-500/25 transition-transform active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
