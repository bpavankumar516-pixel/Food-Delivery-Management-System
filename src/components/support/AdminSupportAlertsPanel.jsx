import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  Search,
  CheckCheck,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import { useNotificationSupport } from '../../context/NotificationSupportContext';

/**
 * Shared Admin Support Tickets & Platform Alerts panel rendered inside
 * both SupportPage and the Admin Settings "Support & Alerts" tab.
 */
export default function AdminSupportAlertsPanel({ showSummaryStrip = false }) {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    tickets,
    addTicketReply,
    updateTicketStatus,
  } = useNotificationSupport();

  const [subTab, setSubTab] = useState('tickets'); // 'tickets' | 'notifications'
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');
  const [notifFilter, setNotifFilter] = useState('All'); // 'All' | 'Unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'Open').length,
    [tickets]
  );
  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'In Progress').length,
    [tickets]
  );
  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === 'Resolved').length,
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketStatusFilter !== 'All' && t.status !== ticketStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.id.toLowerCase().includes(q) ||
          t.customerName?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.orderId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, ticketStatusFilter, searchQuery]);

  const activeTicket = useMemo(
    () =>
      tickets.find((t) => t.id === selectedTicketId) ||
      filteredTickets[0] ||
      null,
    [tickets, selectedTicketId, filteredTickets]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifFilter === 'Unread' && n.isRead) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q) ||
          n.orderId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notifications, notifFilter, searchQuery]);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    addTicketReply(activeTicket.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="space-y-5">
      {showSummaryStrip && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-slate-900">Support &amp; Platform Alerts</h3>
            <p className="text-xs text-slate-500">
              Manage customer support tickets and monitor real-time platform notifications directly from Settings.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-slate-700">
              Open Tickets: <span className="text-[#ff5722] font-black">{openCount}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-700">
              Unread Alerts: <span className="text-[#064e3b] font-black">{unreadCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab Switcher + Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('tickets')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              subTab === 'tickets'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Tickets ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('notifications')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              subTab === 'notifications'
                ? 'bg-[#ff5722] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications &amp; Alerts ({unreadCount} unread)</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              subTab === 'tickets'
                ? 'Search tickets by ID, customer, order, or subject...'
                : 'Search alerts & notifications...'
            }
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {subTab === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 5 Cols: Ticket List */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-4 space-y-3 shadow-2xs">
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
              {[
                { id: 'All', label: `All (${tickets.length})` },
                { id: 'Open', label: `Open (${openCount})` },
                { id: 'In Progress', label: `In Progress (${inProgressCount})` },
                { id: 'Resolved', label: `Resolved (${resolvedCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTicketStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer ${
                    ticketStatusFilter === f.id
                      ? 'bg-[#ff5722] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredTickets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No support tickets match your filter.
              </p>
            ) : (
              <div className="space-y-2 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {filteredTickets.map((t) => {
                  const selected = activeTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        selected
                          ? 'bg-[#eaf5ef] border-emerald-400 ring-2 ring-emerald-500/15'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-xs text-[#064e3b]">{t.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 line-clamp-1">{t.subject}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{t.customerName}</span>
                        <span>{t.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 7 Cols: Active Ticket Conversation */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col min-h-[460px] justify-between space-y-4">
            {!activeTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
                <p>Select a support ticket to inspect and reply.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeTicket.customerAvatar}
                      alt={activeTicket.customerName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          activeTicket.customerName || 'C'
                        )}&background=064e3b&color=fff`;
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-slate-900">
                          {activeTicket.subject}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                          {activeTicket.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {activeTicket.customerName} ({activeTicket.customerEmail})
                        {activeTicket.orderId && ` • Order ${activeTicket.orderId}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTicket.status !== 'In Progress' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(activeTicket.id, 'In Progress')}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        In Progress
                      </button>
                    )}
                    {activeTicket.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(activeTicket.id, 'Resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
                  {(activeTicket.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl text-xs max-w-[85%] ${
                        msg.sender === 'admin'
                          ? 'ml-auto bg-[#064e3b] text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 mb-1 font-bold">
                        <span>{msg.senderName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleReplySubmit}
                  className="flex items-center gap-2 pt-3 border-t border-slate-100"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write an official admin reply to the customer..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Platform Notifications Tab */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {['All', 'Unread'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setNotifFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                    notifFilter === f ? 'bg-[#064e3b] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 stroke-1 text-slate-300" />
              <p>No notifications to display.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((n) => {
                const Icon =
                  n.type === 'coupon'
                    ? Tag
                    : n.type === 'order' || n.type === 'status' || n.type === 'cancellation'
                    ? ShoppingBag
                    : AlertCircle;

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.orderId) navigate('/orders');
                      else if (n.type === 'support') setSubTab('tickets');
                    }}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                      n.isRead
                        ? 'bg-white border-slate-200/80'
                        : 'bg-orange-50/50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-[#ff5722] text-white'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        <span className="text-[10.5px] text-slate-400 block mt-1">
                          {n.timeFormatted || 'Recent'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
