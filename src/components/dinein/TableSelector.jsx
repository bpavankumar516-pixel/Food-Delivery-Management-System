import React from 'react';
import { Users, Check, LayoutGrid } from 'lucide-react';
import { useDineIn } from '../../context/DineInContext';

export default function TableSelector({ onOpenTableModal }) {
  const { tables, selectedTableId, setSelectedTableId } = useDineIn();

  const statusConfig = {
    available: {
      border: 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Available',
    },
    occupied: {
      border: 'border-orange-200 bg-orange-50/60 hover:bg-orange-100/70 text-orange-900',
      badge: 'bg-orange-100 text-orange-800',
      dot: 'bg-orange-500 animate-pulse',
      label: 'Occupied',
    },
    reserved: {
      border: 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800',
      dot: 'bg-indigo-500',
      label: 'Reserved',
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 select-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h3 className="font-black text-sm text-slate-900 tracking-tight">
            Select Dining Table
          </h3>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ({tables.filter((t) => t.status === 'available').length} of {tables.length} free)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Status Legend */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500 font-medium mr-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Dining
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Reserved
            </span>
          </div>

          {onOpenTableModal && (
            <button
              type="button"
              onClick={onOpenTableModal}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
              <span>Floor Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable / Grid of Tables */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-12 gap-2">
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const cfg = statusConfig[table.status] || statusConfig.available;

          return (
            <button
              key={table.id}
              type="button"
              onClick={() => setSelectedTableId(table.id)}
              className={`relative p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-[#ff5722] border-[#ff5722] bg-orange-50/90 shadow-md scale-[1.02]'
                  : cfg.border
              }`}
            >
              {/* Table Name & Status Dot */}
              <div className="flex items-center justify-between gap-1">
                <span className="font-black text-xs text-slate-900">{table.name}</span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                  title={cfg.label}
                />
              </div>

              {/* Capacity & Guest Info */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5 font-semibold">
                  <Users className="w-2.5 h-2.5" />
                  <span>{table.capacity}p</span>
                </span>

                <span className="text-[9px] uppercase font-bold tracking-wider truncate max-w-[50px]">
                  {table.status === 'occupied' ? 'Dining' : table.status === 'reserved' ? 'RSVD' : 'Open'}
                </span>
              </div>

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
