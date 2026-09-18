import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, BookOpen, Trash2, X, Plus } from 'lucide-react';
import { ArchitecturalRule } from './types';

interface MemoryRulesPanelProps {
  rules: ArchitecturalRule[];
  onAddRule?: (rule: ArchitecturalRule) => void;
}

export const MemoryRulesPanel: React.FC<MemoryRulesPanelProps> = ({ rules: initialRules }) => {
  const [rules, setRules] = useState<ArchitecturalRule[]>(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleTitle, setRuleTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('src/*');
  const [severity, setSeverity] = useState<'strict' | 'warning' | 'info'>('strict');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleTitle.trim() || !description.trim()) return;

    const newRule: ArchitecturalRule = {
      id: `r-${Date.now()}`,
      ruleTitle,
      description,
      scope,
      severity,
      createdAt: new Date().toISOString().split('T')[0],
      enforcedBy: 'Developer Rule',
    };

    setRules([newRule, ...rules]);
    setRuleTitle('');
    setDescription('');
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Learned Architectural Rules & Memory</h3>
          <p className="text-[11px] text-slate-400">
            Persistent cross-session intelligence and coding invariants injected into LLM stage prompts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition cursor-pointer"
        >
          <span>Add Architectural Rule</span>
          <PlusCircle size={14} className="text-[#84cc16]" />
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={16} className={rule.severity === 'strict' ? 'text-[#84cc16]' : 'text-amber-500'} />
                  <span className="text-xs font-bold text-slate-900 leading-tight">{rule.ruleTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                  title="Remove rule"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Scope: {rule.scope}</span>
              <span className="capitalize font-semibold text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded">
                {rule.severity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to add rule */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen size={16} className="text-[#94d320]" />
                <h3 className="text-sm font-bold">Add Codebase Memory Rule</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Rule Title</label>
                <input
                  type="text"
                  placeholder="e.g. Always Validate Stripe Signature"
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Detailed Invariant / Instruction</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this rule exists and how the agent should adhere to it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Scope Pattern</label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="strict">Strict (Blocking)</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-slate-900 bg-[#94d320] hover:bg-[#84cc16] rounded-lg shadow-xs"
                >
                  <Plus size={13} />
                  <span>Save Rule to Memory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
