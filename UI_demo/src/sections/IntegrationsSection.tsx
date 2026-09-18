import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { Toggle } from '../components/common/Toggle';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';

export const IntegrationsSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const slack = config.integrations.slack;
  const teams = config.integrations.teams;

  const updateSlack = (fields: Partial<typeof config.integrations.slack>) => {
    updateSection('integrations', {
      slack: { ...config.integrations.slack, ...fields },
    });
  };

  const updateTeams = (fields: Partial<typeof config.integrations.teams>) => {
    updateSection('integrations', {
      teams: { ...config.integrations.teams, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Security & Connected Webhooks"
        description="Dispatch automated notifications on HIL approval requests, test failures, and PR creation"
      />

      {/* SLACK INTEGRATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Slack Webhook & Escalation Channel</h2>
            <p className="text-[11px] text-slate-400">Target channel for Human-in-the-Loop approval pings</p>
          </div>
          <Toggle
            label=""
            checked={slack.enabled}
            onChange={(v) => updateSlack({ enabled: v })}
          />
        </div>

        {slack.enabled ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SecretField
                label="Slack Webhook URL"
                value={slack.webhookUrl}
                onChange={(v) => updateSlack({ webhookUrl: v })}
                placeholder="https://hooks.slack.com/services/..."
                required
              />

              <FormField label="Slack Channel" required>
                <input
                  type="text"
                  value={slack.channel}
                  onChange={(e) => updateSlack({ channel: e.target.value })}
                  placeholder="#agent-escalations"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <Toggle
                label="Alert on Test & Validation Failure"
                checked={slack.notifyOnBuildFailure}
                onChange={(v) => updateSlack({ notifyOnBuildFailure: v })}
              />

              <Toggle
                label="Notify when PR is Created"
                checked={slack.notifyOnDeployment}
                onChange={(v) => updateSlack({ notifyOnDeployment: v })}
              />
            </div>

            {/* Test Connection */}
            <div className="pt-2 border-t border-slate-100">
              <ConnectionTest serviceKey="slack" serviceName="SLACK WEBHOOK" />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
            Slack notifications are currently disabled.
          </div>
        )}
      </div>

      {/* MICROSOFT TEAMS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Microsoft Teams Webhook</h2>
            <p className="text-[11px] text-slate-400">Dispatch adaptive cards to MS Teams channels</p>
          </div>
          <Toggle
            label=""
            checked={teams.enabled}
            onChange={(v) => updateTeams({ enabled: v })}
          />
        </div>

        {teams.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SecretField
                label="Teams Webhook URL"
                value={teams.webhookUrl}
                onChange={(v) => updateTeams({ webhookUrl: v })}
                required
              />

              <FormField label="Channel Name">
                <input
                  type="text"
                  value={teams.channelName}
                  onChange={(e) => updateTeams({ channelName: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
