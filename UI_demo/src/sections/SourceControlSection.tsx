import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { Toggle } from '../components/common/Toggle';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { SCMProviderType } from '../types/config';

export const SourceControlSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const provider = config.sourceControl.provider;

  const handleProviderChange = (newProvider: string) => {
    updateSection('sourceControl', { provider: newProvider as SCMProviderType });
  };

  const updateGitHub = (fields: Partial<typeof config.sourceControl.github>) => {
    updateSection('sourceControl', {
      github: { ...config.sourceControl.github, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Source Connections & Repos"
        description="Connect GitHub, GitLab, or Bitbucket for automated branch checkouts and PR creation"
      />

      {/* SCM Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Git Hosting Provider</h2>
            <p className="text-[11px] text-slate-400">Target repository where the agent makes code commits</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/40">
            {provider.toUpperCase()}
          </span>
        </div>

        <SelectField
          label="Primary Git Host"
          value={provider}
          onChange={handleProviderChange}
          options={[
            { value: 'github', label: 'GitHub (Cloud & Enterprise)', badge: 'Active' },
            { value: 'gitlab', label: 'GitLab (SaaS & Self-Managed)' },
            { value: 'bitbucket', label: 'Bitbucket Cloud' },
          ]}
        />

        {provider === 'github' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Organization / Owner" required>
                <input
                  type="text"
                  value={config.sourceControl.github.organization}
                  onChange={(e) => updateGitHub({ organization: e.target.value })}
                  placeholder="Astra-Global"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Repository Name" required>
                <input
                  type="text"
                  value={config.sourceControl.github.repository}
                  onChange={(e) => updateGitHub({ repository: e.target.value })}
                  placeholder="enterprise-core-service"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField label="Default Base Branch">
                <input
                  type="text"
                  value={config.sourceControl.github.defaultBranch}
                  onChange={(e) => updateGitHub({ defaultBranch: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Target PR Branch">
                <input
                  type="text"
                  value={config.sourceControl.github.targetBranch}
                  onChange={(e) => updateGitHub({ targetBranch: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <SecretField
                label="GitHub Access Token (PAT)"
                value={config.sourceControl.github.authToken}
                onChange={(v) => updateGitHub({ authToken: v })}
                placeholder="ghp_..."
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <Toggle
                label="Automated PR Quality Review Comments"
                description="Post inline diff explanations and stage outputs directly to GitHub pull requests."
                checked={config.sourceControl.github.enablePrComments}
                onChange={(v) => updateGitHub({ enablePrComments: v })}
              />

              <Toggle
                label="Trigger Agent on Branch Push"
                description="Run validation checks on every commit."
                checked={config.sourceControl.github.autoTriggerOnPush}
                onChange={(v) => updateGitHub({ autoTriggerOnPush: v })}
              />
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="pt-3 border-t border-slate-100">
          <ConnectionTest serviceKey={provider} serviceName={provider.toUpperCase()} />
        </div>
      </div>
    </div>
  );
};
