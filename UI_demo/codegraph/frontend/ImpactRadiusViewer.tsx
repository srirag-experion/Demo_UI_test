import React, { useState } from 'react';
import { AlertTriangle, FlaskConical, Zap } from 'lucide-react';
import { GraphNode } from './types';

interface ImpactRadiusViewerProps {
  nodes: GraphNode[];
}

export const ImpactRadiusViewer: React.FC<ImpactRadiusViewerProps> = ({ nodes }) => {
  const [selectedFile, setSelectedFile] = useState<string>(nodes[0]?.file || 'src/pipeline/runner.py');

  const selectedNode = nodes.find((n) => n.file === selectedFile) || nodes[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Impact Blast-Radius & Test Matrix</h3>
          <p className="text-[11px] text-slate-400">
            Select any file to calculate upstream callers, downstream dependents, and required test suites
          </p>
        </div>
      </div>

      {/* Target File Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <label className="text-xs font-bold text-slate-800">Target File for Modification:</label>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-medium rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500"
        >
          {nodes.map((n) => (
            <option key={n.id} value={n.file}>
              {n.file} — [{n.label}]
            </option>
          ))}
        </select>
      </div>

      {/* Blast Radius Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* High Risk Direct Callers */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-rose-100 text-rose-700">
            <AlertTriangle size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Direct Callers (High Impact)</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            These components directly invoke symbols in {selectedNode?.label || 'the file'}:
          </p>

          <div className="space-y-2">
            <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs font-mono">
              <div className="font-bold text-rose-950">POST /api/v1/trigger</div>
              <div className="text-[10px] text-rose-700 mt-0.5">src/api/routes.py (Invokes runner directly)</div>
            </div>
            <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs font-mono">
              <div className="font-bold text-rose-950">DevRequestHandler</div>
              <div className="text-[10px] text-rose-700 mt-0.5">src/handlers/dev.py (Consumes return state)</div>
            </div>
          </div>
        </div>

        {/* Medium Risk Indirect Consumers */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-amber-100 text-amber-700">
            <Zap size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Downstream Dependents</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Indirectly affected via shared state or database records:
          </p>

          <div className="space-y-2">
            <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs font-mono">
              <div className="font-bold text-amber-950">GooseAgentContainer</div>
              <div className="text-[10px] text-amber-700 mt-0.5">src/agent/goose.py (Stage 4 execution sandbox)</div>
            </div>
            <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs font-mono">
              <div className="font-bold text-amber-950">SlackNotifier</div>
              <div className="text-[10px] text-amber-700 mt-0.5">src/notifications/slack.py (Dispatches HIL alert)</div>
            </div>
          </div>
        </div>

        {/* Mandatory Unit & E2E Tests */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-emerald-100 text-emerald-700">
            <FlaskConical size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Mandatory Test Verification</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Stage 5 Validation must pass these test suites before PR creation:
          </p>

          <div className="space-y-2">
            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-mono">
              <div className="font-bold text-emerald-950">tests/unit/test_runner.py</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">pytest tests/unit/test_runner.py -v</div>
            </div>
            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-mono">
              <div className="font-bold text-emerald-950">tests/e2e/test_pipeline.py</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">pytest tests/e2e/test_pipeline.py</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
