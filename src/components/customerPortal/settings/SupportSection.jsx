import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { useCustomerPortal } from '../../../context/CustomerPortalContext';

const FAQS = [
  {
    q: 'How can I track my live food delivery order?',
    a: 'Open Live Tracking from the sidebar or click Track on any active order in My Orders. Status updates synced from Foodix Admin and kitchens appear immediately.',
  },
  {
    q: 'When am I eligible to cancel an order?',
    a: 'You can cancel an order directly from My Orders while its status is Pending or Confirmed. Once the kitchen starts Preparing your dishes, cancellation is locked.',
  },
  {
    q: 'Why is a coupon code not applying to my cart?',
    a: 'Each promo coupon requires a minimum order subtotal, active campaign status, and valid expiry date. Check Offers & Coupons to verify eligibility.',
  },
  {
    q: 'How do refunds work on cancelled orders?',
    a: 'If you paid via simulated UPI or Card, the order payment status is automatically marked Refunded upon cancellation.',
  },
];

export default function SupportSection() {
  const { user } = useAuth();
  const { myOrders, myTickets, createSupportTicket, addCustomerReply } = useCustomerPortal();

  const [openFaq, setOpenFaq] = useState(0);
  const [replyInputs, setReplyInputs] = useState({});

  const [form, setForm] = useState({
    category: 'Order Issue',
    orderId: '',
    priority: 'Medium',
    subject: '',
    message: '',
  });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please enter a subject and issue description.');
      return;
    }

    createSupportTicket({
      customerName: user?.name,
      customerEmail: user?.email,
      customerAvatar: user?.avatar,
      orderId: form.orderId,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      message: form.message,
    });

    setForm({
      category: 'Order Issue',
      orderId: '',
      priority: 'Medium',
      subject: '',
      message: '',
    });
  };

  const handleSendReply = (ticketId) => {
    const text = (replyInputs[ticketId] || '').trim();
    if (!text) return;
    addCustomerReply(ticketId, text, user?.name);
    setReplyInputs((prev) => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-[#163A2D] to-[#0f2920] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">Help & 24/7 Support</h2>
            <p className="text-xs sm:text-sm text-emerald-100/85">
              Browse quick answers or submit support tickets linked directly to your orders
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
            <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
            support@foodix.app
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            1800-FOODIX
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 5 Cols: FAQs + Submit Form */}
        <div className="xl:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
            <h3 className="font-black text-base text-[#202A24]">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {FAQS.map((item, idx) => {
                const expanded = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-slate-200/80 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(expanded ? -1 : idx)}
                      className="w-full px-4 py-3 bg-[#faf8f4] hover:bg-[#FFF8F0] flex items-center justify-between gap-2 text-left text-xs font-bold text-[#202A24] cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          expanded ? 'rotate-180 text-[#FF6B35]' : ''
                        }`}
                      />
                    </button>
                    {expanded && (
                      <div className="px-4 py-3 text-xs text-slate-600 bg-white leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleSubmitTicket}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3.5 text-xs shadow-2xs"
          >
            <h3 className="font-black text-base text-[#202A24]">Contact Support / New Ticket</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="Order Issue">Order Issue</option>
                  <option value="Delivery Delay">Delivery Delay</option>
                  <option value="Payment & Refund">Payment & Refund</option>
                  <option value="Coupon / Offer">Coupon / Offer</option>
                  <option value="Account Help">Account Help</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Related Order (Optional)</label>
              <select
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
              >
                <option value="">General Inquiry (No specific order)</option>
                {myOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} — {o.restaurant} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Describe Your Issue *</label>
              <textarea
                rows={3}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Share details so we can help quickly..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Create Support Ticket</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Support Ticket History */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-[#202A24] flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-[#163A2D]" />
              <span>Previous Support Requests ({myTickets.length})</span>
            </h3>
          </div>

          {myTickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No support tickets created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {myTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-[#faf8f4] border border-slate-200/80 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-black text-[#163A2D]">{t.id}</span>
                      {t.orderId && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold">
                          {t.orderId}
                        </span>
                      )}
                      <h4 className="font-black text-sm text-[#202A24] mt-0.5">{t.subject}</h4>
                      <p className="text-[10.5px] text-slate-400">
                        {t.category} • {t.createdAt}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {t.status === 'Resolved' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {t.status}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(t.messages || []).map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl ${
                          m.sender === 'admin'
                            ? 'bg-[#E7EFE8] text-[#163A2D] ml-4'
                            : 'bg-white border border-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                          <span>{m.senderName}</span>
                          <span className="text-slate-400">{m.timestamp}</span>
                        </div>
                        <p className="text-xs">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendReply(t.id);
                    }}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={replyInputs[t.id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      placeholder="Write a follow-up message..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#163A2D] text-white font-bold cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
