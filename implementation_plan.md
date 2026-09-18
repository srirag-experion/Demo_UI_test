# Implementation Plan: SonarQube-Style Enterprise Project Configuration Console

Build a production-grade, interactive **Project Configuration Console** in [c:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo](file:///c:/Users/srirag.cr/Desktop/UI_Demo_Astra/UI_demo). The design and information architecture draws inspiration from **SonarQube**'s clean enterprise console layout (persistent sidebar navigation, top application bar with project selector, breadcrumbs, status indicators, dynamic content panels with conditional form fields, connection testing, editable mappings, and unsaved changes state management).

---

## 1. Requirement & Architecture Analysis

### Core Problem & Goal
Instead of creating dozens of disparate static pages or spending hours creating hundreds of repetitive Figma vector shapes manually:
1. We build a **single, responsive React + TypeScript + Tailwind CSS application shell** powered by a unified configuration state store.
2. The UI renders **modular, reactive panels** based on the active section and selected provider.
3. Every field, toggle, editable mapping table, and action button (Test Connection, Save, Discard, Apply) is **fully interactive** with simulated real-world feedback (loading spinners, success badges, validation errors, toast notifications).
4. The running local application on `http://localhost:5173` is structured to be directly importable via **Figma Code-to-Canvas** or **Figma Make** to convert live UI states into editable Figma Design layers.

---

## 2. Information Architecture (SonarQube-Inspired)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⬡ Astra Config Console   📁 Repo: /enterprise/core-service  ● Synced  [Discard] [Save]  │  <-- TopBar
├──────────────────────┬─────────────────────────────────────────────────────────────────┤
│ SEARCH CONFIG        │ 📁 Project Configuration / AI & LLM / LLM Provider             │
│                      ├─────────────────────────────────────────────────────────────────┤
│ 📊 Overview          │ 🤖 LLM Provider Settings                                        │
│                      │ Configure model backends, API credentials, and sampling params. │
│ AI & ML              ├─────────────────────────────────────────────────────────────────┤
│ 🤖 LLM Provider      │ Provider: [ OpenAI             ▼ ]                              │
│ 📚 RAG Configuration │ Model:    [ gpt-4o             ▼ ]                              │
│ 🪿 Goose Agent       │ API Key:  [ sk-proj-•••••••••• ] [Reveal]                       │
│                      │ Base URL: [ https://api.openai.com/v1 ]                         │
│ DEVELOPMENT          │ Temperature: [──●────] 0.7   Max Tokens: [ 4096 ]              │
│ 🐙 Source Control    ├─────────────────────────────────────────────────────────────────┤
│ 🧪 Test Runner       │ [⚡ Test Connection]  ──> (✓ Connected: latency 142ms)          │
│                      │                                                                 │
│ TRACKING & APPS      │ Advanced Parameters (Collapsible)                               │
│ 🎫 Ticketing (Jira)  │ [x] Stream responses  [ ] Enable function calling caching        │
│ 💬 Integrations      │                                                                 │
└──────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 3. Configuration Areas & Conditional Logic

| Section | Providers / Engines | Dynamic Fields & Capabilities |
| :--- | :--- | :--- |
| **Overview** | Unified Project Health | Project metadata, active services summary, connection health status matrix, quick actions, export/import JSON config. |
| **LLM Provider** | `OpenAI`, `Anthropic`, `Google Gemini`, `Azure OpenAI` | **OpenAI**: Model, API Key, Org ID, Base URL, Temp, Max Tokens.<br>**Anthropic**: Model (`claude-3-7-sonnet`), API Key, Anthropic Version, Temp.<br>**Google**: Model (`gemini-2.5-pro`), API Key, Project ID, Region.<br>**Azure**: Endpoint, Deployment ID, API Version, Resource Name, API Key. |
| **Ticketing** | `Jira`, `Linear` | **Jira**: Instance URL, Project Key, Issue Type, Custom Fields, **Editable Status Mapping Matrix** (Jira Status ↔ Internal Status).<br>**Linear**: Workspace URL, Team ID, Project ID, Default Labels, Webhook Secret. |
| **Source Control** | `GitHub`, `GitLab`, `Bitbucket` | **GitHub**: Org, Repository, Default Branch, PR Target, Webhook URL, App/PAT Token, Trigger Actions (Push, PR review).<br>**GitLab / Bitbucket**: Self-hosted URL / Cloud, Group, Project, CI/CD pipeline token. |
| **RAG** | Embeddings + Vector DBs | **Document Source**: File paths, include/exclude glob patterns.<br>**Chunking**: Chunk Size slider (100–4000), Chunk Overlap slider.<br>**Embeddings**: Provider (OpenAI `text-embedding-3-large`, Voyage, HuggingFace), Dimensions.<br>**Vector DB**: `Pinecone` (Index, Env, API Key), `Qdrant` (URL, Collection, API Key), `pgvector` (Host, Port, DB, Table), `Weaviate` (Cluster URL, API Key). |
| **Test Runner** | `Vitest`, `Jest`, `Playwright`, `Cypress`, `Pytest` | Config file path, test match globs, timeout (ms), headless toggle, parallel workers count, reporter output format (SonarQube XML / JUnit). |
| **Goose Agent** | `Goose Engine` | Underlying Provider/Model, Tool Executables (`bash`, `git`, `python`), Autonomy Mode (Read-Only vs Full-Write), Approval Prompts, Working Dir Sandbox, Max Iterations. |
| **Integrations** | `Slack`, `Microsoft Teams` | **Slack**: Webhook URL, Bot Token, Alert Channel, Event Triggers (Build failure, Security alert, QA gate passed).<br>**Teams**: Webhook URL, Tenant ID, Channel Name, Adaptive Card template toggle. |

---

## 4. Proposed File Structure & Implementation

```
UI_demo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── config.ts                     # TypeScript definitions for complete config state
    ├── context/
    │   └── ConfigContext.tsx             # Global config store, dirty state tracking, undo/reset
    ├── styles/
    │   └── index.css                     # SonarQube-inspired modern clean styling & tokens
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx              # Main layout wrapper
    │   │   ├── Sidebar.tsx               # Collapsible navigation with category grouping & search
    │   │   ├── TopBar.tsx                # Breadcrumbs, project switcher, dirty indicator, actions
    │   │   └── Toast.tsx                 # Notification alerts (saved, connection tested, errors)
    │   └── common/
    │       ├── FormField.tsx             # Labeled field wrapper with tooltip, help text & error
    │       ├── SelectField.tsx           # Dropdown with icons & search
    │       ├── SecretField.tsx           # Masked password/API-key input with toggle eye & copy
    │       ├── Toggle.tsx                # Sonar-styled switch toggle
    │       ├── StatusBadge.tsx           # Colored status pill (Connected, Warning, Error, Idle)
    │       ├── ConnectionTest.tsx        # Simulated connection test runner with latency & logs
    │       └── StatusMappingTable.tsx    # Interactive status/field mapper with add/remove rows
    └── sections/
        ├── OverviewSection.tsx           # Health cards, active providers summary, JSON export/import
        ├── LLMProviderSection.tsx        # Dynamic OpenAI / Anthropic / Google / Azure forms
        ├── TicketingSection.tsx          # Dynamic Jira / Linear configuration & status mapper
        ├── SourceControlSection.tsx      # Dynamic GitHub / GitLab / Bitbucket configuration
        ├── RAGSection.tsx                # Chunking, Embeddings, and Pinecone/Qdrant/pgvector/Weaviate
        ├── TestRunnerSection.tsx         # Vitest / Jest / Playwright / Cypress / Pytest setup
        ├── GooseSection.tsx              # Goose agent tool permissions & autonomy configuration
        └── IntegrationsSection.tsx       # Slack & Teams notification channels & routing
```

---

## 5. Key File Details & Code Architecture

### 1. Unified Types: [src/types/config.ts](file:///c:/Users/srirag.cr/Desktop/UI_Demo_Astra/UI_demo/src/types/config.ts)
```typescript
export type SectionId = 
  | 'overview' 
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

export interface AppConfigState {
  projectName: string;
  projectKey: string;
  environment: 'development' | 'staging' | 'production';
  llm: {
    provider: LLMProviderType;
    openai: { model: string; apiKey: string; baseUrl: string; temperature: number; maxTokens: number };
    anthropic: { model: string; apiKey: string; baseUrl: string; temperature: number; maxTokens: number };
    google: { model: string; apiKey: string; projectId: string; region: string; temperature: number; maxTokens: number };
    azure: { endpoint: string; deploymentId: string; apiVersion: string; apiKey: string; model: string; temperature: number; maxTokens: number };
  };
  ticketing: {
    provider: TicketingProviderType;
    jira: { url: string; projectKey: string; issueType: string; statusMappings: Array<{ remote: string; local: string }> };
    linear: { workspace: string; teamKey: string; defaultLabels: string[] };
  };
  sourceControl: {
    provider: SCMProviderType;
    github: { org: string; repo: string; defaultBranch: string; prAutoReview: boolean; webhookSecret: string };
    gitlab: { hostUrl: string; projectPath: string; defaultBranch: string };
    bitbucket: { workspace: string; repoSlug: string; defaultBranch: string };
  };
  rag: {
    documentPath: string;
    fileExtensions: string[];
    chunkSize: number;
    chunkOverlap: number;
    embeddingProvider: string;
    vectorDb: VectorDBType;
    pinecone: { apiKey: string; environment: string; indexName: string };
    qdrant: { url: string; collectionName: string; apiKey: string };
    pgvector: { connectionString: string; tableName: string };
    weaviate: { clusterUrl: string; apiKey: string; className: string };
  };
  testRunner: {
    runner: TestRunnerType;
    configPath: string;
    testGlob: string;
    timeoutMs: number;
    parallelWorkers: number;
    exportSonarXml: boolean;
  };
  goose: {
    provider: LLMProviderType;
    model: string;
    autonomyLevel: 'suggest' | 'semi-autonomous' | 'full-autonomous';
    allowedTools: string[];
    sandboxDirectory: string;
    maxIterations: number;
  };
  integrations: {
    slack: { enabled: boolean; webhookUrl: string; channel: string; notifyOnFailure: boolean };
    teams: { enabled: boolean; webhookUrl: string; notifyOnFailure: boolean };
  };
}
```

### 2. State & Persistence: [src/context/ConfigContext.tsx](file:///c:/Users/srirag.cr/Desktop/UI_Demo_Astra/UI_demo/src/context/ConfigContext.tsx)
- Provides `config`, `updateConfig(section, partialState)`, `isDirty`, `saveConfig()`, `discardChanges()`, `exportConfig()`, `importConfig()`.
- Supports `localStorage` auto-sync so changes survive page refreshes.
- Manages connection testing statuses per provider with simulated realistic ping times and error toggling.

### 3. SonarQube Visual Styling: [src/styles/index.css](file:///c:/Users/srirag.cr/Desktop/UI_Demo_Astra/UI_demo/src/styles/index.css) & Tailwind
- Crisp slate background (`bg-[#f4f5f7]` or dark mode `bg-[#111827]`), pure white or navy cards, high-contrast borders (`border-slate-200` / `border-slate-700`).
- Sonar-like status pills: Passed (emerald green), Failed (rose red), Warn (amber), Idle (slate).
- Code snippets / JSON Preview Drawer showing real-time generated `.env` or `config.yaml` from active UI state.

---

## 6. End-to-End Workflow & Example

### Before Implementation:
- Empty folder, no interactive UI, manual vector mockup creation in Figma is slow and detached from real code behavior.

### After Implementation:
1. Run `npm run dev` in `c:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo`.
2. Open `http://localhost:5173` in the browser.
3. **Example Walkthrough in the Application**:
   - User opens the **LLM Provider** tab: selects `OpenAI` → inputs API Key → clicks **Test Connection** → gets instant green checkmark `Connected (114ms)`.
   - User switches dropdown to `Azure OpenAI` → form instantly morphs to show `Endpoint`, `Deployment ID`, `API Version` without losing other settings.
   - User clicks **RAG**: changes Vector DB from `Pinecone` to `Qdrant` → shows `Collection Name` and `Qdrant URL` inputs.
   - User clicks **Ticketing**: views Jira Status Mapping table (`To Do -> Backlog`, `In Progress -> In Progress`, `Done -> Completed`) and clicks `+ Add Row` to map a custom status.
   - User clicks **Save Changes** in TopBar → header pill turns green with timestamp "Last saved 10:02 AM".
   - User clicks **Inspect Generated Config** to view generated JSON/YAML representation.
4. **Exporting to Figma**:
   - Open Figma Desktop / Web.
   - Use the **Figma Chrome Extension** or **Figma Code to Canvas** on `http://localhost:5173` to snapshot the rendered states (Overview, OpenAI, Azure, Jira, RAG, Integrations) directly onto Figma canvas as clean, editable Auto-Layout frames.

---

## 7. Verification Plan

### Automated Build Verification
```powershell
npm run build
```
- Validates that TypeScript compiles with zero type errors and Vite bundles assets cleanly.

### Manual Interaction Verification
1. Verify sidebar routing switches each of the 8 panels smoothly.
2. Verify all provider dropdowns (LLM, Ticketing, SCM, Vector DB, Test Runner) update the displayed form fields immediately.
3. Verify SecretField eye icon toggles masking on and off.
4. Verify ConnectionTest button triggers loading spinner -> success state.
5. Verify StatusMappingTable allows adding, editing, and deleting mapping pairs.
6. Verify Save button saves changes and clears the "Unsaved changes" badge.
