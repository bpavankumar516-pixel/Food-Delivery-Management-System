import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { useDineIn } from '../../context/DineInContext';

export default function OrderReceiptModal() {
  const { isReceiptOpen, receiptOrder, closeReceipt } = useDineIn();

  if (!isReceiptOpen || !receiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receiptOrder.createdAt
    ? new Date(receiptOrder.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-xs text-slate-800">Dine-In Tax Invoice & Bill</span>
          </div>
          <button
            type="button"
            onClick={closeReceipt}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div id="printable-bill" className="p-6 sm:p-7 overflow-y-auto custom-scrollbar font-mono text-xs space-y-4 text-slate-800 bg-white">
          {/* Header & Logo */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-xl font-black tracking-tight text-slate-900 font-sans">
              FOODIX RESTAURANT
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Indiranagar 100ft Road, Bengaluru, Karnataka 560038
            </p>
            <p className="text-[10px] text-slate-400">
              GSTIN: 29AAAAA0000A1Z5 • FSSAI: 11223344556677
            </p>
            <div className="pt-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                ORIGINAL DINE-IN BILL
              </span>
            </div>
          </div>

          {/* Meta Details */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill No:</span>
              <span className="font-bold text-slate-900">{receiptOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Table:</span>
              <span className="font-bold text-[#ff5722]">{receiptOrder.tableName} ({receiptOrder.section || 'Main Dining'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold">{receiptOrder.customer?.name} ({receiptOrder.customer?.partySize || 2}p)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Captain / Cashier:</span>
              <span>Pavan Kumar</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border-b border-dashed border-slate-300 pb-3">
            <div className="grid grid-cols-12 font-bold text-slate-500 text-[10px] uppercase pb-1 border-b border-slate-200">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amt</span>
            </div>

            <div className="divide-y divide-slate-100 pt-1.5 space-y-1">
              {receiptOrder.items?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] pt-1">
                  <div className="col-span-6">
                    <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                    {item.notes && (
                      <span className="text-[9px] text-slate-400 italic block">*{item.notes}</span>
                    )}
                  </div>
                  <span className="col-span-2 text-center">{item.qty}</span>
                  <span className="col-span-2 text-right">₹{item.price}</span>
                  <span className="col-span-2 text-right font-bold text-slate-900">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals & Taxes */}
          <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Item Subtotal:</span>
              <span>₹{receiptOrder.subtotal}</span>
            </div>

            {receiptOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({receiptOrder.discount?.code || 'Promo'}):</span>
                <span>-₹{receiptOrder.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>CGST (2.5%):</span>
              <span>₹{receiptOrder.cgst || (receiptOrder.gst ? (receiptOrder.gst / 2).toFixed(1) : 0)}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>SGST (2.5%):</span>
              <span>₹{receiptOrder.sgst || (receiptOrder.gst ? (receiptOrder.gst / 2).toFixed(1) : 0)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>GRAND TOTAL:</span>
              <span className="text-[#064e3b]">₹{receiptOrder.grandTotal}</span>
            </div>
          </div>

          {/* Payment Status & Change */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  receiptOrder.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {receiptOrder.paymentStatus || 'Pending'}
              </span>
            </div>

            {receiptOrder.payment?.method && (
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold">{receiptOrder.payment.method}</span>
              </div>
            )}

            {receiptOrder.payment?.changeDue > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Change Returned:</span>
                <span>₹{receiptOrder.payment.changeDue}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 font-sans">
            <p className="font-bold text-slate-700">Thank You for Dining with Us!</p>
            <p>Please visit again • Follow us @foodix_in</p>
            <p className="text-[9px] pt-1 text-slate-300">Generated by Foodix POS Offline Engine</p>
          </div>
        </div>

        {/* Modal Actions Footer (Hidden when printing) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeReceipt}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill (Thermal)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
