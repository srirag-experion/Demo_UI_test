import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useConfig();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-300 bg-white text-slate-800';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-500';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-emerald-500/10';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-500/10';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'info') {
          borderClass = 'border-blue-200 bg-blue-50/95 text-blue-950 shadow-blue-500/10';
          Icon = AlertTriangle;
          iconColor = 'text-blue-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-sm animate-fade-in ${borderClass}`}
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 space-y-0.5">
              <div className="text-xs font-bold leading-tight">{toast.title}</div>
              {toast.description && (
                <div className="text-[11px] opacity-80 leading-normal">{toast.description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 opacity-60 hover:opacity-100 transition rounded"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
