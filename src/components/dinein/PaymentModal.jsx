import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  Split,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDineIn } from '../../context/DineInContext';

export default function PaymentModal() {
  const { isPaymentModalOpen, paymentOrder, closePaymentModal, processPayment } = useDineIn();

  const [activeMethod, setActiveMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Card' | 'Split'

  // Cash State
  const [cashTendered, setCashTendered] = useState('');

  // UPI State
  const [upiVpa, setUpiVpa] = useState('customer@okhdfcbank');

  // Card State (Safe simulation - never store full PAN or CVV!)
  const [cardLast4, setCardLast4] = useState('8842');
  const [cardHolder, setCardHolder] = useState('Pavan Kumar');
  const [cardBrand, setCardBrand] = useState('Visa');

  // Split Payment State
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [splitCard, setSplitCard] = useState('');

  if (!isPaymentModalOpen || !paymentOrder) return null;

  const totalAmount = paymentOrder.grandTotal;

  // Cash change calculation
  const tenderedNum = Number(cashTendered) || totalAmount;
  const changeDue = Math.max(0, tenderedNum - totalAmount);

  // Split calculation
  const totalSplit = (Number(splitCash) || 0) + (Number(splitUpi) || 0) + (Number(splitCard) || 0);
  const remainingSplit = totalAmount - totalSplit;

  const handleProcess = (e) => {
    e.preventDefault();

    if (activeMethod === 'Cash') {
      if (tenderedNum < totalAmount) {
        toast.error(`Cash tendered (₹${tenderedNum}) is less than total bill (₹${totalAmount})!`);
        return;
      }
      processPayment(paymentOrder.id, {
        method: 'Cash',
        cashTendered: tenderedNum,
        changeDue,
      });
    } else if (activeMethod === 'UPI') {
      processPayment(paymentOrder.id, {
        method: 'UPI',
        vpa: upiVpa,
        txnRef: `UPI-${Date.now().toString().slice(-6)}`,
      });
    } else if (activeMethod === 'Card') {
      processPayment(paymentOrder.id, {
        method: 'Card',
        cardLast4: cardLast4.slice(-4),
        cardHolder,
        cardBrand,
      });
    } else if (activeMethod === 'Split') {
      if (totalSplit !== totalAmount) {
        toast.error(`Total split amount (₹${totalSplit}) must match order total (₹${totalAmount})!`);
        return;
      }
      processPayment(paymentOrder.id, {
        method: 'Split',
        cashAmount: Number(splitCash) || 0,
        upiAmount: Number(splitUpi) || 0,
        cardAmount: Number(splitCard) || 0,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#064e3b] via-[#094130] to-[#0c5942] text-white relative">
          <button
            type="button"
            onClick={closePaymentModal}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Table Settlement
              </span>
              <h3 className="text-xl font-black mt-1">Settle Bill & Payment</h3>
              <p className="text-xs text-emerald-200/80">
                {paymentOrder.id} • {paymentOrder.tableName} • {paymentOrder.customer?.name}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-emerald-300/80 font-medium block">Total Payable</span>
              <span className="text-2xl sm:text-3xl font-black text-white">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Nav */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50 p-1.5 gap-1 text-xs font-bold text-center">
          {[
            { id: 'Cash', icon: Banknote, label: 'Cash' },
            { id: 'UPI', icon: QrCode, label: 'UPI QR' },
            { id: 'Card', icon: CreditCard, label: 'Card' },
            { id: 'Split', icon: Split, label: 'Split' },
          ].map((m) => {
            const Icon = m.icon;
            const isCurrent = activeMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMethod(m.id)}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-[#064e3b] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleProcess} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* Method 1: Cash */}
          {activeMethod === 'Cash' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cash Received from Guest</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Enter amount (Bill: ₹${totalAmount})`}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-3 rounded-2xl border border-slate-200 font-black text-slate-900 text-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Exact / Common:</span>
                {[totalAmount, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt.toString())}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Change Calculator Highlight Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Change to Return
                  </span>
                  <p className="text-2xl font-black text-emerald-900 mt-0.5">₹{changeDue}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-200 text-emerald-800 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Method 2: UPI */}
          {activeMethod === 'UPI' && (
            <div className="space-y-4 text-center">
              {/* Dynamic QR Code Simulation */}
              <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center shadow-xs">
                <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2">
                  <QrCode className="w-24 h-24 text-white" />
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 mt-1">
                    UPI: ₹{totalAmount}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">Scan via GPay, PhonePe, Paytm</p>
                <p className="text-[11px] text-slate-400">
                  Transaction Auto-verifies on cashier confirmation
                </p>
              </div>

              <div className="text-left space-y-1">
                <label className="text-xs font-bold text-slate-700">Customer VPA / UPI ID</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Method 3: Card */}
          {activeMethod === 'Card' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
                    POS Terminal Card
                  </span>
                  <span className="text-xs font-black uppercase text-amber-400">{cardBrand}</span>
                </div>
                <p className="text-lg font-mono tracking-widest">
                  •••• •••• •••• {cardLast4}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{cardHolder}</span>
                  <span className="text-emerald-400 font-bold">₹{totalAmount}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Card Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Card Network</label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50 text-blue-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>PCI-DSS Safe: Sensitive CVV / full PAN numbers are never stored.</span>
              </div>
            </div>
          )}

          {/* Method 4: Split */}
          {activeMethod === 'Split' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Split the bill across Cash, UPI, and Card as requested by the guest.
              </p>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Cash Component (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">UPI Component (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Card Component (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Balance Tracker */}
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  remainingSplit === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span>Allocated: ₹{totalSplit} of ₹{totalAmount}</span>
                <span>
                  {remainingSplit === 0 ? '✓ Balanced' : `Remaining: ₹${remainingSplit}`}
                </span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-black text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Payment & Print Receipt (₹{totalAmount})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
