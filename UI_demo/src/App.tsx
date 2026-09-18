import React from 'react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AppShell } from './components/layout/AppShell';
import { OverviewSection } from './sections/OverviewSection';
import { LLMProviderSection } from './sections/LLMProviderSection';
import { TicketingSection } from './sections/TicketingSection';
import { SourceControlSection } from './sections/SourceControlSection';
import { RAGSection } from './sections/RAGSection';
import { TestRunnerSection } from './sections/TestRunnerSection';
import { GooseSection } from './sections/GooseSection';
import { IntegrationsSection } from './sections/IntegrationsSection';
import { CodeGraphSection } from '../codegraph/frontend/CodeGraphSection';

const MainContent: React.FC = () => {
  const { activeSection } = useConfig();

  switch (activeSection) {
    case 'overview':
      return <OverviewSection />;
    case 'codegraph':
      return <CodeGraphSection />;
    case 'llm':
      return <LLMProviderSection />;
    case 'ticketing':
      return <TicketingSection />;
    case 'source_control':
      return <SourceControlSection />;
    case 'rag':
      return <RAGSection />;
    case 'test_runner':
      return <TestRunnerSection />;
    case 'goose':
      return <GooseSection />;
    case 'integrations':
      return <IntegrationsSection />;
    default:
      return <OverviewSection />;
  }
};

export function App() {
  return (
    <ConfigProvider>
      <AppShell>
        <MainContent />
      </AppShell>
    </ConfigProvider>
  );
}

export default App;
