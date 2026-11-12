import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Trash2,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

export default function CustomerCard({ customer }) {
  const {
    openCustomerDetails,
    openDeleteModal,
  } = useCustomers();

  const isBlocked = customer.status === 'Blocked';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Avatar Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar & Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={customer.avatar}
                alt={customer.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    customer.fullName
                  )}&background=ff5722&color=fff&bold=true`;
                }}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                  isBlocked ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                title={isBlocked ? 'Blocked Customer' : 'Active Customer'}
              />
            </div>

            <div className="min-w-0">
              <h4
                onClick={() => openCustomerDetails(customer)}
                className="font-black text-sm text-slate-900 truncate hover:text-[#ff5722] cursor-pointer transition-colors"
              >
                {customer.fullName}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                @{customer.username} • {customer.role || 'Member'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{customer.city}, {customer.state}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${
              isBlocked
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBlocked ? 'bg-rose-600' : 'bg-emerald-500'
              }`}
            />
            <span>{isBlocked ? 'Blocked' : 'Active'}</span>
          </span>
        </div>

        {/* Contact Info Pills */}
        <div className="mt-3.5 grid grid-cols-1 gap-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{customer.phone}</span>
          </div>
        </div>

        {/* Orders & Spending Metrics Highlight */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100/90 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Orders</p>
            <p className="text-sm font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{customer.ordersCount || 0}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Spent</p>
            <p className="text-sm font-black text-emerald-700 mt-0.5">
              ₹{(customer.totalSpent || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => openCustomerDetails(customer)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#053b2c] hover:bg-[#074d39] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          title="View Customer Details"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>

        <button
          type="button"
          onClick={() => openDeleteModal(customer)}
          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
          title="Delete Customer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
