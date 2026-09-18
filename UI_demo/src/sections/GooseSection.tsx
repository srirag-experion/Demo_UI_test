import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { Toggle } from '../components/common/Toggle';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { GooseAutonomyType } from '../types/config';

export const GooseSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const goose = config.goose;

  const updateGoose = (fields: Partial<typeof config.goose>) => {
    updateSection('goose', fields);
  };

  const updateToolPermission = (toolKey: keyof typeof config.goose.allowedTools, enabled: boolean) => {
    updateSection('goose', {
      allowedTools: {
        ...config.goose.allowedTools,
        [toolKey]: enabled,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Autonomous Agent Execution"
        description="Manage Goose agent autonomy levels, tool executable permissions, and container sandboxes"
      />

      {/* Autonomy Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Agent Brain & Autonomy</h2>
            <p className="text-[11px] text-slate-400">Controls how independently the agent executes terminal commands</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/40">
            {goose.autonomyLevel.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Autonomy Mode"
            value={goose.autonomyLevel}
            onChange={(v) => updateGoose({ autonomyLevel: v as GooseAutonomyType })}
            options={[
              { value: 'suggest', label: 'Passive / Plan Only' },
              { value: 'semi-autonomous', label: 'Semi-Autonomous (Recommended)', badge: 'Active' },
              { value: 'full-autonomous', label: 'Full Autonomous Execution' },
            ]}
          />

          <SelectField
            label="Agent LLM Model"
            value={goose.model}
            onChange={(v) => updateGoose({ model: v })}
            options={[
              { value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet (Anthropic)', badge: 'Best' },
              { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
              { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <SecretField
            label="Agent API Key Override (Optional)"
            value={goose.apiKey}
            onChange={(v) => updateGoose({ apiKey: v })}
            placeholder="Inherits system LLM key"
          />

          <FormField label="Max Trajectory Iterations">
            <input
              type="number"
              min="5"
              max="100"
              value={goose.maxIterations}
              onChange={(e) => updateGoose({ maxIterations: parseInt(e.target.value) || 20 })}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </FormField>
        </div>
      </div>

      {/* Tool Permissions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Allowed Tool Executables</h2>
            <p className="text-[11px] text-slate-400">Enable or restrict capabilities inside the Docker sandbox</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <Toggle
              label="Bash / Shell Tool"
              checked={goose.allowedTools.bash}
              onChange={(v) => updateToolPermission('bash', v)}
            />
          </div>

          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <Toggle
              label="Git Versioning Tool"
              checked={goose.allowedTools.git}
              onChange={(v) => updateToolPermission('git', v)}
            />
          </div>

          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <Toggle
              label="File System Editing"
              checked={goose.allowedTools.fileEdit}
              onChange={(v) => updateToolPermission('fileEdit', v)}
            />
          </div>

          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <Toggle
              label="Web Search Tool"
              checked={goose.allowedTools.webSearch}
              onChange={(v) => updateToolPermission('webSearch', v)}
            />
          </div>

          <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
            <Toggle
              label="MCP Protocol Servers"
              checked={goose.allowedTools.mcpServers}
              onChange={(v) => updateToolPermission('mcpServers', v)}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-4">
          <FormField label="Sandbox Directory Path">
            <input
              type="text"
              value={goose.sandboxDirectory}
              onChange={(e) => updateGoose({ sandboxDirectory: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </FormField>

          <Toggle
            label="Require Human-in-the-Loop (HIL) for Dangerous Commands"
            description="Pauses execution until approved via POST /hil/{id}/approve."
            checked={goose.requireUserApprovalForDangerousCommands}
            onChange={(v) => updateGoose({ requireUserApprovalForDangerousCommands: v })}
          />
        </div>

        <div className="pt-3 border-t border-slate-100">
          <ConnectionTest serviceKey="goose" serviceName="GOOSE DOCKER RUNTIME" />
        </div>
      </div>
    </div>
  );
};
