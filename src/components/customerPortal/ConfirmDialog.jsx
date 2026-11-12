import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const btnColors =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'warning'
      ? 'bg-[#FF6B35] hover:bg-[#e85a25] text-white'
      : 'bg-[#163A2D] hover:bg-[#0f2920] text-white';

  const iconColors =
    variant === 'danger'
      ? 'bg-rose-100 text-rose-600'
      : variant === 'warning'
      ? 'bg-orange-100 text-[#FF6B35]'
      : 'bg-[#E7EFE8] text-[#163A2D]';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`w-11 h-11 rounded-2xl ${iconColors} flex items-center justify-center shrink-0`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#202A24]">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer ${btnColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
