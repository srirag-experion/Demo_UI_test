import React, { useState } from 'react';
import { Database, Zap, BookOpen, RefreshCw, FolderGit2, AlertTriangle, Sparkles, LayoutGrid } from 'lucide-react';
import { useConfig } from '../../src/context/ConfigContext';
import { PROJECT_CODEBASE_MEMORIES } from './projectMemories';
import { ProjectCodebaseMemory } from './types';
import { CelestialMemoryGraph } from './CelestialMemoryGraph';
import { GraphCanvas } from './GraphCanvas';
import { SchemaViewer } from './SchemaViewer';
import { ImpactRadiusViewer } from './ImpactRadiusViewer';
import { MemoryRulesPanel } from './MemoryRulesPanel';

const MCP_API_URL = 'http://localhost:8765';

type ViewMode = 'galaxy3d' | 'graph2d' | 'schema' | 'impact' | 'rules';

export const CodeGraphSection: React.FC = () => {
  const { activeProjectId, showToast } = useConfig();
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy3d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Empty memory for unseeded state
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

  // Seed from demo data for known projects; empty for new ones
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

  // Switch project → reset view
  React.useEffect(() => {
    const mem = seedMemory(activeProjectId);
    setCurrentRepoUrl(mem.repoUrl);
    setScannedMemory(mem);
    setHasScanned((PROJECT_CODEBASE_MEMORIES[activeProjectId]?.totalFiles ?? 0) > 0);
    setBackendError(null);
  }, [activeProjectId]);

  const memory = scannedMemory;

  // ── Real scan: calls Python FastAPI server ──────────────────────
  const handleRefresh = async () => {
    if (!currentRepoUrl || currentRepoUrl.trim() === '') {
      showToast('error', 'No Repository Entered', 'Please enter a Git URL or local folder path before scanning.');
      return;
    }
    setIsRefreshing(true);
    setBackendError(null);

    try {
      // Check if the Python server is reachable first
      const health = await fetch(`${MCP_API_URL}/health`, { signal: AbortSignal.timeout(3000) });
      if (!health.ok) throw new Error('MCP server not reachable');

      // Call the real AST scan endpoint
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
      const isOffline = msg.includes('fetch') || msg.includes('reachable') || msg.includes('timeout') || msg.includes('Failed');
      if (isOffline) {
        setBackendError('Python MCP server is not running. Start it in Terminal 2 with: python server.py');
        showToast('error', 'MCP Server Offline', 'Run: python server.py in codegraph/mcp_server/ to enable live scanning.');
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Project Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Codebase Memory & Graph</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#edf8c7] text-slate-800 rounded-full border border-[#94d320]/50">
              {activeProjectId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            3D Force-Directed Celestial Knowledge Sphere, caller-callee chains, schemas, and learned memory
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* Project Repository Input & Status Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2.5 bg-[#edf8c7] rounded-xl text-[#65a30d] shrink-0">
              <FolderGit2 size={18} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
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
                      {showAuthSettings ? 'Hide Credentials ▲' : 'Configure Auth ▼'}
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
                        : 'e.g. https://github.com/org/repo or C:/path/to/repo'
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500"
                  />
                </div>

                {/* Branch Input */}
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

          {/* Stats */}
          <div className="flex items-center space-x-4 shrink-0 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Files Indexed</div>
              <div className="text-sm font-extrabold text-slate-800 font-mono">{memory.totalFiles}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Nodes / Symbols</div>
              <div className="text-sm font-extrabold text-[#65a30d] font-mono">{memory.nodes.length || memory.totalSymbols}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Edges</div>
              <div className="text-sm font-extrabold text-slate-800 font-mono">{memory.edges.length}</div>
            </div>
          </div>
        </div>

        {/* Private Repo Auth Drawer */}
        {isPrivate && showAuthSettings && (
          <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 mt-2 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🔐 Private Repository Authentication Credentials</span>
              </span>
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
                    {type === 'pat' && 'Personal Access Token (PAT)'}
                    {type === 'ssh' && 'SSH Private Key'}
                    {type === 'app' && 'GitHub App / OAuth'}
                  </button>
                ))}
              </div>
            </div>

            {authType === 'pat' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    GitHub / GitLab Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or glpat-xxxxxxxxxxxx"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Required scopes: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">repo (read:repo)</code>
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Username / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. octocat or my-org"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for basic auth / token header.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit text-xs select-none">
        <button
          type="button"
          onClick={() => setViewMode('galaxy3d')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            viewMode === 'galaxy3d'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles size={14} className={viewMode === 'galaxy3d' ? 'text-[#00f5ff]' : ''} />
          <span>3D Celestial Galaxy</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('graph2d')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            viewMode === 'graph2d'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid size={14} className={viewMode === 'graph2d' ? 'text-[#84cc16]' : ''} />
          <span>2D Architecture Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('schema')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            viewMode === 'schema'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database size={14} className={viewMode === 'schema' ? 'text-amber-500' : ''} />
          <span>Data Structures & Schemas ({memory.schemas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('impact')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            viewMode === 'impact'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap size={14} className={viewMode === 'impact' ? 'text-rose-500' : ''} />
          <span>Impact Blast-Radius</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('rules')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            viewMode === 'rules'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={14} className={viewMode === 'rules' ? 'text-blue-500' : ''} />
          <span>Architectural Rules ({memory.rules.length})</span>
        </button>
      </div>

      {/* Backend error banner */}
      {backendError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">MCP Server Error</span>
            <span className="font-mono">{backendError}</span>
          </div>
        </div>
      )}

      {/* Render Active View */}
      {isRefreshing ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200/80 rounded-2xl gap-3">
          <RefreshCw size={24} className="animate-spin text-[#94d320]" />
          <p className="text-sm font-semibold text-slate-700">Scanning repository and building AST graph…</p>
          <p className="text-xs text-slate-400 font-mono">{currentRepoUrl}</p>
        </div>
      ) : !hasScanned ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#edf8c7] flex items-center justify-center text-2xl">⚡</div>
          <h3 className="text-sm font-bold text-slate-800">No Repository Indexed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Enter a <span className="font-semibold text-slate-700">local folder path</span> (e.g.{' '}
            <code className="bg-slate-100 px-1 rounded text-slate-700 font-mono text-[10px]">C:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo</code>) above, then click{' '}
            <span className="font-semibold text-slate-700">Scan & Visualize</span>.
            Make sure the Python MCP server is running in Terminal 2.
          </p>
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
          {viewMode === 'graph2d' && <GraphCanvas nodes={memory.nodes} edges={memory.edges} />}
          {viewMode === 'schema' && <SchemaViewer schemas={memory.schemas} />}
          {viewMode === 'impact' && <ImpactRadiusViewer nodes={memory.nodes} edges={memory.edges} />}
          {viewMode === 'rules' && <MemoryRulesPanel rules={memory.rules} />}
        </>
      )}
    </div>
  );
};

