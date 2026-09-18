import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { Toggle } from '../components/common/Toggle';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { LLMProviderType } from '../types/config';

export const LLMProviderSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const provider = config.llm.provider;

  const handleProviderChange = (newProvider: string) => {
    updateSection('llm', { provider: newProvider as LLMProviderType });
  };

  const updateOpenAI = (fields: Partial<typeof config.llm.openai>) => {
    updateSection('llm', {
      openai: { ...config.llm.openai, ...fields },
    });
  };

  const updateAnthropic = (fields: Partial<typeof config.llm.anthropic>) => {
    updateSection('llm', {
      anthropic: { ...config.llm.anthropic, ...fields },
    });
  };

  const updateGoogle = (fields: Partial<typeof config.llm.google>) => {
    updateSection('llm', {
      google: { ...config.llm.google, ...fields },
    });
  };

  const updateAzure = (fields: Partial<typeof config.llm.azure>) => {
    updateSection('llm', {
      azure: { ...config.llm.azure, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Agents' Settings"
        description="Configure connected AI model backends, API credentials, and inference limits"
      />

      {/* Connected APIs & Provider Selector Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Connected AI Model Backends</h2>
            <p className="text-[11px] text-slate-400">Select active provider for planning and agentic stages</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/40">
            {provider.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Primary LLM Backend"
            description="Active provider for Stage 1 (Impact Analysis) & Stage 2 (Spec Creation)."
            value={provider}
            onChange={handleProviderChange}
            options={[
              { value: 'openai', label: 'OpenAI (GPT-4o / o3-mini)', badge: 'Recommended' },
              { value: 'anthropic', label: 'Anthropic (Claude 3.7 Sonnet)' },
              { value: 'google', label: 'Google Gemini (Gemini 2.5 Pro)' },
              { value: 'azure', label: 'Azure OpenAI (Enterprise Endpoint)' },
            ]}
          />

          <SelectField
            label="Secondary / Fallback Engine"
            description="Used automatically if rate limits or network handshakes fail."
            value="anthropic"
            onChange={() => {}}
            options={[
              { value: 'anthropic', label: 'Anthropic Claude 3.7' },
              { value: 'openai', label: 'OpenAI GPT-4o' },
              { value: 'google', label: 'Google Gemini 2.5' },
            ]}
          />
        </div>
      </div>

      {/* Dynamic Provider Credentials Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {provider === 'openai' && 'OpenAI Parameters & Credentials'}
              {provider === 'anthropic' && 'Anthropic Claude Credentials'}
              {provider === 'google' && 'Google Cloud Vertex / Gemini API'}
              {provider === 'azure' && 'Azure OpenAI Endpoint & Deployment'}
            </h3>
            <p className="text-[11px] text-slate-400">Credentials are encrypted and mounted to Docker agent</p>
          </div>
        </div>

        {/* 1. OPENAI */}
        {provider === 'openai' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Model Version"
                value={config.llm.openai.model}
                onChange={(v) => updateOpenAI({ model: v })}
                options={[
                  { value: 'gpt-4o', label: 'gpt-4o (Flagship Omni)' },
                  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Fast & Cost Efficient)' },
                  { value: 'o3-mini', label: 'o3-mini (High Reasoning)' },
                  { value: 'o1', label: 'o1 (Deep Reasoning)' },
                ]}
              />

              <SecretField
                label="OpenAI API Key"
                value={config.llm.openai.apiKey}
                onChange={(v) => updateOpenAI({ apiKey: v })}
                placeholder="sk-proj-..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Base URL (Optional Proxy)">
                <input
                  type="text"
                  value={config.llm.openai.baseUrl}
                  onChange={(e) => updateOpenAI({ baseUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Organization ID (Optional)">
                <input
                  type="text"
                  value={config.llm.openai.organizationId}
                  onChange={(e) => updateOpenAI({ organizationId: e.target.value })}
                  placeholder="org-..."
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <FormField
                label={`Sampling Temperature: ${config.llm.openai.temperature}`}
                description="0.0 for deterministic code generation, 0.7 for creative exploration."
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.llm.openai.temperature}
                  onChange={(e) => updateOpenAI({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#94d320] cursor-pointer"
                />
              </FormField>

              <FormField label="Max Completion Tokens">
                <input
                  type="number"
                  min="256"
                  max="32768"
                  step="256"
                  value={config.llm.openai.maxTokens}
                  onChange={(e) => updateOpenAI({ maxTokens: parseInt(e.target.value) || 2048 })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Toggle
                label="Stream Response Tokens"
                description="Enable streaming chunks for lower latency in Goose container."
                checked={config.llm.openai.streamResponses}
                onChange={(v) => updateOpenAI({ streamResponses: v })}
              />
            </div>
          </div>
        )}

        {/* 2. ANTHROPIC */}
        {provider === 'anthropic' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Claude Model"
                value={config.llm.anthropic.model}
                onChange={(v) => updateAnthropic({ model: v })}
                options={[
                  { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (Hybrid Coding)' },
                  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
                ]}
              />

              <SecretField
                label="Anthropic API Key"
                value={config.llm.anthropic.apiKey}
                onChange={(v) => updateAnthropic({ apiKey: v })}
                placeholder="sk-ant-..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Base URL">
                <input
                  type="text"
                  value={config.llm.anthropic.baseUrl}
                  onChange={(e) => updateAnthropic({ baseUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Anthropic Version Header">
                <input
                  type="text"
                  value={config.llm.anthropic.anthropicVersion}
                  onChange={(e) => updateAnthropic({ anthropicVersion: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* 3. GOOGLE */}
        {provider === 'google' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Google Gemini Model"
                value={config.llm.google.model}
                onChange={(v) => updateGoogle({ model: v })}
                options={[
                  { value: 'gemini-2.5-pro-preview-0301', label: 'Gemini 2.5 Pro (Deep Reasoning)' },
                  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                ]}
              />

              <SecretField
                label="Google AI API Key"
                value={config.llm.google.apiKey}
                onChange={(v) => updateGoogle({ apiKey: v })}
                required
              />
            </div>
          </div>
        )}

        {/* 4. AZURE */}
        {provider === 'azure' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Azure OpenAI Endpoint" required>
                <input
                  type="text"
                  value={config.llm.azure.endpoint}
                  onChange={(e) => updateAzure({ endpoint: e.target.value })}
                  placeholder="https://your-resource.openai.azure.com/"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <SecretField
                label="Azure API Key"
                value={config.llm.azure.apiKey}
                onChange={(v) => updateAzure({ apiKey: v })}
                required
              />
            </div>
          </div>
        )}

        {/* Verification Widget */}
        <div className="pt-3 border-t border-slate-100">
          <ConnectionTest serviceKey={provider} serviceName={provider.toUpperCase()} />
        </div>
      </div>
    </div>
  );
};
