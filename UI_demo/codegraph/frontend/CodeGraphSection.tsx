import React, { useState } from 'react';
import { Network, Database, Zap, BookOpen, RefreshCw, FolderGit2 } from 'lucide-react';
import { useConfig } from '../../src/context/ConfigContext';
import { PROJECT_CODEBASE_MEMORIES } from './projectMemories';
import { GraphCanvas } from './GraphCanvas';
import { SchemaViewer } from './SchemaViewer';
import { ImpactRadiusViewer } from './ImpactRadiusViewer';
import { MemoryRulesPanel } from './MemoryRulesPanel';

type ViewMode = 'graph' | 'schema' | 'impact' | 'rules';

export const CodeGraphSection: React.FC = () => {
  const { activeProjectId, showToast } = useConfig();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load project-specific codebase memory
  const initialMemory = PROJECT_CODEBASE_MEMORIES[activeProjectId] || PROJECT_CODEBASE_MEMORIES['ASTRA-CORE'];
  const [currentRepoUrl, setCurrentRepoUrl] = useState(initialMemory.repoUrl);

  const [isPrivate, setIsPrivate] = useState(false);
  const [authType, setAuthType] = useState<'pat' | 'ssh' | 'app'>('pat');
  const [patToken, setPatToken] = useState('');
  const [sshKey, setSshKey] = useState('');
  const [branch, setBranch] = useState('main');
  const [showAuthSettings, setShowAuthSettings] = useState(false);

  // Sync state when activeProjectId changes
  React.useEffect(() => {
    const mem = PROJECT_CODEBASE_MEMORIES[activeProjectId] || PROJECT_CODEBASE_MEMORIES['ASTRA-CORE'];
    setCurrentRepoUrl(mem.repoUrl);
  }, [activeProjectId]);

  const memory = {
    ...initialMemory,
    repoUrl: currentRepoUrl,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      PROJECT_CODEBASE_MEMORIES[activeProjectId] = {
        ...initialMemory,
        repoUrl: currentRepoUrl,
        lastParsedAt: 'Just now (Synced)',
      };
      showToast(
        'success',
        `Repository Parsed: ${activeProjectId}`,
        `AST code graph generated${isPrivate ? ' using private credentials' : ''} for branch [${branch}]`
      );
    }, 900);
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
            Visual structure of code entities, caller-callee chains, data schemas, and learned architectural memory
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
              <div className="text-[10px] uppercase font-bold text-slate-400">Symbols & Types</div>
              <div className="text-sm font-extrabold text-[#65a30d] font-mono">{memory.totalSymbols}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Rules Active</div>
              <div className="text-sm font-extrabold text-slate-800 font-mono">{memory.rules.length}</div>
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

            {authType === 'ssh' && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">SSH Private Key</label>
                <textarea
                  rows={3}
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg p-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none resize-none"
                />
              </div>
            )}

            {authType === 'app' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">GitHub App ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Installation ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 98765432"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
                  />
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
          onClick={() => setViewMode('graph')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition ${
            viewMode === 'graph'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Network size={14} className={viewMode === 'graph' ? 'text-[#84cc16]' : ''} />
          <span>Code Call Graph</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('schema')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition ${
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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition ${
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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition ${
            viewMode === 'rules'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={14} className={viewMode === 'rules' ? 'text-blue-500' : ''} />
          <span>Architectural Rules ({memory.rules.length})</span>
        </button>
      </div>

      {/* Render Active View */}
      {viewMode === 'graph' && <GraphCanvas nodes={memory.nodes} edges={memory.edges} />}
      {viewMode === 'schema' && <SchemaViewer schemas={memory.schemas} />}
      {viewMode === 'impact' && <ImpactRadiusViewer nodes={memory.nodes} />}
      {viewMode === 'rules' && <MemoryRulesPanel rules={memory.rules} />}
    </div>
  );
};
