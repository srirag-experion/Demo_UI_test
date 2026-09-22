import React, { useState } from 'react';
import {
  Database,
  Zap,
  BookOpen,
  RefreshCw,
  FolderGit2,
  AlertTriangle,
  Sparkles,
  LayoutGrid,
  Cpu,
  Network,
  Terminal,
  Activity,
  GitBranch,
  CheckCircle2,
  Clock,
  HardDrive,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useConfig } from '../../src/context/ConfigContext';
import { PROJECT_CODEBASE_MEMORIES } from './projectMemories';
import { ProjectCodebaseMemory } from './types';
import { CelestialMemoryGraph } from './CelestialMemoryGraph';
import { GraphCanvas } from './GraphCanvas';
import { SchemaViewer } from './SchemaViewer';
import { ImpactRadiusViewer } from './ImpactRadiusViewer';
import { MemoryRulesPanel } from './MemoryRulesPanel';
import { MCPToolsPanel } from './MCPToolsPanel';
import { ArchitectureOverview } from './ArchitectureOverview';

const MCP_API_URL = 'http://localhost:8765';

type ViewMode =
  | 'galaxy3d'
  | 'architecture'
  | 'graph2d'
  | 'schema'
  | 'impact'
  | 'mcp_tools'
  | 'rules';

