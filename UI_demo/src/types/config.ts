export type SectionId =
  | 'overview'
  | 'codegraph'
  | 'llm'
  | 'ticketing'
  | 'source_control'
  | 'rag'
  | 'test_runner'
  | 'goose'
  | 'integrations';

export type LLMProviderType = 'openai' | 'anthropic' | 'google' | 'azure';
export type TicketingProviderType = 'jira' | 'linear';
export type SCMProviderType = 'github' | 'gitlab' | 'bitbucket';
export type VectorDBType = 'pinecone' | 'qdrant' | 'pgvector' | 'weaviate';
export type TestRunnerType = 'vitest' | 'jest' | 'playwright' | 'cypress' | 'pytest';
export type GooseAutonomyType = 'suggest' | 'semi-autonomous' | 'full-autonomous';

export interface StatusMapping {
  id: string;
  remoteStatus: string;
  internalStatus: 'Open' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
  autoTransition: boolean;
}

export interface AppConfigState {
  projectName: string;
  projectKey: string;
  organization: string;
  environment: 'development' | 'staging' | 'production';
  lastSavedAt: string | null;

  llm: {
    provider: LLMProviderType;
    openai: {
      model: string;
      apiKey: string;
      organizationId: string;
      baseUrl: string;
      temperature: number;
      maxTokens: number;
      streamResponses: boolean;
    };
    anthropic: {
      model: string;
      apiKey: string;
      baseUrl: string;
      anthropicVersion: string;
      temperature: number;
      maxTokens: number;
    };
    google: {
      model: string;
      apiKey: string;
      projectId: string;
      region: string;
      temperature: number;
      maxTokens: number;
    };
    azure: {
      endpoint: string;
      deploymentId: string;
      apiVersion: string;
      apiKey: string;
      model: string;
      resourceName: string;
      temperature: number;
      maxTokens: number;
    };
  };

  ticketing: {
    provider: TicketingProviderType;
    jira: {
      url: string;
      email: string;
      apiToken: string;
      projectKey: string;
      issueType: string;
      statusMappings: StatusMapping[];
      autoSyncIntervalMin: number;
      enableTwoWaySync: boolean;
    };
    linear: {
      apiKey: string;
      workspace: string;
      teamId: string;
      projectId: string;
      defaultLabels: string;
      statusMappings: StatusMapping[];
    };
  };

  sourceControl: {
    provider: SCMProviderType;
    github: {
      organization: string;
      repository: string;
      defaultBranch: string;
      targetBranch: string;
      authToken: string;
      enablePrComments: boolean;
      autoTriggerOnPush: boolean;
      webhookSecret: string;
    };
    gitlab: {
      hostUrl: string;
      projectId: string;
      accessToken: string;
      defaultBranch: string;
      triggerPipelines: boolean;
    };
    bitbucket: {
      workspace: string;
      repositorySlug: string;
      appPassword: string;
      defaultBranch: string;
    };
  };

  rag: {
    documentSourcePath: string;
    fileExtensions: string;
    excludePatterns: string;
    chunkSize: number;
    chunkOverlap: number;
    embeddingProvider: 'openai-text-3-large' | 'voyage-ai-3' | 'cohere-embed-v3' | 'huggingface-local';
    vectorDb: VectorDBType;
    pinecone: {
      apiKey: string;
      environment: string;
      indexName: string;
      namespace: string;
      similarityMetric: 'cosine' | 'euclidean' | 'dotproduct';
    };
    qdrant: {
      url: string;
      apiKey: string;
      collectionName: string;
      vectorSize: number;
    };
    pgvector: {
      connectionString: string;
      tableName: string;
      schema: string;
      maxPoolSize: number;
    };
    weaviate: {
      clusterUrl: string;
      apiKey: string;
      className: string;
    };
  };

  testRunner: {
    runner: TestRunnerType;
    vitest: {
      configPath: string;
      testMatchGlob: string;
      timeoutMs: number;
      watchMode: boolean;
      threads: number;
      coverageReporter: 'v8' | 'istanbul';
    };
    jest: {
      configPath: string;
      testMatchGlob: string;
      timeoutMs: number;
      collectCoverage: boolean;
    };
    playwright: {
      configPath: string;
      baseURL: string;
      browserList: string;
      headless: boolean;
      trace: 'on' | 'off' | 'retain-on-failure';
      workers: number;
    };
    cypress: {
      configFile: string;
      baseUrl: string;
      browser: 'chrome' | 'electron' | 'firefox';
      recordVideo: boolean;
    };
    pytest: {
      rootDirectory: string;
      pythonBinary: string;
      extraArgs: string;
      generateJunitXml: boolean;
    };
  };

  goose: {
    provider: LLMProviderType;
    model: string;
    apiKey: string;
    autonomyLevel: GooseAutonomyType;
    allowedTools: {
      bash: boolean;
      git: boolean;
      fileEdit: boolean;
      webSearch: boolean;
      mcpServers: boolean;
    };
    sandboxDirectory: string;
    maxIterations: number;
    requireUserApprovalForDangerousCommands: boolean;
  };

  integrations: {
    slack: {
      enabled: boolean;
      webhookUrl: string;
      botToken: string;
      channel: string;
      notifyOnBuildFailure: boolean;
      notifyOnSecurityGateFailure: boolean;
      notifyOnDeployment: boolean;
    };
    teams: {
      enabled: boolean;
      webhookUrl: string;
      channelName: string;
      useAdaptiveCards: boolean;
      notifyOnBuildFailure: boolean;
    };
  };
}

export type ConnectionTestResult = {
  status: 'idle' | 'testing' | 'success' | 'failed';
  latencyMs?: number;
  message?: string;
  testedAt?: string;
};
