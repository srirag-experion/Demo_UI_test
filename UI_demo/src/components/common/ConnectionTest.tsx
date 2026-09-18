import React from 'react';
import { PlusCircle, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

interface ConnectionTestProps {
  serviceKey: string;
  serviceName: string;
  helperText?: string;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({
  serviceKey,
  serviceName,
  helperText = 'Verify API handshake and credentials response latency.',
}) => {
  const { testConnection, connectionTests } = useConfig();
  const testState = connectionTests[serviceKey] || { status: 'idle' };

  const handleTest = () => {
    testConnection(serviceKey);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
      <div className="space-y-0.5">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <span>{serviceName} API Status</span>
          {testState.status === 'success' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Check size={11} className="text-emerald-600" /> Connected ({testState.latencyMs}ms)
            </span>
          )}
          {testState.status === 'failed' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <AlertCircle size={11} className="text-rose-600" /> Error
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          {testState.message || helperText}
        </p>
      </div>

      {/* Better AI Signature Outlined Pill Button */}
      <button
        type="button"
        onClick={handleTest}
        disabled={testState.status === 'testing'}
        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 active:scale-[0.98] transition shadow-2xs disabled:opacity-60 cursor-pointer"
      >
        {testState.status === 'testing' ? (
          <>
            <Loader2 size={13} className="animate-spin text-lime-600" />
            <span>Testing...</span>
          </>
        ) : (
          <>
            <span>Test Connection</span>
            <PlusCircle size={14} className="text-[#84cc16]" />
          </>
        )}
      </button>
    </div>
  );
};