export const CodeGraphSection: React.FC = () => {
  const { activeProjectId, showToast } = useConfig();
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy3d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const emptyMemory = (): ProjectCodebaseMemory => ({
    projectId: activeProjectId,
    repoUrl: '',
    branch: 'main',
    lastParsedAt: 'Not scanned yet',
    totalFiles: 0,
    totalSymbols: 0,
    nodes: [],
    edges: [],
    schemas: [],
    rules: [],
  });

  const seedMemory = (projId: string): ProjectCodebaseMemory =>
    PROJECT_CODEBASE_MEMORIES[projId] ?? emptyMemory();

  const [currentRepoUrl, setCurrentRepoUrl] = useState(
    () => seedMemory(activeProjectId).repoUrl
  );
  const [scannedMemory, setScannedMemory] = useState<ProjectCodebaseMemory>(
    () => seedMemory(activeProjectId)
  );
  const [hasScanned, setHasScanned] = useState(
    () => (PROJECT_CODEBASE_MEMORIES[activeProjectId]?.totalFiles ?? 0) > 0
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [authType, setAuthType] = useState<'pat' | 'ssh' | 'app'>('pat');
  const [patToken, setPatToken] = useState('');
  const [branch, setBranch] = useState('main');
  const [showAuthSettings, setShowAuthSettings] = useState(false);

  React.useEffect(() => {
    const mem = seedMemory(activeProjectId);
    setCurrentRepoUrl(mem.repoUrl);
    setScannedMemory(mem);
    setHasScanned((PROJECT_CODEBASE_MEMORIES[activeProjectId]?.totalFiles ?? 0) > 0);
    setBackendError(null);
  }, [activeProjectId]);

  const memory = scannedMemory;

  const handleRefresh = async () => {
    if (!currentRepoUrl || currentRepoUrl.trim() === '') {
      showToast('error', 'No Repository Entered', 'Please enter a Git URL or local folder path before scanning.');
      return;
    }
    setIsRefreshing(true);
    setBackendError(null);

    try {
      const health = await fetch(`${MCP_API_URL}/health`, { signal: AbortSignal.timeout(3000) });
      if (!health.ok) throw new Error('MCP server not reachable');

      const res = await fetch(`${MCP_API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_path: currentRepoUrl.trim(),
          branch: branch || 'main',
          auth_token: isPrivate && authType === 'pat' ? patToken : null,
          project_id: activeProjectId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Scan failed on server');
      }

      const finalMem: ProjectCodebaseMemory = {
        projectId: activeProjectId,
        repoUrl: currentRepoUrl,
        branch: branch || 'main',
        lastParsedAt: 'Just now (Synced)',
        totalFiles: data.totalFiles,
        totalSymbols: data.totalSymbols,
        nodes: data.nodes,
        edges: data.edges,
        schemas: data.schemas,
        rules: scannedMemory.rules,
        node_types_count: data.node_types_count,
        edge_types_count: data.edge_types_count,
        dir_counts: data.dir_counts,
      };

      PROJECT_CODEBASE_MEMORIES[activeProjectId] = finalMem;
      setScannedMemory(finalMem);
      setHasScanned(true);
      showToast(
        'success',
        `Repository Indexed: ${activeProjectId}`,
        `${data.nodes?.length || data.totalSymbols} nodes & ${data.edges?.length || 0} edges mapped in 3D memory sphere`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isOffline =
        msg.includes('fetch') || msg.includes('reachable') || msg.includes('timeout') || msg.includes('Failed');
      if (isOffline) {
        setBackendError('Python MCP server is not running. Start it with: python server.py');
        showToast('error', 'MCP Server Offline', 'Run: python server.py in codegraph/mcp_server/');
      } else {
        setBackendError(msg);
        showToast('error', 'Scan Failed', msg);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRepoDisplayName = () => {
    if (!currentRepoUrl) return activeProjectId;
    const parts = currentRepoUrl.replace(/\\/g, '/').split('/').filter(Boolean);
    return parts[parts.length - 1]?.replace('.git', '') || activeProjectId;
  };

  const tabDefs: Array<{
    id: ViewMode;
    label: string;
    icon: React.ReactNode;
    iconActive: string;
    badge?: string | number;
  }> = [
    {
      id: 'galaxy3d',
      label: '3D Celestial Galaxy',
      icon: <Sparkles size={14} />,
      iconActive: 'text-cyan-500',
    },
    {
      id: 'architecture',
      label: 'Architecture Overview',
      icon: <Network size={14} />,
      iconActive: 'text-blue-500',
    },
    {
      id: 'graph2d',
      label: '2D Multi-Lane Canvases',
      icon: <LayoutGrid size={14} />,
      iconActive: 'text-lime-600',
    },
    {
      id: 'schema',
      label: 'Schemas & Models',
      icon: <Database size={14} />,
      iconActive: 'text-amber-500',
      badge: memory.schemas.length,
    },
    {
      id: 'impact',
      label: 'Impact Blast-Radius',
      icon: <Zap size={14} />,
      iconActive: 'text-rose-500',
    },
    {
      id: 'mcp_tools',
      label: 'MCP Tools & CLI',
      icon: <Terminal size={14} />,
      iconActive: 'text-slate-400',
      badge: '17',
    },
    {
      id: 'rules',
      label: 'Architectural Rules',
      icon: <BookOpen size={14} />,
      iconActive: 'text-blue-500',
      badge: memory.rules.length,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Codebase Memory & Graph</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/50">
              {activeProjectId}
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-900 text-lime-400 rounded-full border border-slate-700">
              codebase-memory-mcp v0.11.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            RAM-first AST indexer · 66+ language Tree-sitter grammars · 17 MCP tools · Persistent knowledge graph
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-lime-600' : ''} />
            <span>Re-Index AST</span>
          </button>
        </div>
      </div>

      {/* ── Capability Quick-Stats Banner ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {[
          {
            label: 'Files Indexed',
            value: memory.totalFiles || 0,
            icon: <HardDrive size={13} className="text-slate-500" />,
            color: 'text-slate-900',
          },
          {
            label: 'Nodes / Symbols',
            value: memory.nodes.length || memory.totalSymbols || 0,
            icon: <Layers size={13} className="text-lime-600" />,
            color: 'text-lime-700',
          },
          {
            label: 'Edges',
            value: memory.edges.length || 0,
            icon: <GitBranch size={13} className="text-blue-600" />,
            color: 'text-blue-700',
          },
          {
            label: 'Schemas',
            value: memory.schemas.length || 0,
            icon: <Database size={13} className="text-amber-600" />,
            color: 'text-amber-700',
          },
          {
            label: 'Rules',
            value: memory.rules.length || 0,
            icon: <BookOpen size={13} className="text-purple-600" />,
            color: 'text-purple-700',
          },
          {
            label: 'MCP Tools',
            value: 17,
            icon: <Terminal size={13} className="text-slate-600" />,
            color: 'text-slate-700',
          },
          {
            label: 'Last Scanned',
            value: memory.lastParsedAt?.replace(' (Synced)', '') || '—',
            icon: <Clock size={13} className="text-slate-400" />,
            color: 'text-slate-600',
            isText: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {stat.icon}
              <span>{stat.label}</span>
            </div>
            <div className={`text-sm font-extrabold font-mono truncate ${stat.color}`}>
              {String(stat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Repo Input Card ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2.5 bg-[#edf8c7] rounded-xl text-[#65a30d] shrink-0">
              <FolderGit2 size={18} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Target Repository / Codebase</span>
                  <span className="text-[10px] text-slate-400 font-normal">({memory.lastParsedAt})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => {
                        setIsPrivate(e.target.checked);
                        if (e.target.checked) setShowAuthSettings(true);
                      }}
                      className="rounded border-slate-300 text-lime-600 focus:ring-lime-500 w-3.5 h-3.5"
                    />
                    <span>Private Repository</span>
                  </label>
                  {isPrivate && (
                    <button
                      type="button"
                      onClick={() => setShowAuthSettings(!showAuthSettings)}
                      className="text-[11px] font-semibold text-[#65a30d] hover:underline cursor-pointer"
                    >
                      {showAuthSettings ? 'Hide Auth ▲' : 'Configure Auth ▼'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={currentRepoUrl}
                    onChange={(e) => setCurrentRepoUrl(e.target.value)}
                    placeholder={
                      isPrivate
                        ? 'e.g. https://github.com/my-org/private-repo.git or git@github.com:org/repo.git'
                        : 'e.g. https://github.com/org/repo or C:/path/to/local/repo'
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500"
                  />
                </div>

                <div className="w-28 shrink-0">
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="branch (main)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-[#94d320] hover:bg-[#84cc16] rounded-lg transition shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Scanning...' : 'Scan & Visualize'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Engine Status Badge */}
          <div className="shrink-0 flex flex-col items-center gap-1 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Activity size={11} className="text-lime-500" />
              <span>Engine Status</span>
            </div>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-lime-500" />
                <span>Tree-sitter: 66+ langs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-lime-500" />
                <span>LZ4 RAM pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-lime-500" />
                <span>SQLite knowledge graph</span>
              </div>
            </div>
          </div>
        </div>

        {/* Private Repo Auth Drawer */}
        {isPrivate && showAuthSettings && (
          <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 mt-2 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-800">🔐 Private Repository Authentication</span>
              <div className="flex items-center space-x-2 text-xs">
                {(['pat', 'ssh', 'app'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAuthType(type)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      authType === type
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'pat' && 'PAT Token'}
                    {type === 'ssh' && 'SSH Key'}
                    {type === 'app' && 'GitHub App'}
                  </button>
                ))}
              </div>
            </div>

            {authType === 'pat' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Required scopes: <code className="bg-slate-100 px-1 rounded text-slate-700">repo (read:repo)</code>
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Username / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. octocat or my-org"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Capabilities Feature Ribbon ─────────────────────────────── */}
      {!hasScanned && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: <Cpu size={18} className="text-lime-600" />,
              bg: 'bg-lime-50 border-lime-200',
              title: 'Lightning AST Indexing',
              desc: 'RAM-first LZ4 pipeline indexes the Linux kernel in ~3 min',
            },
            {
              icon: <Network size={18} className="text-blue-600" />,
              bg: 'bg-blue-50 border-blue-200',
              title: '66+ Language Parsing',
              desc: 'Tree-sitter grammars for TypeScript, Python, Go, Rust, Java and 60+ more',
            },
            {
              icon: <Database size={18} className="text-amber-600" />,
              bg: 'bg-amber-50 border-amber-200',
              title: 'Persistent Knowledge Graph',
              desc: 'SQLite graph survives IDE restarts and context compaction',
            },
            {
              icon: <Sparkles size={18} className="text-purple-600" />,
              bg: 'bg-purple-50 border-purple-200',
              title: '~120x Token Efficiency',
              desc: 'LLMs query symbol outlines, not 50 full files. 10x faster AI responses',
            },
          ].map((feat) => (
            <div key={feat.title} className={`border rounded-2xl p-4 space-y-2 ${feat.bg}`}>
              <div className="p-2 bg-white/80 rounded-xl w-fit shadow-2xs">{feat.icon}</div>
              <div className="text-xs font-bold text-slate-900">{feat.title}</div>
              <div className="text-[11px] text-slate-600 leading-relaxed">{feat.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Mode Navigation Tabs ───────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs select-none flex-wrap">
        {tabDefs.map((tab) => {
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className={isActive ? tab.iconActive : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== 0 && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 rounded-full ${
                    isActive ? 'bg-slate-100 text-slate-700' : 'bg-slate-300/60 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Backend Error Banner ─────────────────────────────────────── */}
      {backendError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">MCP Server Error</span>
            <span className="font-mono">{backendError}</span>
          </div>
        </div>
      )}

      {/* ── Render Active View ───────────────────────────────────────── */}
      {viewMode === 'mcp_tools' ? (
        <MCPToolsPanel />
      ) : isRefreshing ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200/80 rounded-2xl gap-3">
          <RefreshCw size={24} className="animate-spin text-[#94d320]" />
          <p className="text-sm font-semibold text-slate-700">Scanning repository — building AST knowledge graph…</p>
          <p className="text-xs text-slate-400 font-mono">{currentRepoUrl}</p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-lime-500" /> Invoking native binary</span>
            <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin text-lime-500" /> Parsing AST nodes</span>
            <span className="flex items-center gap-1"><Activity size={10} className="text-slate-300" /> Building edges</span>
          </div>
        </div>
      ) : !hasScanned ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center justify-center h-48 bg-white border border-dashed border-slate-300 rounded-2xl gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-[#edf8c7] flex items-center justify-center text-2xl">⚡</div>
            <h3 className="text-sm font-bold text-slate-800">No Repository Indexed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Enter a <span className="font-semibold text-slate-700">local folder path</span> or GitHub URL above, then click{' '}
              <span className="font-semibold text-slate-700">Scan & Visualize</span>.
              The native codebase-memory-mcp binary will index the AST in seconds.
            </p>
          </div>

          {/* Capability Cards while waiting */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={13} className="text-lime-600" />
              <span>What you'll get after scanning</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: '🌌', title: '3D Celestial Graph', desc: 'Interactive force-directed knowledge sphere with clustering' },
                { icon: '🏛️', title: 'Architecture Layers', desc: '5-layer canvas: API → Services → Models → Utils → Files' },
                { icon: '🗺️', title: 'Multi-Lane Canvases', desc: 'Separate isolated canvas board per architectural layer' },
                { icon: '⚡', title: 'Blast-Radius Analysis', desc: 'Identifies upstream callers & mandatory tests for any file' },
                { icon: '📐', title: 'Schema Extraction', desc: 'Auto-extracts Pydantic, SQLAlchemy & TypeScript types' },
                { icon: '🔧', title: '17 MCP CLI Tools', desc: 'search_graph, trace_path, detect_changes, query_graph & 13 more' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'galaxy3d' && (
            <CelestialMemoryGraph
              nodes={memory.nodes}
              edges={memory.edges}
              nodeTypesCount={memory.node_types_count}
              edgeTypesCount={memory.edge_types_count}
              dirCounts={memory.dir_counts}
              repoName={getRepoDisplayName()}
              onRefresh={handleRefresh}
            />
          )}

          {viewMode === 'architecture' && (
            <ArchitectureOverview
              nodes={memory.nodes}
              edges={memory.edges}
              repoName={getRepoDisplayName()}
              nodeTypesCount={memory.node_types_count}
              edgeTypesCount={memory.edge_types_count}
              dirCounts={memory.dir_counts}
            />
          )}

          {viewMode === 'graph2d' && (
            <GraphCanvas nodes={memory.nodes} edges={memory.edges} />
          )}

          {viewMode === 'schema' && (
            <SchemaViewer schemas={memory.schemas} />
          )}

          {viewMode === 'impact' && (
            <ImpactRadiusViewer nodes={memory.nodes} edges={memory.edges} />
          )}

          {viewMode === 'rules' && (
            <MemoryRulesPanel rules={memory.rules} />
          )}
        </>
      )}
    </div>
  );
};
