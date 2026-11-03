import React from 'react';
import { Headphones, X, Mail, Phone, MessageSquare, ShieldAlert, BookOpen } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Need Assistance?</h3>
            <p className="text-xs text-slate-500">Foodix Support Center & Live Help</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm text-slate-600 mb-6">
          <p className="text-xs text-slate-500">
            Having trouble signing in or managing your Foodix account? Reach out to our 24/7 dedicated support team:
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5 text-xs">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-slate-700">support@foodix.delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-slate-700">+1 (800) 555-FOODIX (Toll Free)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-700">Live Chat available 24/7</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-xs">
            <span className="font-semibold block mb-0.5">Quick Demo Tip:</span>
            Click any role tab (Admin, Restaurant, Delivery Partner) to automatically test the respective dashboard experience!
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
        >
          Got it, Close
        </button>
      </div>
    </div>
  );
}
