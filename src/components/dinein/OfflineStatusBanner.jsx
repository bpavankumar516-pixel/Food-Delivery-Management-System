import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useDineIn } from '../../context/DineInContext';

export default function OfflineStatusBanner() {
  const { isOnline, hasPendingOfflineSync } = useDineIn();

  // Hide banner completely when online to remove unwanted text
  if (isOnline && !hasPendingOfflineSync) return null;

  return (
    <div className="px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-900 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold">Offline Mode Active</span>
          <span className="mx-1.5 opacity-40">•</span>
          <span className="text-[11px] opacity-80">
            Dine-in orders and cart are being saved safely on this device.
          </span>
        </div>
      </div>

      {hasPendingOfflineSync && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-[11px]">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Orders queued for sync</span>
        </div>
      )}
    </div>
  );
}
