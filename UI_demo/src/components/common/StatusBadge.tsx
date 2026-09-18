import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'connected' | 'healthy' | 'warning' | 'error' | 'testing' | 'idle';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const configs = {
    connected: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      defaultLabel: 'Connected',
    },
    healthy: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      defaultLabel: 'Healthy',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      defaultLabel: 'Needs Review',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500',
      defaultLabel: 'Offline / Error',
    },
    testing: {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      dot: 'bg-blue-500 animate-pulse',
      defaultLabel: 'Verifying...',
    },
    idle: {
      bg: 'bg-slate-100 border-slate-200 text-slate-600',
      dot: 'bg-slate-400',
      defaultLabel: 'Not Tested',
    },
  };

  const current = configs[status] || configs.idle;
  const displayText = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {status === 'testing' ? (
        <Loader2 size={12} className="animate-spin text-blue-600" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      )}
      {displayText}
    </span>
  );
};
