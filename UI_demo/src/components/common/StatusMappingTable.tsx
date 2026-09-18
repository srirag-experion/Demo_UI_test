import React from 'react';
import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
import { StatusMapping } from '../../types/config';

interface StatusMappingTableProps {
  remoteLabel: string;
  mappings: StatusMapping[];
  onChange: (newMappings: StatusMapping[]) => void;
}

const INTERNAL_STATUS_OPTIONS: Array<StatusMapping['internalStatus']> = [
  'Open',
  'In Progress',
  'In Review',
  'Completed',
  'Blocked',
];

export const StatusMappingTable: React.FC<StatusMappingTableProps> = ({
  remoteLabel,
  mappings,
  onChange,
}) => {
  const handleRemoteChange = (id: string, newRemote: string) => {
    onChange(
      mappings.map((m) => (m.id === id ? { ...m, remoteStatus: newRemote } : m))
    );
  };

  const handleInternalChange = (id: string, newInternal: StatusMapping['internalStatus']) => {
    onChange(
      mappings.map((m) => (m.id === id ? { ...m, internalStatus: newInternal } : m))
    );
  };

  const handleToggleAuto = (id: string) => {
    onChange(
      mappings.map((m) => (m.id === id ? { ...m, autoTransition: !m.autoTransition } : m))
    );
  };

  const handleDeleteRow = (id: string) => {
    onChange(mappings.filter((m) => m.id !== id));
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    onChange([
      ...mappings,
      {
        id: newId,
        remoteStatus: 'New Status',
        internalStatus: 'Open',
        autoTransition: true,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Status Synchronization</h4>
          <p className="text-[11px] text-slate-400">
            Map {remoteLabel} ticket workflow states to internal agent pipeline stages.
          </p>
        </div>

        {/* Better AI Outlined Button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition"
        >
          <span>Add New</span>
          <PlusCircle size={14} className="text-[#84cc16]" />
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold">
            <tr>
              <th className="py-2.5 px-3.5 w-5/12">{remoteLabel} State</th>
              <th className="py-2.5 px-2 w-1/12 text-center">Sync</th>
              <th className="py-2.5 px-3.5 w-4/12">Pipeline Stage</th>
              <th className="py-2.5 px-2 w-1/12 text-center">Auto</th>
              <th className="py-2.5 px-3 w-1/12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mappings.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2 px-3.5">
                  <input
                    type="text"
                    value={row.remoteStatus}
                    onChange={(e) => handleRemoteChange(row.id, e.target.value)}
                    className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-lime-500 rounded-md px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
                  />
                </td>
                <td className="py-2 px-2 text-center text-slate-300">
                  <ArrowRight size={13} className="inline-block" />
                </td>
                <td className="py-2 px-3.5">
                  <select
                    value={row.internalStatus}
                    onChange={(e) => handleInternalChange(row.id, e.target.value as any)}
                    className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-lime-500 rounded-md px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    {INTERNAL_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.autoTransition}
                    onChange={() => handleToggleAuto(row.id)}
                    className="rounded text-lime-600 focus:ring-lime-500 h-3.5 w-3.5 border-slate-300 cursor-pointer accent-[#94d320]"
                  />
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(row.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
