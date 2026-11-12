import React, { useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, CheckCircle2, Home, Briefcase, X } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import ConfirmDialog from '../../components/customerPortal/ConfirmDialog';
import { useCustomerPortal } from '../../context/CustomerPortalContext';
import { useAuth } from '../../context/AuthContext';

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCustomerPortal();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: true,
  });

  const openAdd = () => {
    setEditingAddr(null);
    setForm({
      label: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '+91 98765 01234',
      street: '',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setEditingAddr(addr);
    setForm({ ...addr });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      toast.error('Street, city, and pincode are required.');
      return;
    }

    if (editingAddr) {
      updateAddress(editingAddr.id, form);
    } else {
      addAddress(form);
    }
    setModalOpen(false);
  };

  return (
    <CustomerLayout>
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-r from-[#FFF8F0] via-[#fffbf6] to-[#E7EFE8] border border-orange-100/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#163A2D] text-white flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#202A24]">
                Saved Addresses
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Manage your Home, Work, and doorstep delivery locations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold text-xs shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <MapPin className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-black text-base text-[#202A24]">No Saved Addresses</h3>
            <p className="text-xs text-slate-500">
              Add a delivery address so checkout is instant next time you order.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="px-5 py-2.5 rounded-full bg-[#163A2D] text-white font-bold text-xs cursor-pointer"
            >
              Add Delivery Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => {
              const Icon = addr.label === 'Work' ? Briefcase : Home;
              return (
                <div
                  key={addr.id}
                  className={`bg-white rounded-3xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 ${
                    addr.isDefault
                      ? 'border-[#163A2D] ring-2 ring-[#163A2D]/10'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFE8] text-[#163A2D] text-xs font-black">
                        <Icon className="w-3.5 h-3.5" />
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>

                    <div className="pt-1 text-xs space-y-1">
                      <p className="font-black text-sm text-[#202A24]">{addr.fullName}</p>
                      <p className="text-slate-600 font-medium">{addr.street}</p>
                      {addr.landmark && (
                        <p className="text-slate-400 text-[11px]">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-slate-600 font-semibold">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-slate-500 pt-1">Phone: {addr.phone}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700">
                        Active Delivery Location
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(addr)}
                        className="p-2 rounded-xl bg-[#FFF8F0] text-[#FF6B35] hover:bg-orange-100 cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(addr)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-[#202A24]">
                {editingAddr ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setForm({ ...form, label: lbl })}
                    className={`py-2 rounded-xl font-bold border cursor-pointer ${
                      form.label === lbl
                        ? 'bg-[#163A2D] text-white border-[#163A2D]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  House / Flat / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-[#FF6B35]"
                />
                <span className="font-semibold text-slate-700">Set as default delivery address</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white font-bold cursor-pointer"
                >
                  {editingAddr ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        variant="danger"
        title="Delete Saved Address?"
        message={`Remove "${deleteTarget?.label}" (${deleteTarget?.street}) from your address book?`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteAddress(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CustomerLayout>
  );
}
