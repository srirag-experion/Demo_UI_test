import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfigState, SectionId, ConnectionTestResult } from '../types/config';

export const INITIAL_PROJECTS: Record<string, AppConfigState> = {
  'ASTRA-CORE': {
    projectName: 'enterprise-core-service',
    projectKey: 'ASTRA-CORE',
    organization: 'Astra Global Tech',
    environment: 'production',
    lastSavedAt: '10:00:00 AM',
    llm: {
      provider: 'openai',
      openai: {
        model: 'gpt-4o',
        apiKey: 'sk-proj-7a989f8a20d43e21894b9101c4e9',
        organizationId: 'org-enterprise-astra-main',
        baseUrl: 'https://api.openai.com/v1',
        temperature: 0.3,
        maxTokens: 4096,
        streamResponses: true,
      },
      anthropic: {
        model: 'claude-3-7-sonnet-20250219',
        apiKey: 'sk-ant-api03-99b821af43b',
        baseUrl: 'https://api.anthropic.com/v1',
        anthropicVersion: '2023-06-01',
        temperature: 0.2,
        maxTokens: 8192,
      },
      google: {
        model: 'gemini-2.5-pro-preview-0301',
        apiKey: 'AIzaSyA88931201kLmx',
        projectId: 'astra-production-cluster-01',
        region: 'us-central1',
        temperature: 0.4,
        maxTokens: 8192,
      },
      azure: {
        endpoint: 'https://astra-openai-eastus.openai.azure.com/',
        deploymentId: 'gpt-4o-deployment-prod',
        apiVersion: '2024-06-01',
        apiKey: 'az-sec-01928471bcca',
        model: 'gpt-4o',
        resourceName: 'astra-openai-eastus',
        temperature: 0.3,
        maxTokens: 4096,
      },
    },
    ticketing: {
      provider: 'jira',
      jira: {
        url: 'https://astratech.atlassian.net',
        email: 'srirag.cr@astratech.internal',
        apiToken: 'ATATT3xFfGF0d87a2bc419',
        projectKey: 'ASTRA',
        issueType: 'Bug / Tech Debt',
        statusMappings: [
          { id: '1', remoteStatus: 'To Do', internalStatus: 'Open', autoTransition: true },
          { id: '2', remoteStatus: 'In Progress', internalStatus: 'In Progress', autoTransition: true },
          { id: '3', remoteStatus: 'Code Review', internalStatus: 'In Review', autoTransition: true },
          { id: '4', remoteStatus: 'Done', internalStatus: 'Completed', autoTransition: true },
        ],
        autoSyncIntervalMin: 15,
        enableTwoWaySync: true,
      },
      linear: {
        apiKey: '',
        workspace: 'astra-core',
        teamId: 'ENG',
        projectId: 'PROJ-1',
        defaultLabels: 'backend',
        statusMappings: [],
      },
    },
    sourceControl: {
      provider: 'github',
      github: {
        organization: 'Astra-Global',
        repository: 'enterprise-core-service',
        defaultBranch: 'main',
        targetBranch: 'staging',
        authToken: 'ghp_9148723908abfcba9842',
        enablePrComments: true,
        autoTriggerOnPush: true,
        webhookSecret: 'whsec_99318a42b10',
      },
      gitlab: { hostUrl: 'https://gitlab.com', projectId: 'astra/core', accessToken: '', defaultBranch: 'main', triggerPipelines: true },
      bitbucket: { workspace: 'astra', repositorySlug: 'core', appPassword: '', defaultBranch: 'master' },
    },
    rag: {
      documentSourcePath: './docs,./packages/api-spec',
      fileExtensions: '.md,.mdx,.ts,.json',
      excludePatterns: '**/node_modules/**,**/dist/**',
      chunkSize: 512,
      chunkOverlap: 64,
      embeddingProvider: 'openai-text-3-large',
      vectorDb: 'pinecone',
      pinecone: {
        apiKey: 'pc-sec-01928419',
        environment: 'us-east-1-aws',
        indexName: 'astra-doc-embeddings-v2',
        namespace: 'core-knowledge',
        similarityMetric: 'cosine',
      },
      qdrant: { url: 'https://qdrant.astra.internal:6333', apiKey: '', collectionName: 'core_docs', vectorSize: 1536 },
      pgvector: { connectionString: '', tableName: 'docs', schema: 'public', maxPoolSize: 10 },
      weaviate: { clusterUrl: '', apiKey: '', className: 'DocChunk' },
    },
    testRunner: {
      runner: 'playwright',
      vitest: { configPath: './vitest.config.ts', testMatchGlob: '**/*.test.ts', timeoutMs: 5000, watchMode: false, threads: 4, coverageReporter: 'v8' },
      jest: { configPath: './jest.config.js', testMatchGlob: '**/*.spec.js', timeoutMs: 5000, collectCoverage: true },
      playwright: { configPath: './playwright.config.ts', baseURL: 'http://localhost:3000', browserList: 'chromium, firefox', headless: true, trace: 'retain-on-failure', workers: 4 },
      cypress: { configFile: './cypress.config.js', baseUrl: 'http://localhost:3000', browser: 'chrome', recordVideo: false },
      pytest: { rootDirectory: './tests', pythonBinary: 'python3', extraArgs: '-v', generateJunitXml: true },
    },
    goose: {
      provider: 'anthropic',
      model: 'claude-3-7-sonnet',
      apiKey: 'sk-ant-api03-99b821af43b',
      autonomyLevel: 'semi-autonomous',
      allowedTools: { bash: true, git: true, fileEdit: true, webSearch: false, mcpServers: true },
      sandboxDirectory: 'C:\\Users\\srirag.cr\\Desktop\\UI_Demo_Astra',
      maxIterations: 25,
      requireUserApprovalForDangerousCommands: true,
    },
    integrations: {
      slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXX', botToken: 'xoxb-core', channel: '#core-quality-gates', notifyOnBuildFailure: true, notifyOnSecurityGateFailure: true, notifyOnDeployment: false },
      teams: { enabled: false, webhookUrl: '', channelName: '', useAdaptiveCards: true, notifyOnBuildFailure: true },
    },
  },

  'PAY-API': {
    projectName: 'payment-microservice',
    projectKey: 'PAY-API',
    organization: 'Astra Fintech',
    environment: 'production',
    lastSavedAt: '09:45:00 AM',
    llm: {
      provider: 'anthropic',
      openai: { model: 'gpt-4o', apiKey: '', organizationId: '', baseUrl: 'https://api.openai.com/v1', temperature: 0.2, maxTokens: 4096, streamResponses: true },
      anthropic: { model: 'claude-3-7-sonnet-20250219', apiKey: 'sk-ant-fintech-sec-09124', baseUrl: 'https://api.anthropic.com/v1', anthropicVersion: '2023-06-01', temperature: 0.1, maxTokens: 8192 },
      google: { model: 'gemini-2.5-pro', apiKey: '', projectId: '', region: 'us-central1', temperature: 0.2, maxTokens: 4096 },
      azure: { endpoint: '', deploymentId: '', apiVersion: '2024-06-01', apiKey: '', model: 'gpt-4o', resourceName: '', temperature: 0.2, maxTokens: 4096 },
    },
    ticketing: {
      provider: 'jira',
      jira: {
        url: 'https://astratech.atlassian.net',
        email: 'payments-bot@astratech.internal',
        apiToken: 'ATATT3xFfGF0d-payments',
        projectKey: 'PAY',
        issueType: 'Bug / Security',
        statusMappings: [
          { id: '1', remoteStatus: 'Ready for Agent', internalStatus: 'Open', autoTransition: true },
          { id: '2', remoteStatus: 'Agent Working', internalStatus: 'In Progress', autoTransition: true },
          { id: '3', remoteStatus: 'PR Created', internalStatus: 'Completed', autoTransition: true },
        ],
        autoSyncIntervalMin: 5,
        enableTwoWaySync: true,
      },
      linear: { apiKey: '', workspace: 'fintech', teamId: 'PAY', projectId: 'P-1', defaultLabels: 'backend, payments', statusMappings: [] },
    },
    sourceControl: {
      provider: 'github',
      github: {
        organization: 'Astra-Global',
        repository: 'payment-microservice',
        defaultBranch: 'main',
        targetBranch: 'main',
        authToken: 'ghp_payment_token_88921',
        enablePrComments: true,
        autoTriggerOnPush: true,
        webhookSecret: 'whsec_pay_9918',
      },
      gitlab: { hostUrl: '', projectId: '', accessToken: '', defaultBranch: 'main', triggerPipelines: false },
      bitbucket: { workspace: '', repositorySlug: '', appPassword: '', defaultBranch: 'master' },
    },
    rag: {
      documentSourcePath: './docs/api,./specs/stripe',
      fileExtensions: '.md,.py,.yaml',
      excludePatterns: '**/__pycache__/**',
      chunkSize: 400,
      chunkOverlap: 40,
      embeddingProvider: 'openai-text-3-large',
      vectorDb: 'qdrant',
      pinecone: { apiKey: '', environment: '', indexName: '', namespace: '', similarityMetric: 'cosine' },
      qdrant: { url: 'http://localhost:8000', apiKey: 'qdrant-local-token', collectionName: 'project-docs-PAY', vectorSize: 1536 },
      pgvector: { connectionString: '', tableName: '', schema: 'public', maxPoolSize: 10 },
      weaviate: { clusterUrl: '', apiKey: '', className: '' },
    },
    testRunner: {
      runner: 'pytest',
      vitest: { configPath: '', testMatchGlob: '', timeoutMs: 5000, watchMode: false, threads: 2, coverageReporter: 'v8' },
      jest: { configPath: '', testMatchGlob: '', timeoutMs: 5000, collectCoverage: false },
      playwright: { configPath: '', baseURL: '', browserList: '', headless: true, trace: 'off', workers: 1 },
      cypress: { configFile: '', baseUrl: '', browser: 'chrome', recordVideo: false },
      pytest: { rootDirectory: './tests/unit,./tests/integration', pythonBinary: 'python3', extraArgs: '-v --tb=short', generateJunitXml: true },
    },
    goose: {
      provider: 'anthropic',
      model: 'claude-3-7-sonnet',
      apiKey: 'sk-ant-fintech-sec-09124',
      autonomyLevel: 'semi-autonomous',
      allowedTools: { bash: true, git: true, fileEdit: true, webSearch: false, mcpServers: true },
      sandboxDirectory: '/workspace/payment-microservice',
      maxIterations: 20,
      requireUserApprovalForDangerousCommands: true,
    },
    integrations: {
      slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/services/T00/B00/PAY', botToken: 'xoxb-pay', channel: '#payment-alerts', notifyOnBuildFailure: true, notifyOnSecurityGateFailure: true, notifyOnDeployment: true },
      teams: { enabled: false, webhookUrl: '', channelName: '', useAdaptiveCards: false, notifyOnBuildFailure: false },
    },
  },

  'WEB-PORTAL': {
    projectName: 'customer-web-portal',
    projectKey: 'WEB-PORTAL',
    organization: 'Astra Digital',
    environment: 'development',
    lastSavedAt: 'Yesterday',
    llm: {
      provider: 'google',
      openai: { model: 'gpt-4o', apiKey: '', organizationId: '', baseUrl: 'https://api.openai.com/v1', temperature: 0.3, maxTokens: 4096, streamResponses: true },
      anthropic: { model: 'claude-3-7-sonnet', apiKey: '', baseUrl: '', anthropicVersion: '2023-06-01', temperature: 0.2, maxTokens: 4096 },
      google: { model: 'gemini-2.5-pro-preview-0301', apiKey: 'AIzaSyA_Portal_Google_Key', projectId: 'astra-web-portal-dev', region: 'us-west1', temperature: 0.3, maxTokens: 8192 },
      azure: { endpoint: '', deploymentId: '', apiVersion: '2024-06-01', apiKey: '', model: 'gpt-4o', resourceName: '', temperature: 0.3, maxTokens: 4096 },
    },
    ticketing: {
      provider: 'linear',
      jira: { url: '', email: '', apiToken: '', projectKey: 'WEB', issueType: 'Task', statusMappings: [], autoSyncIntervalMin: 15, enableTwoWaySync: false },
      linear: { apiKey: 'lin_api_web_portal_key', workspace: 'astra-digital', teamId: 'FRONTEND', projectId: 'PROJ-WEB-99', defaultLabels: 'frontend, ui, reactive', statusMappings: [
        { id: '1', remoteStatus: 'Triage', internalStatus: 'Open', autoTransition: true },
        { id: '2', remoteStatus: 'In Progress', internalStatus: 'In Progress', autoTransition: true },
        { id: '3', remoteStatus: 'Done', internalStatus: 'Completed', autoTransition: true },
      ] },
    },
    sourceControl: {
      provider: 'github',
      github: {
        organization: 'Astra-Global',
        repository: 'customer-web-portal',
        defaultBranch: 'main',
        targetBranch: 'development',
        authToken: 'ghp_web_token_77189',
        enablePrComments: true,
        autoTriggerOnPush: true,
        webhookSecret: 'whsec_web_77',
      },
      gitlab: { hostUrl: '', projectId: '', accessToken: '', defaultBranch: 'main', triggerPipelines: false },
      bitbucket: { workspace: '', repositorySlug: '', appPassword: '', defaultBranch: 'master' },
    },
    rag: {
      documentSourcePath: './docs,./src/components/README.md',
      fileExtensions: '.md,.tsx,.ts',
      excludePatterns: '**/node_modules/**',
      chunkSize: 512,
      chunkOverlap: 64,
      embeddingProvider: 'openai-text-3-large',
      vectorDb: 'pinecone',
      pinecone: { apiKey: 'pc-sec-web-991', environment: 'us-west-1-gcp', indexName: 'web-portal-docs', namespace: 'frontend-components', similarityMetric: 'cosine' },
      qdrant: { url: '', apiKey: '', collectionName: '', vectorSize: 1536 },
      pgvector: { connectionString: '', tableName: '', schema: 'public', maxPoolSize: 10 },
      weaviate: { clusterUrl: '', apiKey: '', className: '' },
    },
    testRunner: {
      runner: 'vitest',
      vitest: { configPath: './vitest.config.ts', testMatchGlob: '**/*.spec.{ts,tsx}', timeoutMs: 5000, watchMode: false, threads: 4, coverageReporter: 'v8' },
      jest: { configPath: '', testMatchGlob: '', timeoutMs: 5000, collectCoverage: false },
      playwright: { configPath: './playwright.config.ts', baseURL: 'http://localhost:5173', browserList: 'chromium', headless: true, trace: 'off', workers: 2 },
      cypress: { configFile: '', baseUrl: '', browser: 'chrome', recordVideo: false },
      pytest: { rootDirectory: '', pythonBinary: 'python3', extraArgs: '', generateJunitXml: false },
    },
    goose: {
      provider: 'google',
      model: 'gemini-2.5-pro',
      apiKey: 'AIzaSyA_Portal_Google_Key',
      autonomyLevel: 'full-autonomous',
      allowedTools: { bash: true, git: true, fileEdit: true, webSearch: true, mcpServers: true },
      sandboxDirectory: '/workspace/customer-web-portal',
      maxIterations: 30,
      requireUserApprovalForDangerousCommands: false,
    },
    integrations: {
      slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/services/T00/B00/WEB', botToken: 'xoxb-web', channel: '#frontend-reviews', notifyOnBuildFailure: true, notifyOnSecurityGateFailure: false, notifyOnDeployment: true },
      teams: { enabled: false, webhookUrl: '', channelName: '', useAdaptiveCards: false, notifyOnBuildFailure: false },
    },
  },
};

