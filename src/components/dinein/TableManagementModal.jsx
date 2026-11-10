import React, { useState } from 'react';
import {
  X,
  Users,
  RotateCcw,
  Calendar,
  Eye,
} from 'lucide-react';
import { useDineIn } from '../../context/DineInContext';

export default function TableManagementModal({ isOpen, onClose }) {
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    releaseTable,
    reserveTable,
    dineInOrders,
    openOrderInspect,
  } = useDineIn();

  const [activeSection, setActiveSection] = useState('All');
  const [reservingTableId, setReservingTableId] = useState(null);
  const [reserveGuest, setReserveGuest] = useState('');
  const [reserveTime, setReserveTime] = useState('8:00 PM');

  if (!isOpen) return null;

  const sections = ['All', 'Main Dining Hall', 'Window View', 'Family Lounge', 'Private Dining Room', 'Outdoor Patio', 'Rooftop Terrace'];

  const filteredTables = tables.filter((t) => {
    if (activeSection === 'All') return true;
    return t.section === activeSection;
  });

  const handleSaveReservation = (tableId) => {
    if (!reserveGuest.trim()) return;
    reserveTable(tableId, reserveGuest.trim(), reserveTime);
    setReservingTableId(null);
    setReserveGuest('');
  };

  const handleInspectActiveOrder = (orderId) => {
    const order = dineInOrders.find((o) => o.id === orderId);
    if (order) {
      onClose();
      openOrderInspect(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#064e3b] via-[#094130] to-[#0c5942] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xl font-black">Restaurant Floor Plan & Table Management</h3>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Live floor overview • {tables.filter((t) => t.status === 'available').length} Available •{' '}
              {tables.filter((t) => t.status === 'occupied').length} Occupied •{' '}
              {tables.filter((t) => t.status === 'reserved').length} Reserved
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                activeSection === sec
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Tables Visual Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTableId === table.id;

            return (
              <div
                key={table.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'ring-2 ring-[#ff5722] border-[#ff5722] bg-orange-50/30 shadow-md'
                    : table.status === 'occupied'
                    ? 'border-orange-200 bg-orange-50/40'
                    : table.status === 'reserved'
                    ? 'border-indigo-200 bg-indigo-50/40'
                    : 'border-emerald-200 bg-emerald-50/40'
                }`}
              >
                {/* Table Top Bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-slate-900">{table.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          table.status === 'occupied'
                            ? 'bg-orange-100 text-orange-800'
                            : table.status === 'reserved'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {table.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{table.section}</p>
                  </div>

                  <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{table.capacity}p</span>
                  </span>
                </div>

                {/* Status Details / Occupied Info */}
                <div className="p-3 rounded-2xl bg-white border border-slate-100 space-y-1.5 text-xs">
                  {table.status === 'occupied' ? (
                    <>
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Guest:</span>
                        <span>{table.guestName}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Order ID:</span>
                        <span className="font-mono text-orange-600 font-bold">
                          {table.currentOrderId || 'In Progress'}
                        </span>
                      </div>
                      {table.currentOrderId && (
                        <button
                          type="button"
                          onClick={() => handleInspectActiveOrder(table.currentOrderId)}
                          className="w-full mt-1 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Active Order</span>
                        </button>
                      )}
                    </>
                  ) : table.status === 'reserved' ? (
                    <>
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Reserved for:</span>
                        <span>{table.guestName}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Time:</span>
                        <span className="font-bold text-indigo-600">
                          {table.reservationTime || 'Tonight'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-1 text-emerald-700 font-semibold text-[11px]">
                      Ready for Walk-in or Reservation
                    </div>
                  )}
                </div>

                {/* Reserving inline form */}
                {reservingTableId === table.id && (
                  <div className="p-3 rounded-2xl bg-white border border-indigo-200 space-y-2">
                    <input
                      type="text"
                      placeholder="Guest Name for Reservation"
                      value={reserveGuest}
                      onChange={(e) => setReserveGuest(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reserveTime}
                        onChange={(e) => setReserveTime(e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveReservation(table.id)}
                        className="flex-1 py-1 bg-[#064e3b] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setReservingTableId(null)}
                        className="py-1 px-2 text-slate-400 text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Bottom Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTableId(table.id);
                      onClose();
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#ff5722] text-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Select Table'}
                  </button>

                  {table.status === 'occupied' && (
                    <button
                      type="button"
                      onClick={() => releaseTable(table.id)}
                      className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Release Table manually"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {table.status === 'available' && reservingTableId !== table.id && (
                    <button
                      type="button"
                      onClick={() => setReservingTableId(table.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Reserve this table"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {table.status === 'reserved' && (
                    <button
                      type="button"
                      onClick={() => releaseTable(table.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer text-[11px] font-bold"
                      title="Release reservation"
                    >
                      Free
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
