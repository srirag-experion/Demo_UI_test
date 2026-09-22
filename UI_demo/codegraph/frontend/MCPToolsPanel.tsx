import React, { useState } from 'react';
import {
  Terminal,
  Search,
  GitBranch,
  Database,
  Cpu,
  Zap,
  Code2,
  FileSearch,
  GitCompare,
  Trash2,
  Activity,
  CheckCircle2,
  Network,
  FolderGit2,
  BookOpen,
  Radio,
  Play,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'index' | 'query' | 'analysis' | 'management' | 'trace';
  exampleCmd: string;
  exampleOutput: string;
  badge?: string;
}

const MCP_TOOLS: MCPTool[] = [
  {
    id: 'index_repository',
    name: 'index_repository',
    description: 'Fast AST scanner using RAM-first LZ4 pipeline. Indexes entire codebases in seconds.',
    icon: <Cpu size={15} className="text-lime-600" />,
    category: 'index',
    exampleCmd: 'codebase-memory-mcp cli index_repository --repo-path "C:\\Users\\srirag.cr\\Desktop\\UI_Demo_Astra\\UI_demo"',
    exampleOutput: '{"status":"indexed","nodes":565,"edges":433,"files":6419,"time":"2.8s","languages":["TypeScript","Python"]}',
    badge: 'Core',
  },
  {
    id: 'get_architecture',
    name: 'get_architecture',
    description: 'Returns project entry points, packages, route handlers, and architectural layer overview.',
    icon: <Network size={15} className="text-blue-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli get_architecture --project "C-Users-srirag.cr-Desktop-UI_Demo_Astra-UI_demo"',
    exampleOutput: '{"languages":["TypeScript (34 files)","Python (6 files)"],"entry_points":["App.tsx","server.py"],"packages":["fastapi","three","react","pydantic"]}',
    badge: 'Popular',
  },
  {
    id: 'search_graph',
    name: 'search_graph',
    description: 'Instant fuzzy symbol search across 65+ language parsers. Returns node IDs, types and edges.',
    icon: <Search size={15} className="text-cyan-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli search_graph --query "ConfigContext" --project "..."',
    exampleOutput: '{"matches":[{"id":"n42","label":"ConfigContext","type":"Interface","file":"src/context/ConfigContext.tsx","line":12}]}',
  },
  {
    id: 'trace_path',
    name: 'trace_path',
    description: 'Traces multi-hop call hierarchies from symbol A to symbol B with risk ratings.',
    icon: <GitBranch size={15} className="text-purple-600" />,
    category: 'trace',
    exampleCmd: 'codebase-memory-mcp cli trace_path --from "POST /api/scan" --to "graph_engine.build_graph" --project "..."',
    exampleOutput: '{"path":["POST /api/scan","scan()","parser.parse()","graph_engine.build_graph"],"hops":3,"risk":"LOW"}',
  },
  {
    id: 'query_graph',
    name: 'query_graph',
    description: 'Execute Cypher-style graph queries (MATCH, WHERE, RETURN) directly against the knowledge graph.',
    icon: <Code2 size={15} className="text-amber-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli query_graph --cypher "MATCH (n)-[:CALLS]->(m) RETURN n.label, m.label LIMIT 5"',
    exampleOutput: '{"rows":[["POST /api/scan","run_scan"],["run_scan","invoke_codebase_memory_mcp"],["invoke_codebase_memory_mcp","parse_output"]]}',
  },
  {
    id: 'get_code_snippet',
    name: 'get_code_snippet',
    description: 'Fetches exact function body without loading the full file. ~120x token savings for LLMs.',
    icon: <FileSearch size={15} className="text-rose-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli get_code_snippet --node-id "n42" --project "..."',
    exampleOutput: '{"snippet":"export const ConfigContext = React.createContext<Config>(...)...","lines":"12-45","tokens":310}',
    badge: '120x Savings',
  },
  {
    id: 'get_file_outline',
    name: 'get_file_outline',
    description: 'Returns a complete symbol outline (all functions, classes, routes) for a given source file.',
    icon: <BookOpen size={15} className="text-slate-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli get_file_outline --file "codegraph/mcp_server/server.py" --project "..."',
    exampleOutput: '{"symbols":["health()","scan()","impact()","list_projects()"],"imports":["fastapi","subprocess","json"]}',
  },
  {
    id: 'get_graph_schema',
    name: 'get_graph_schema',
    description: 'Inspects entity types, relationship types, and the full graph schema structure.',
    icon: <Database size={15} className="text-amber-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli get_graph_schema --project "..."',
    exampleOutput: '{"node_types":["Function","Class","File","Route","Interface"],"edge_types":["calls","imports","inherits","queries"]}',
  },
  {
    id: 'compare_graphs',
    name: 'compare_graphs',
    description: 'Computes symbol-level diff between two Git branches. Shows added/removed nodes and edges.',
    icon: <GitCompare size={15} className="text-indigo-600" />,
    category: 'analysis',
    exampleCmd: 'codebase-memory-mcp cli compare_graphs --base "main" --head "feature/new-scan" --project "..."',
    exampleOutput: '{"added_nodes":3,"removed_nodes":0,"changed_edges":12,"new_callers":["POST /api/architecture"]}',
  },
  {
    id: 'search_code',
    name: 'search_code',
    description: 'High-speed Aho-Corasick pattern search across all indexed code nodes.',
    icon: <Search size={15} className="text-emerald-600" />,
    category: 'query',
    exampleCmd: 'codebase-memory-mcp cli search_code --pattern "AbortSignal.timeout" --project "..."',
    exampleOutput: '{"matches":[{"file":"CodeGraphSection.tsx","line":77,"context":"AbortSignal.timeout(3000)"}]}',
  },
  {
    id: 'list_projects',
    name: 'list_projects',
    description: 'Lists all indexed repositories in the local knowledge graph cache.',
    icon: <FolderGit2 size={15} className="text-lime-600" />,
    category: 'management',
    exampleCmd: 'codebase-memory-mcp cli list_projects',
    exampleOutput: '{"projects":[{"id":"C-Users-srirag.cr-Desktop-UI_Demo_Astra-UI_demo","files":6419,"nodes":565}]}',
  },
  {
    id: 'delete_project',
    name: 'delete_project',
    description: 'Removes an indexed repository from the memory cache to free disk space.',
    icon: <Trash2 size={15} className="text-red-600" />,
    category: 'management',
    exampleCmd: 'codebase-memory-mcp cli delete_project --project "..."',
    exampleOutput: '{"deleted":true,"freed_mb":42}',
  },
  {
    id: 'index_status',
    name: 'index_status',
    description: 'Shows index health, coverage percentage, and last scan timestamp.',
    icon: <Activity size={15} className="text-blue-600" />,
    category: 'management',
    exampleCmd: 'codebase-memory-mcp cli index_status --project "..."',
    exampleOutput: '{"coverage":"94.2%","last_indexed":"2026-09-21 10:30","parsed_files":6419,"skipped":380}',
  },
  {
    id: 'check_index_coverage',
    name: 'check_index_coverage',
    description: 'Detects missed or partially parsed files and reports language detection failures.',
    icon: <CheckCircle2 size={15} className="text-emerald-600" />,
    category: 'analysis',
    exampleCmd: 'codebase-memory-mcp cli check_index_coverage --project "..."',
    exampleOutput: '{"missed":["*.mdx","*.proto"],"partially_parsed":["vite.config.ts"],"recommendation":"Add .proto grammar plugin"}',
  },
  {
    id: 'detect_changes',
    name: 'detect_changes',
    description: 'Computes blast radius on uncommitted git changes. Maps modified symbols to all affected callers.',
    icon: <Zap size={15} className="text-rose-600" />,
    category: 'analysis',
    exampleCmd: 'codebase-memory-mcp cli detect_changes --project "..."',
    exampleOutput: '{"changed_files":2,"blast_radius":["POST /api/scan","handleRefresh()","CelestialMemoryGraph"],"risk":"MEDIUM"}',
    badge: 'Impact',
  },
  {
    id: 'manage_adr',
    name: 'manage_adr',
    description: 'Stores and retrieves Architectural Decision Records (ADRs) inside the knowledge graph.',
    icon: <BookOpen size={15} className="text-slate-600" />,
    category: 'management',
    exampleCmd: 'codebase-memory-mcp cli manage_adr --action "add" --title "Use FastAPI for scan endpoint"',
    exampleOutput: '{"adr_id":"adr-001","stored":true,"linked_nodes":["server.py","scan()"]}',
  },
  {
    id: 'ingest_traces',
    name: 'ingest_traces',
    description: 'Ingests OpenTelemetry execution traces and correlates them with graph nodes.',
    icon: <Radio size={15} className="text-purple-600" />,
    category: 'analysis',
    exampleCmd: 'codebase-memory-mcp cli ingest_traces --trace-file "otel-trace.json" --project "..."',
    exampleOutput: '{"spans_ingested":142,"correlated_nodes":38,"hottest_path":"scan() -> parse_output() -> build_graph()"}',
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  index: { label: 'Indexing', color: 'text-lime-700', bg: 'bg-lime-100' },
  query: { label: 'Query', color: 'text-blue-700', bg: 'bg-blue-100' },
  analysis: { label: 'Analysis', color: 'text-rose-700', bg: 'bg-rose-100' },
  trace: { label: 'Trace', color: 'text-purple-700', bg: 'bg-purple-100' },
  management: { label: 'Management', color: 'text-amber-700', bg: 'bg-amber-100' },
};

export const MCPToolsPanel: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>('index_repository');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const activeTool = MCP_TOOLS.find((t) => t.id === activeToolId);
  const filteredTools = filterCat === 'all' ? MCP_TOOLS : MCP_TOOLS.filter((t) => t.category === filterCat);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu size={16} className="text-lime-600" />
            <span>17 Native MCP Tools</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-lime-100 text-lime-800 rounded-full border border-lime-200">
              v0.11.0
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Callable primitives over Model Context Protocol — usable from AI agents, CLI, and CI/CD pipelines
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          {['all', 'index', 'query', 'analysis', 'trace', 'management'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition cursor-pointer ${
                filterCat === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? `All (${MCP_TOOLS.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Tool List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Tools ({filteredTools.length})
          </div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {filteredTools.map((tool) => {
              const cat = CATEGORY_LABELS[tool.category];
              const isActive = activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveToolId(tool.id)}
                  className={`w-full text-left p-3 flex items-start gap-3 transition cursor-pointer group ${
                    isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold font-mono truncate ${isActive ? 'text-lime-300' : 'text-slate-800'}`}>
                        {tool.name}
                      </span>
                      {tool.badge && (
                        <span className={`text-[9px] font-bold px-1.5 rounded-full shrink-0 ${
                          isActive ? 'bg-lime-500 text-slate-900' : 'bg-lime-100 text-lime-800'
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 rounded font-semibold inline-block mt-0.5 ${
                      isActive ? 'bg-slate-700 text-slate-300' : `${cat.bg} ${cat.color}`
                    }`}>
                      {cat.label}
                    </span>
                    <p className={`text-[10px] mt-1 leading-relaxed line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tool.description}
                    </p>
                  </div>
                  <ChevronRight size={12} className={`shrink-0 mt-1 transition ${isActive ? 'text-lime-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Tool Detail & CLI Simulator */}
        <div className="lg:col-span-3 space-y-4">
          {activeTool ? (
            <>
              {/* Tool Detail Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-slate-100 rounded-xl">{activeTool.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold font-mono text-slate-900">{activeTool.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CATEGORY_LABELS[activeTool.category].bg} ${CATEGORY_LABELS[activeTool.category].color}`}>
                        {CATEGORY_LABELS[activeTool.category].label} Tool
                      </span>
                    </div>
                  </div>
                  {activeTool.badge && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-lime-100 text-lime-800 rounded-full border border-lime-200 shrink-0">
                      {activeTool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{activeTool.description}</p>
              </div>

              {/* CLI Terminal Simulator */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-lime-500/80" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">PowerShell — codebase-memory-mcp</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeTool.exampleCmd)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-md transition cursor-pointer"
                  >
                    {copied ? <Check size={11} className="text-lime-400" /> : <Copy size={11} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-4 space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lime-400 font-bold">PS</span>
                      <span className="text-blue-400">C:\Users\srirag.cr\Desktop</span>
                      <span className="text-white font-bold">{'>'}</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed break-all pl-4 border-l-2 border-lime-600/30">
                      {activeTool.exampleCmd}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Play size={10} className="text-lime-500" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Output</span>
                    </div>
                    <pre className="text-lime-300 text-[10px] leading-relaxed whitespace-pre-wrap break-all bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      {activeTool.exampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl text-center p-6 space-y-3">
              <Terminal size={24} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Select a tool to view its CLI command and output</p>
            </div>
          )}

          {/* Token Efficiency Callout */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-4 text-white flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white mb-1">~120x Fewer LLM Tokens</h4>
              <p className="text-[11px] text-purple-200 leading-relaxed">
                Instead of sending 50 full source files (~400,000 tokens), AI agents query only the symbol outline and
                1-hop callers via <code className="bg-white/10 px-1 rounded text-yellow-200">get_code_snippet</code> (~3,400 tokens).
                10x faster responses. Drastically lower API costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
