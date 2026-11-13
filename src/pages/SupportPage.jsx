import React, { useState, useMemo } from 'react';
import { Headphones } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import AdminSupportAlertsPanel from '../components/support/AdminSupportAlertsPanel';
import { useNotificationSupport } from '../context/NotificationSupportContext';

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount, tickets } = useNotificationSupport();

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'Open').length,
    [tickets]
  );

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full space-y-5">
          {/* Top Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#fef8f0] via-[#fffbf6] to-[#f2f7ef] border border-orange-100/80 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/15">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e22] tracking-tight">
                  Notifications &amp; Customer Support
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Respond to live customer support tickets and monitor real-time platform alerts.
                </p>
              </div>
            </div>

            {/* Summary Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold">
                Open Tickets: <span className="text-[#ff5722] font-black">{openCount}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold">
                Unread Alerts: <span className="text-[#064e3b] font-black">{unreadCount}</span>
              </div>
            </div>
          </div>

          <AdminSupportAlertsPanel />
        </main>
      </div>
    </div>
  );
}