const MULTI_STORAGE_KEY = 'astra_multi_projects_v2';
const ACTIVE_PROJECT_KEY = 'astra_active_project_id';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ConfigContextType {
  // Active Project & State
  config: AppConfigState;
  activeProjectId: string;
  projects: Record<string, AppConfigState>;
  projectList: Array<{ id: string; name: string; org: string; key: string; repo: string }>;
  switchProject: (projectId: string) => void;
  createNewProject: (key: string, name: string, org: string, repo: string) => void;
  deleteProject: (projectId: string) => void;

  // Active section & Config editing
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  updateSection: <K extends keyof AppConfigState>(section: K, updates: Partial<AppConfigState[K]>) => void;
  isDirty: boolean;
  saveConfig: () => Promise<void>;
  discardChanges: () => void;
  resetToDefaults: () => void;

  // Connection testing & alerts
  testConnection: (serviceKey: string) => Promise<ConnectionTestResult>;
  connectionTests: Record<string, ConnectionTestResult>;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;

  // Code inspection drawer & modal
  jsonConfigDrawerOpen: boolean;
  setJsonConfigDrawerOpen: (open: boolean) => void;
  newProjectModalOpen: boolean;
  setNewProjectModalOpen: (open: boolean) => void;
}

export const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [jsonConfigDrawerOpen, setJsonConfigDrawerOpen] = useState(false);

  // Multi-Project store
  const [projects, setProjects] = useState<Record<string, AppConfigState>>(() => {
    try {
      const stored = localStorage.getItem(MULTI_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
      return stored && projects[stored] ? stored : 'ASTRA-CORE';
    } catch {
      return 'ASTRA-CORE';
    }
  });

  const [persistedConfig, setPersistedConfig] = useState<AppConfigState>(
    projects[activeProjectId] || INITIAL_PROJECTS['ASTRA-CORE']
  );
  const [config, setConfig] = useState<AppConfigState>(persistedConfig);
  const [isDirty, setIsDirty] = useState(false);
  const [connectionTests, setConnectionTests] = useState<Record<string, ConnectionTestResult>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check dirty state
  useEffect(() => {
    const isDifferent = JSON.stringify(config) !== JSON.stringify(persistedConfig);
    setIsDirty(isDifferent);
  }, [config, persistedConfig]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const projectList = Object.entries(projects).map(([id, proj]) => ({
    id,
    key: proj.projectKey || id,
    name: proj.projectName,
    org: proj.organization,
    repo: `${proj.sourceControl.github.organization}/${proj.sourceControl.github.repository}`,
  }));

  const switchProject = (newProjectId: string) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes in the current project. Switch anyway?')) {
        return;
      }
    }
    const target = projects[newProjectId];
    if (target) {
      setActiveProjectId(newProjectId);
      setPersistedConfig(target);
      setConfig(target);
      setIsDirty(false);
      localStorage.setItem(ACTIVE_PROJECT_KEY, newProjectId);
      showToast('info', `Switched Project: ${target.projectName}`, `Active configuration context is now ${newProjectId}.`);
    }
  };

  const createNewProject = (key: string, name: string, org: string, repo: string) => {
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey) return;

    const baseTemplate: AppConfigState = {
      ...INITIAL_PROJECTS['ASTRA-CORE'],
      projectKey: cleanKey,
      projectName: name || cleanKey.toLowerCase(),
      organization: org || 'Enterprise Org',
      lastSavedAt: 'Just created',
      sourceControl: {
        ...INITIAL_PROJECTS['ASTRA-CORE'].sourceControl,
        github: {
          ...INITIAL_PROJECTS['ASTRA-CORE'].sourceControl.github,
          organization: org || 'Enterprise-Org',
          repository: repo || cleanKey.toLowerCase(),
        },
      },
      ticketing: {
        ...INITIAL_PROJECTS['ASTRA-CORE'].ticketing,
        jira: {
          ...INITIAL_PROJECTS['ASTRA-CORE'].ticketing.jira,
          projectKey: cleanKey,
        },
      },
      rag: {
        ...INITIAL_PROJECTS['ASTRA-CORE'].rag,
        pinecone: {
          ...INITIAL_PROJECTS['ASTRA-CORE'].rag.pinecone,
          indexName: `${cleanKey.toLowerCase()}-embeddings`,
          namespace: `${cleanKey.toLowerCase()}-docs`,
        },
      },
    };

    const updatedProjects = {
      ...projects,
      [cleanKey]: baseTemplate,
    };

    setProjects(updatedProjects);
    localStorage.setItem(MULTI_STORAGE_KEY, JSON.stringify(updatedProjects));
    setActiveProjectId(cleanKey);
    setPersistedConfig(baseTemplate);
    setConfig(baseTemplate);
    setIsDirty(false);
    localStorage.setItem(ACTIVE_PROJECT_KEY, cleanKey);
    setNewProjectModalOpen(false);
    showToast('success', `Project '${cleanKey}' Created`, 'A new isolated project configuration has been provisioned.');
  };

  const deleteProject = (projectId: string) => {
    const keys = Object.keys(projects);
    if (keys.length <= 1) {
      showToast('error', 'Cannot Delete', 'At least one project configuration must remain.');
      return;
    }

    const { [projectId]: deleted, ...remaining } = projects;
    setProjects(remaining);
    localStorage.setItem(MULTI_STORAGE_KEY, JSON.stringify(remaining));

    const nextId = Object.keys(remaining)[0];
    setActiveProjectId(nextId);
    setPersistedConfig(remaining[nextId]);
    setConfig(remaining[nextId]);
    localStorage.setItem(ACTIVE_PROJECT_KEY, nextId);
    showToast('info', 'Project Removed', `Configuration for ${projectId} deleted.`);
  };

  const updateSection = <K extends keyof AppConfigState>(section: K, updates: Partial<AppConfigState[K]>) => {
    setConfig((prev) => {
      const currentVal = prev[section];
      if (typeof currentVal === 'object' && currentVal !== null && !Array.isArray(currentVal)) {
        return {
          ...prev,
          [section]: {
            ...currentVal,
            ...updates,
          },
        };
      }
      return {
        ...prev,
        [section]: updates,
      };
    });
  };

  const saveConfig = async () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updated = {
      ...config,
      lastSavedAt: timestamp,
    };

    const updatedProjects = {
      ...projects,
      [activeProjectId]: updated,
    };

    try {
      localStorage.setItem(MULTI_STORAGE_KEY, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      setPersistedConfig(updated);
      setConfig(updated);
      setIsDirty(false);
      showToast('success', `Saved: ${config.projectName}`, `Configuration for project [${activeProjectId}] saved.`);
    } catch (e) {
      showToast('error', 'Failed to Save', 'Storage write error.');
    }
  };

  const discardChanges = () => {
    setConfig(persistedConfig);
    setIsDirty(false);
    showToast('info', 'Changes Discarded', `Reverted [${activeProjectId}] back to last saved state.`);
  };

  const resetToDefaults = () => {
    const template = INITIAL_PROJECTS[activeProjectId] || INITIAL_PROJECTS['ASTRA-CORE'];
    setConfig(template);
    setIsDirty(true);
    showToast('info', 'Reset to Template', 'Fields reset to default template values.');
  };

  const testConnection = async (serviceKey: string): Promise<ConnectionTestResult> => {
    setConnectionTests((prev) => ({
      ...prev,
      [serviceKey]: { status: 'testing' },
    }));

    const delay = Math.floor(Math.random() * 400) + 500;
    await new Promise((res) => setTimeout(res, delay));

    let passed = true;
    let failReason = '';

    if (serviceKey === 'openai' && (!config.llm.openai.apiKey || config.llm.openai.apiKey.length < 5)) {
      passed = false;
      failReason = 'OpenAI API key missing.';
    } else if (serviceKey === 'anthropic' && !config.llm.anthropic.apiKey) {
      passed = false;
      failReason = 'Anthropic API key is empty.';
    } else if (serviceKey === 'jira' && (!config.ticketing.jira.url || !config.ticketing.jira.apiToken)) {
      passed = false;
      failReason = 'Jira URL or Token missing.';
    }

    const latency = Math.floor(Math.random() * 70) + 60;
    const result: ConnectionTestResult = {
      status: passed ? 'success' : 'failed',
      latencyMs: passed ? latency : undefined,
      message: passed ? `HTTP 200 OK (${latency}ms) - Verified for ${activeProjectId}` : failReason || 'Authentication error.',
      testedAt: new Date().toLocaleTimeString(),
    };

    setConnectionTests((prev) => ({
      ...prev,
      [serviceKey]: result,
    }));

    if (passed) {
      showToast('success', `${serviceKey.toUpperCase()} Connected`, `Project [${activeProjectId}] • ${latency}ms latency`);
    } else {
      showToast('error', `Connection Failed: ${serviceKey}`, result.message);
    }

    return result;
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        activeProjectId,
        projects,
        projectList,
        switchProject,
        createNewProject,
        deleteProject,
        activeSection,
        setActiveSection,
        updateSection,
        isDirty,
        saveConfig,
        discardChanges,
        resetToDefaults,
        testConnection,
        connectionTests,
        toasts,
        removeToast,
        showToast,
        jsonConfigDrawerOpen,
        setJsonConfigDrawerOpen,
        newProjectModalOpen,
        setNewProjectModalOpen,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
