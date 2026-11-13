import React from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  Phone,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';
import ActionMoreMenu from '../common/ActionMoreMenu';

export default function CustomerTableView({ customers }) {
  const {
    openCustomerDetails,
    openEditModal,
    openDeleteModal,
    toggleBlockCustomer,
  } = useCustomers();

  const formatJoinedDate = (dateStr, fallbackIndex) => {
    if (!dateStr) {
      const dates = ['Oct 15, 2026', 'Oct 12, 2026', 'Oct 10, 2026', 'Oct 08, 2026', 'Oct 05, 2026', 'Oct 03, 2026', 'Sep 30, 2026'];
      return dates[fallbackIndex % dates.length];
    }
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Oct 15, 2026';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#fcfbf9] text-slate-700 font-bold border-b border-slate-100">
            <tr>
              <th className="py-4 px-6 text-slate-800 font-bold">Customer</th>
              <th className="py-4 px-4 text-slate-800 font-bold">Email</th>
              <th className="py-4 px-4 text-slate-800 font-bold">Phone</th>
              <th className="py-4 px-4 text-center text-slate-800 font-bold">Total Orders</th>
              <th className="py-4 px-4 text-left text-slate-800 font-bold">Total Spent</th>
              <th className="py-4 px-4 text-slate-800 font-bold">Status</th>
              <th className="py-4 px-4 text-slate-800 font-bold">Joined On</th>
              <th className="py-4 px-6 text-center text-slate-800 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c, idx) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Customer Identity: Round Avatar + Name */}
                <td className="py-3.5 px-6">
                  <div
                    onClick={() => openCustomerDetails(c)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={c.avatar}
                      alt={c.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.fullName
                        )}&background=ff5722&color=fff&bold=true`;
                      }}
                    />
                    <span className="font-bold text-slate-900 group-hover:text-[#ff5722] transition-colors">
                      {c.fullName}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3.5 px-4 text-slate-600 font-normal">
                  {c.email}
                </td>

                {/* Phone */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                </td>

                {/* Total Orders */}
                <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                  {c.ordersCount || 0}
                </td>

                {/* Total Spent */}
                <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                  ₹{(c.totalSpent || 0).toLocaleString()}
                </td>

                {/* Status: Active (Green) or Blocked (Rose) with Clickable Toggle */}
                <td className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleBlockCustomer(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      c.status === 'Blocked'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:scale-105'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:scale-105'
                    }`}
                    title={
                      c.status === 'Blocked'
                        ? 'Customer is Blocked. Click to Unblock'
                        : 'Customer is Active. Click to Block'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.status === 'Blocked' ? 'bg-rose-600' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{c.status === 'Blocked' ? 'Blocked' : 'Active'}</span>
                  </button>
                </td>

                {/* Joined On */}
                <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                  {formatJoinedDate(c.registeredDate, idx)}
                </td>

                {/* Actions: Block/Unblock + More Menu (View, Edit, Delete) */}
                <td className="py-3.5 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Block / Unblock Quick Action button */}
                    <button
                      type="button"
                      onClick={() => toggleBlockCustomer(c.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                        c.status === 'Blocked'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                      title={c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
                    >
                      {c.status === 'Blocked' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </button>

                    {/* More Actions Menu */}
                    <ActionMoreMenu
                      title="Customer Actions"
                      items={[
                        {
                          id: 'view',
                          label: 'View Details',
                          icon: Eye,
                          onClick: () => openCustomerDetails(c),
                        },
                        {
                          id: 'edit',
                          label: 'Edit Customer',
                          icon: Edit3,
                          onClick: () => openEditModal(c),
                        },
                        {
                          id: 'delete',
                          label: 'Delete Customer',
                          icon: Trash2,
                          tone: 'danger',
                          dividerBefore: true,
                          onClick: () => openDeleteModal(c),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
