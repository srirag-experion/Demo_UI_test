import React from 'react';
import {
  Brain,
  Database,
  GitBranch,
  FlaskConical,
  Ticket,
  MessageSquare,
  Bot,
  ArrowUpRight,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { FormField } from '../components/common/FormField';
import { useConfig } from '../context/ConfigContext';
import { SectionId } from '../types/config';

export const OverviewSection: React.FC = () => {
  const { config, updateSection, setActiveSection, resetToDefaults, setJsonConfigDrawerOpen } =
    useConfig();

  const serviceCards = [
    {
      id: 'llm' as SectionId,
      title: 'LLM Model Providers',
      provider: config.llm.provider.toUpperCase(),
      details:
        config.llm.provider === 'openai'
          ? config.llm.openai.model
          : config.llm.provider === 'anthropic'
          ? config.llm.anthropic.model
          : config.llm.provider === 'azure'
          ? config.llm.azure.deploymentId
          : config.llm.google.model,
      icon: Brain,
      connectedDate: 'Connected: Today',
    },
    {
      id: 'rag' as SectionId,
      title: 'Knowledge Base & Vector Store',
      provider: config.rag.vectorDb.toUpperCase(),
      details: `${config.rag.chunkSize} tokens • ${config.rag.embeddingProvider}`,
      icon: Database,
      connectedDate: 'Connected: Active',
    },
    {
      id: 'source_control' as SectionId,
      title: 'Source Code Connections',
      provider: config.sourceControl.provider.toUpperCase(),
      details: `${config.sourceControl.github.organization}/${config.sourceControl.github.repository}`,
      icon: GitBranch,
      connectedDate: 'Connected: Synced',
    },
    {
      id: 'test_runner' as SectionId,
      title: 'Automated QA & Test Runners',
      provider: config.testRunner.runner.toUpperCase(),
      details: `Framework: ${config.testRunner.runner.toUpperCase()}`,
      icon: FlaskConical,
      connectedDate: 'Configured',
    },
    {
      id: 'ticketing' as SectionId,
      title: 'Issue & Ticket Workflows',
      provider: config.ticketing.provider.toUpperCase(),
      details: `Project Key: ${config.ticketing.jira.projectKey || 'JIRA'}`,
      icon: Ticket,
      connectedDate: 'Connected: Bi-directional',
    },
    {
      id: 'goose' as SectionId,
      title: 'Autonomous Coding Agents',
      provider: config.goose.autonomyLevel.toUpperCase(),
      details: `${config.goose.model} • Docker Sandbox`,
      icon: Bot,
      connectedDate: 'Ready',
    },
    {
      id: 'integrations' as SectionId,
      title: 'Connected APIs & Slack',
      provider: config.integrations.slack.enabled ? 'SLACK ACTIVE' : 'DISABLED',
      details: config.integrations.slack.channel || 'No active channel',
      icon: MessageSquare,
      connectedDate: 'Webhook Active',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="System Settings"
        description="Setup and edit system settings, AI providers, and project preferences"
        actions={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={resetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => setJsonConfigDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-[#94d320] hover:bg-[#84cc16] rounded-lg transition shadow-xs"
            >
              <Zap size={13} />
              <span>Runtime JSON</span>
            </button>
          </div>
        }
      />

      {/* Project Identity & Scope Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">General Information</h2>
            <p className="text-[11px] text-slate-400">Core identity parameters for this project configuration</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#edf8c7] text-slate-900 rounded-md border border-[#94d320]/30">
            {config.projectKey}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormField label="Project Key / Prefix">
            <input
              type="text"
              value={config.projectKey}
              onChange={(e) => updateSection('projectKey' as any, e.target.value as any)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </FormField>

          <FormField label="Project Name">
            <input
              type="text"
              value={config.projectName}
              onChange={(e) => updateSection('projectName' as any, e.target.value as any)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </FormField>

          <FormField label="Organization / Tenant">
            <input
              type="text"
              value={config.organization}
              onChange={(e) => updateSection('organization' as any, e.target.value as any)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </FormField>
        </div>
      </div>

      {/* Subsystem Health Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Connected Services & Modules</h3>
            <p className="text-[11px] text-slate-400">Click any card to edit its underlying parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveSection(card.id)}
                className="group bg-white border border-slate-200/80 hover:border-lime-400 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-[#edf8c7] text-[#65a30d]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-lime-700 transition-colors">
                          {card.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {card.connectedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                    {card.details}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#65a30d] font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Edit Settings</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
