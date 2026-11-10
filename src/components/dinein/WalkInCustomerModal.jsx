import React, { useState, useEffect } from 'react';
import { X, User, Phone, Users, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDineIn } from '../../context/DineInContext';

export default function WalkInCustomerModal({ isOpen, onClose }) {
  const { customer, setCustomer, selectedTable } = useDineIn();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    partySize: 2,
    notes: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || 'Walk-in Guest',
        mobile: customer.mobile || '',
        partySize: customer.partySize || selectedTable?.capacity || 2,
        notes: customer.notes || '',
      });
    }
  }, [customer, selectedTable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter customer/guest name.');
      return;
    }

    setCustomer({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      partySize: Number(formData.partySize) || 2,
      notes: formData.notes.trim(),
    });

    toast.success(`Walk-in customer details saved for ${selectedTable?.name || 'Table'}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5722] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Walk-In Guest Details</h3>
              <p className="text-xs text-slate-500">
                Assigning to <span className="font-bold text-[#ff5722]">{selectedTable?.name}</span> ({selectedTable?.capacity} seater)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer / Guest Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Rao or Walk-in Guest"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722]"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile Number (Optional)</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722]"
            />
          </div>

          {/* Party Size (Guests count) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Party Size (Number of Guests)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 4, 6, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, partySize: size })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    formData.partySize === size
                      ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {size} {size === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          </div>

          {/* Special Table Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Table / Dietary Instructions</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Birthday celebration, Jain food only, High chair required..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs shadow-md shadow-emerald-950/20 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
