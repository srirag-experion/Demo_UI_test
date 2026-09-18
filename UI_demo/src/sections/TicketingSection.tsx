import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { Toggle } from '../components/common/Toggle';
import { StatusMappingTable } from '../components/common/StatusMappingTable';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { TicketingProviderType } from '../types/config';

export const TicketingSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const provider = config.ticketing.provider;

  const handleProviderChange = (newProvider: string) => {
    updateSection('ticketing', { provider: newProvider as TicketingProviderType });
  };

  const updateJira = (fields: Partial<typeof config.ticketing.jira>) => {
    updateSection('ticketing', {
      jira: { ...config.ticketing.jira, ...fields },
    });
  };

  const updateLinear = (fields: Partial<typeof config.ticketing.linear>) => {
    updateSection('ticketing', {
      linear: { ...config.ticketing.linear, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Ticket Workflows & Jira"
        description="Configure automated ticket status updates, webhooks, and issue synchronization"
      />

      {/* Ticket Provider Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Issue Tracker Connection</h2>
            <p className="text-[11px] text-slate-400">Webhook trigger source for autonomous agent runs</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/40">
            {provider.toUpperCase()}
          </span>
        </div>

        <SelectField
          label="Primary Ticket Tracker"
          value={provider}
          onChange={handleProviderChange}
          options={[
            { value: 'jira', label: 'Jira Software (Cloud / Server)', badge: 'Active' },
            { value: 'linear', label: 'Linear' },
          ]}
        />

        {provider === 'jira' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Jira Instance Base URL" required>
                <input
                  type="text"
                  value={config.ticketing.jira.url}
                  onChange={(e) => updateJira({ url: e.target.value })}
                  placeholder="https://company.atlassian.net"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Account Email Address" required>
                <input
                  type="email"
                  value={config.ticketing.jira.email}
                  onChange={(e) => updateJira({ email: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SecretField
                label="Atlassian API Token"
                value={config.ticketing.jira.apiToken}
                onChange={(v) => updateJira({ apiToken: v })}
                required
              />

              <FormField label="Target Project Key" required>
                <input
                  type="text"
                  value={config.ticketing.jira.projectKey}
                  onChange={(e) => updateJira({ projectKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Default Issue Type">
                <input
                  type="text"
                  value={config.ticketing.jira.issueType}
                  onChange={(e) => updateJira({ issueType: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Toggle
                label="Two-Way Status Synchronization"
                description="Automatically transition Jira tickets when agent pipeline starts and finishes."
                checked={config.ticketing.jira.enableTwoWaySync}
                onChange={(v) => updateJira({ enableTwoWaySync: v })}
              />
            </div>

            {/* Status Matrix */}
            <div className="pt-2 border-t border-slate-100">
              <StatusMappingTable
                remoteLabel="Jira"
                mappings={config.ticketing.jira.statusMappings}
                onChange={(mappings) => updateJira({ statusMappings: mappings })}
              />
            </div>
          </div>
        )}

        {provider === 'linear' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SecretField
                label="Linear API Token"
                value={config.ticketing.linear.apiKey}
                onChange={(v) => updateLinear({ apiKey: v })}
                required
              />

              <FormField label="Workspace Slug">
                <input
                  type="text"
                  value={config.ticketing.linear.workspace}
                  onChange={(e) => updateLinear({ workspace: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
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
