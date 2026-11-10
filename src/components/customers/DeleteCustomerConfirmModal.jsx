import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

export default function DeleteCustomerConfirmModal() {
  const { deleteModalState, closeDeleteModal, confirmDelete } = useCustomers();

  if (!deleteModalState?.isOpen || !deleteModalState?.customer) {
    return null;
  }

  const { customer } = deleteModalState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Delete Customer</h3>
              <p className="text-xs text-rose-600 font-medium">This action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeleteModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete customer{' '}
            <span className="font-bold text-slate-900">"{customer.fullName}"</span>?
            This will permanently remove the customer account and their order history.
          </p>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={customer.avatar}
              alt={customer.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  customer.fullName
                )}&background=ff5722&color=fff&bold=true`;
              }}
            />
            <div className="flex-1 min-w-0 text-xs">
              <h4 className="font-bold text-slate-900 truncate">{customer.fullName}</h4>
              <p className="text-slate-500 truncate">{customer.email}</p>
              <p className="text-slate-400 mt-0.5">
                {customer.city} • {customer.ordersCount || 0} Orders
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
