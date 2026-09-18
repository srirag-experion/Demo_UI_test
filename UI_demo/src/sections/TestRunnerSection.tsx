import React from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { Toggle } from '../components/common/Toggle';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { TestRunnerType } from '../types/config';

export const TestRunnerSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const runner = config.testRunner.runner;

  const handleRunnerChange = (newRunner: string) => {
    updateSection('testRunner', { runner: newRunner as TestRunnerType });
  };

  const updatePlaywright = (fields: Partial<typeof config.testRunner.playwright>) => {
    updateSection('testRunner', {
      playwright: { ...config.testRunner.playwright, ...fields },
    });
  };

  const updateVitest = (fields: Partial<typeof config.testRunner.vitest>) => {
    updateSection('testRunner', {
      vitest: { ...config.testRunner.vitest, ...fields },
    });
  };

  const updatePytest = (fields: Partial<typeof config.testRunner.pytest>) => {
    updateSection('testRunner', {
      pytest: { ...config.testRunner.pytest, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Maintenance & Test Runners"
        description="Configure Stage 5 validation commands, test frameworks, and coverage thresholds"
      />

      {/* Runner Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Validation Framework</h2>
            <p className="text-[11px] text-slate-400">Command executed in Docker container to verify code fixes</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/40">
            {runner.toUpperCase()}
          </span>
        </div>

        <SelectField
          label="Test & QA Framework"
          value={runner}
          onChange={handleRunnerChange}
          options={[
            { value: 'playwright', label: 'Playwright (E2E & Component)', badge: 'Active' },
            { value: 'vitest', label: 'Vitest (Vite / React Unit Tests)' },
            { value: 'pytest', label: 'Pytest (Python Backend Suite)' },
            { value: 'jest', label: 'Jest (JavaScript / TypeScript)' },
            { value: 'cypress', label: 'Cypress (Browser Tests)' },
          ]}
        />

        {runner === 'playwright' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Config Path">
                <input
                  type="text"
                  value={config.testRunner.playwright.configPath}
                  onChange={(e) => updatePlaywright({ configPath: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Target Base URL">
                <input
                  type="text"
                  value={config.testRunner.playwright.baseURL}
                  onChange={(e) => updatePlaywright({ baseURL: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Browsers">
                <input
                  type="text"
                  value={config.testRunner.playwright.browserList}
                  onChange={(e) => updatePlaywright({ browserList: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Parallel Workers">
                <input
                  type="number"
                  value={config.testRunner.playwright.workers}
                  onChange={(e) => updatePlaywright({ workers: parseInt(e.target.value) || 2 })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Toggle
                label="Run in Headless Mode"
                description="Runs browser tests in the background container without UI rendering."
                checked={config.testRunner.playwright.headless}
                onChange={(v) => updatePlaywright({ headless: v })}
              />
            </div>
          </div>
        )}

        {runner === 'pytest' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Tests Directory">
                <input
                  type="text"
                  value={config.testRunner.pytest.rootDirectory}
                  onChange={(e) => updatePytest({ rootDirectory: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Python Binary">
                <input
                  type="text"
                  value={config.testRunner.pytest.pythonBinary}
                  onChange={(e) => updatePytest({ pythonBinary: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>
          </div>
        )}

        {runner === 'vitest' && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Vitest Config Path">
                <input
                  type="text"
                  value={config.testRunner.vitest.configPath}
                  onChange={(e) => updateVitest({ configPath: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>

              <FormField label="Test Match Glob">
                <input
                  type="text"
                  value={config.testRunner.vitest.testMatchGlob}
                  onChange={(e) => updateVitest({ testMatchGlob: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="pt-3 border-t border-slate-100">
          <ConnectionTest serviceKey={runner} serviceName={runner.toUpperCase()} />
        </div>
      </div>
    </div>
  );
};
