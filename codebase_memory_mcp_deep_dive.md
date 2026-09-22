# 📚 Complete Deep-Dive: Codebase Memory MCP in This Project

> Everything you need to understand how this system works — from first principles to every line of code.

---

## 🗺️ Part 1 — The Big Picture (What is this whole thing?)

Before touching any code, understand the **purpose**:

> An AI coding agent has a **context window** (e.g. 200k tokens). If you give it 50 source files, you've spent your entire budget just on code. The agent can't think anymore.
>
> **Codebase Memory MCP** solves this by letting the AI query a **pre-built knowledge graph** of the entire codebase — instead of reading raw files. The AI asks: *"What calls `scan()`?"* and gets back 3 nodes in 200 tokens, instead of 50 files in 400,000 tokens.

---

## 🏛️ Part 2 — System Architecture

The whole system has **4 layers** that talk to each other:

```
┌──────────────────────────────────────────────────────────────────────┐
│  LAYER 4: React Frontend (Vite @ localhost:5173)                      │
│  CodeGraphSection.tsx → Scan & Visualize button                       │
│  Renders: CelestialMemoryGraph, GraphCanvas, SchemaViewer, etc.       │
└────────────────────────────┬─────────────────────────────────────────┘
                             │  HTTP POST /scan
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│  LAYER 3: FastAPI Python Server (@ localhost:8765)                    │
│  server.py — the bridge / orchestrator                                │
│  Handles: /health  /scan  /impact                                     │
└────────────┬───────────────────────────────┬─────────────────────────┘
             │  subprocess.run(...)           │  parser.parse_repository()
             ↓                               ↓
┌────────────────────────┐    ┌──────────────────────────────────────┐
│  LAYER 1: Native Binary │    │  LAYER 2: Python AST Parser           │
│  codebase-memory-mcp   │    │  parser.py — ASTCodeParser            │
│  (Rust/Go compiled exe)│    │  Walks all .ts/.tsx/.py files         │
│  Aho-Corasick + LZ4    │    │  Uses Python's ast module + Regex     │
│  SQLite in-memory graph│    │  Produces: symbols, calls, imports,   │
│  66+ Tree-sitter grammars    │  schemas, files, folders, dir_counts  │
└────────────────────────┘    └──────────────────────────────────────┘
```

**Important**: The native binary (Layer 1) is the *ideal path*. If it's installed, it gets called via `subprocess`. The Python AST parser (Layer 2) is the **fallback** — it always runs and provides the graph data regardless of whether the native binary works.

---

## 🔩 Part 3 — Every File, Explained

```
codegraph/
├── mcp_server/
│   ├── server.py          ← FastAPI server, the main orchestrator
│   ├── parser.py          ← Python AST parser (extracts nodes/edges)
│   ├── graph_engine.py    ← SQLite persistent graph + blast-radius
│   ├── requirements.txt   ← fastapi, uvicorn, pydantic, GitPython
│   └── venv/              ← Python virtual environment
│
└── frontend/
    ├── CodeGraphSection.tsx      ← Main page: all 7 tabs, scan logic
    ├── CelestialMemoryGraph.tsx  ← 3D force-directed galaxy (Three.js)
    ├── GraphCanvas.tsx           ← 2D multi-lane architecture canvas
    ├── SchemaViewer.tsx          ← Data model/schema inspector
    ├── ImpactRadiusViewer.tsx    ← Blast-radius analysis panel
    ├── MemoryRulesPanel.tsx      ← Architectural rules editor
    ├── MCPToolsPanel.tsx         ← 17 MCP tools explorer + CLI sim
    ├── ArchitectureOverview.tsx  ← 5-layer architecture analyzer
    ├── projectMemories.ts        ← Static seed data for 3 demo projects
    └── types.ts                  ← All TypeScript interfaces
```

---

## 📡 Part 4 — The Data Flow: What Happens When You Click "Scan & Visualize"

This is the most important thing to understand. Follow it step by step:

### Step 1 — React sends HTTP POST to Python

```
Location: CodeGraphSection.tsx → handleRefresh()
```

```typescript
// 1. First, check if the server is alive
const health = await fetch(`http://localhost:8765/health`, { signal: AbortSignal.timeout(3000) });

// 2. If alive, POST the scan request
const res = await fetch(`http://localhost:8765/scan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repo_path: currentRepoUrl.trim(),     // e.g. "C:/Users/srirag.cr/Desktop/UI_Demo_Astra/UI_demo"
    branch: branch || 'main',
    auth_token: isPrivate && authType === 'pat' ? patToken : null,
    project_id: activeProjectId,         // e.g. "ASTRA-CORE"
  }),
});
```

### Step 2 — FastAPI server receives the request

```
Location: server.py → scan_repository()
```

```python
@app.post("/scan")
def scan_repository(req: ScanRequest) -> Dict[str, Any]:
    native_bin = find_native_cbm_binary()  # Try to find the native .exe

    # PATH A: Native binary exists → run it as subprocess
    if native_bin and target_path.exists():
        proc = subprocess.run(
            [native_bin, "cli", "index_repository", "--repo-path", str(target_path.resolve()), "--json"],
            capture_output=True, text=True, timeout=30,
        )
        # Parse the JSON output from stdout
        native_result = json.loads(...)

    # PATH B: Always runs Python AST parser (main data source)
    parser = ASTCodeParser(repo_path=req.repo_path, ...)
    raw = parser.parse_repository()
    # raw = { symbols: [...], calls: [...], schemas: [...], imports: [...], files: [...], folders: [...], dir_counts: {...} }

    # PATH C: Convert raw symbols → graph nodes + edges
    graph = symbols_to_graph(raw["symbols"], raw["schemas"], raw.get("calls"), ...)
    # graph = { nodes: [...], edges: [...], schemas: [...], node_types_count: {...}, ... }
```

### Step 3 — Python parser walks the repository

```
Location: parser.py → ASTCodeParser.parse_repository()
```

```python
def parse_repository(self) -> Dict:
    # Walk every file in the repo, skipping: .git, node_modules, venv, dist, build
    for file_path in self.repo_path.rglob("*"):
        if file_path.suffix in [".ts", ".tsx", ".js", ".jsx"]:
            res = self._parse_typescript_file(file_path, rel_path)
        elif file_path.suffix == ".py":
            res = self._parse_python_file(file_path, rel_path)
        
        # Each res has: { symbols, calls, schemas, imports }
        symbols.extend(res["symbols"])
        calls.extend(res["calls"])
        ...
```

**What gets extracted from TypeScript files** (via Regex):
- `export interface Foo { ... }` → Symbol type `Interface` + Schema with fields
- `export type Bar = ...` → Symbol type `Type`
- `export const MyFunc = ...` → Symbol type `Function`
- `export class Controller { ... }` → Symbol type `Class`
- `export enum Status { ... }` → Symbol type `Enum`
- `import { X } from './y'` → `imports` list edge

**What gets extracted from Python files** (via Python's real `ast` module — much more accurate):
- `class Foo(BaseModel):` → `Class` node, fields from `AnnAssign` nodes → `Field` nodes, `Schema`
- `async def my_route():` with `@app.get()` decorator → `Route` node
- `def my_func():` → `Function` node
- Calls inside function body: `sub.func.id` or `sub.func.attr` → `calls` edges
- `CONSTANT = ...` uppercase assignments → `Variable` nodes

### Step 4 — Graph construction: symbols → nodes + edges

```
Location: server.py → symbols_to_graph()
```

This is the **coordinate system** for the 3D graph. Every node needs `(x, y, z)` coordinates for the 3D view and `(gridX, gridY)` for the 2D lane view.

```python
def symbols_to_graph(symbols, schemas_raw, calls_raw, imports_raw, files_raw, folders_raw, dir_counts):

    # STEP A: Build "cluster centers" for top-level directories
    # Each top-level folder (e.g. "src", "tests", "codegraph") gets a point on a sphere
    # using the Fibonacci sphere algorithm for even distribution
    for idx, d in enumerate(top_dirs):
        phi = math.acos(-1.0 + (2.0 * idx) / num_dirs)
        theta = math.sqrt(num_dirs * math.pi) * phi
        cluster_radius = 180.0
        folder_clusters[d] = {
            "cx": cluster_radius * cos(theta) * sin(phi),   # X center of this cluster
            "cy": cluster_radius * sin(theta) * sin(phi),   # Y center of this cluster
            "cz": cluster_radius * cos(phi),                # Z center of this cluster
        }

    # STEP B: 2D lane positions — each symbol type maps to a column
    layer_2d_cols = {
        "Route": 0,       # Column 0 = API & Ingress (left)
        "Function": 1,    # Column 1 = Core Logic
        "Class": 2,       # Column 2 = Data Models
        "Field": 3,       # Column 3 = Utilities
        "File": 4,        # Column 4 = Files & Modules (right)
    }
    lane_x_offsets = {0: 40, 1: 340, 2: 640, 3: 940, 4: 1240}  # px from left

    # STEP C: For each symbol, compute 3D position near its folder cluster
    for sym in symbols:
        top_dir = sym["file"].split("/")[0]
        cluster_center = folder_clusters[top_dir]
        # Place the node within ±50 units of the cluster center (sphere jitter)
        jitter = random.uniform(10, 50)
        x = cluster_center["cx"] + jitter * sin(phi) * cos(theta)
        y = cluster_center["cy"] + jitter * sin(phi) * sin(theta)
        z = cluster_center["cz"] + jitter * cos(phi)
        # gridX/gridY is the 2D lane position
        gx = lane_x_offsets[lane]
        gy = 64 + lane_counters[lane] * 122  # Stack downward in each column

    # STEP D: Build Edges
    # 1. File → defines → Symbol (file contains this function/class)
    # 2. Class → defines → Method (class owns this method)
    # 3. FunctionA → calls → FunctionB (from calls_raw extracted by parser)
    # 4. File → imports → Symbol (from imports_raw)
    # 5. Class ↔ Function usage cross-links (to form the celestial web)
```

### Step 5 — Server returns the graph JSON to React

```python
return {
    "success": True,
    "nodes": graph["nodes"],      # Array of { id, label, type, file, x, y, z, gridX, gridY, color, metrics }
    "edges": graph["edges"],      # Array of { id, source, target, label, type }
    "schemas": graph["schemas"],  # Array of { id, tableName, fields }
    "node_types_count": ...,      # { "Function": 45, "Class": 12, ... }
    "edge_types_count": ...,      # { "calls": 89, "imports": 23, ... }
    "dir_counts": ...,            # { "src": 124, "tests": 34, ... }
    "totalFiles": 148,
    "totalSymbols": 620,
}
```

### Step 6 — React stores the graph and renders all views

```typescript
// CodeGraphSection.tsx → handleRefresh() continues after the fetch:

const finalMem: ProjectCodebaseMemory = {
    projectId: activeProjectId,
    repoUrl: currentRepoUrl,
    ...
    nodes: data.nodes,      // Stored in React state
    edges: data.edges,
    schemas: data.schemas,
    rules: scannedMemory.rules,  // Rules are local-only, not from server
    node_types_count: data.node_types_count,
    ...
};

// Save into the static PROJECT_CODEBASE_MEMORIES record (in-memory cache)
PROJECT_CODEBASE_MEMORIES[activeProjectId] = finalMem;

// Update state → triggers re-render → all 7 tabs now show real data
setScannedMemory(finalMem);
setHasScanned(true);
```

---

## 🎨 Part 5 — The 7 View Tabs, Explained

### Tab 1: 3D Celestial Galaxy (`CelestialMemoryGraph.tsx`)

Uses **Three.js** (via `@react-three/fiber` and `@react-three/drei`) to render:
- **Sphere particles** for each node — color-coded by type
- **Lines** between nodes for edges
- **Force simulation** — nodes push away from each other, edges pull them together
- **Clusters** — files in the same folder orbit the same cluster center

The `x, y, z` coordinates computed in `symbols_to_graph()` (Fibonacci sphere algorithm) are directly used here as initial positions. The 3D physics simulation then adjusts them.

### Tab 2: Architecture Overview (`ArchitectureOverview.tsx`)

Analyzes nodes in memory and classifies them into 5 layers:
- Computes what `%` of nodes are API/Service/Data/Util/File types
- Shows progress bars for each layer
- Lists top entry points (nodes with highest `callersCount`)
- Breaks down by detected language (file extension)
- Shows edge type distribution

**All computed client-side from the node array in memory** — no extra server call.

### Tab 3: 2D Multi-Lane Canvases (`GraphCanvas.tsx`)

Uses the `gridX` and `gridY` coordinates (pre-computed by the server) to place nodes in 5 vertical swim-lane columns. Three modes:
- **Lanes**: All 5 columns side by side (API | Logic | Models | Utils | Files)
- **Layer Focus**: Zoom into one column, show that layer in full detail
- **Dependency Flow**: Show caller → selected node → callee chain

### Tab 4: Schemas & Models (`SchemaViewer.tsx`)

Renders the `schemas` array. Each schema has:
- `tableName` — the class/interface/model name
- `fields` — array of `{ name, type, isPrimary, isForeignKey, isNullable }`

Source: extracted by `_parse_python_file()` for Pydantic/SQLAlchemy models and `_parse_typescript_file()` for TypeScript interfaces.

### Tab 5: Impact Blast-Radius (`ImpactRadiusViewer.tsx`)

When you select a file, it traverses the `edges` array client-side:
```typescript
// Who calls into this file? (upstream)
edges.forEach(e => {
    if (fileNodeIds.has(e.target) && !fileNodeIds.has(e.source)) {
        callerNodeIds.add(e.source);  // HIGH RISK
    }
});

// What does this file call? (downstream)
edges.forEach(e => {
    if (fileNodeIds.has(e.source) && !fileNodeIds.has(e.target)) {
        downstreamIds.add(e.target);  // MEDIUM RISK
    }
});
```

Also generates suggested test commands based on file type (`.py` → `pytest`, `.ts` → `npm test`).

### Tab 6: MCP Tools & CLI (`MCPToolsPanel.tsx`)

A **static documentation explorer** with a simulated terminal. Shows all 17 native CLI tools with:
- Category (index/query/analysis/trace/management)
- Example command (PowerShell-formatted)
- Example JSON output
- Copy button

This tab is **purely educational/reference** — it doesn't actually call the binary. The real CLI is invoked in `server.py → scan_repository()` via `subprocess.run()`.

### Tab 7: Architectural Rules (`MemoryRulesPanel.tsx`)

A **local-only CRUD panel** for coding rules. Rules are stored in React state (not persisted to server). They come from:
- The static `PROJECT_CODEBASE_MEMORIES` seed data (pre-populated demo rules)
- Rules you add manually via the "Add Rule" modal

Rules are injected into `ProjectCodebaseMemory.rules` and displayed here.

---

## 🗃️ Part 6 — The Data Structures

### The Central Type: `ProjectCodebaseMemory` (types.ts)

```typescript
interface ProjectCodebaseMemory {
    projectId: string;          // e.g. "ASTRA-CORE"
    repoUrl: string;            // e.g. "https://github.com/..."
    branch: string;             // e.g. "main"
    lastParsedAt: string;       // e.g. "Just now (Synced)"
    totalFiles: number;         // 148
    totalSymbols: number;       // 620
    nodes: GraphNode[];         // The actual graph nodes
    edges: GraphEdge[];         // The actual graph edges
    schemas: SchemaModel[];     // Data models / tables
    rules: ArchitecturalRule[]; // Coding invariants
    node_types_count?: Record<string, number>;  // { "Function": 45, ... }
    edge_types_count?: Record<string, number>;  // { "calls": 89, ... }
    dir_counts?: Record<string, number>;        // { "src": 124, ... }
}
```

### A Graph Node (`GraphNode`)

```typescript
interface GraphNode {
    id: string;          // Unique: "sym_42", "file_7", "folder_3"
    label: string;       // Human name: "handleRefresh", "ConfigContext"
    type: string;        // "Function" | "Class" | "Route" | "File" | ...
    file: string;        // "codegraph/frontend/CodeGraphSection.tsx"
    line?: number;       // 50  (line number in file)
    description?: string;
    x: number;           // 3D X coordinate (Fibonacci sphere position)
    y: number;           // 3D Y coordinate
    z?: number;          // 3D Z coordinate
    gridX?: number;      // 2D lane X offset (40, 340, 640, 940, or 1240)
    gridY?: number;      // 2D lane Y position (64 + lane_count * 122)
    color?: string;      // "#00f5ff" (cyan=Function), "#d946ef" (purple=Class)
    size?: number;       // Sphere radius in 3D: 4.0 for Class, 2.5 for Function
    metrics?: {
        callersCount: number;  // How many other nodes call this node (in-degree)
        calleesCount: number;  // How many nodes this node calls (out-degree)
    };
}
```

### A Graph Edge (`GraphEdge`)

```typescript
interface GraphEdge {
    id: string;     // "e_sym_1_sym_5"
    source: string; // node id of the caller/definer
    target: string; // node id of the callee/defined
    label?: string; // "calls", "imports", "defines", "inherits"
    type?: string;  // same as label
}
```

---

## 🧠 Part 7 — The SQLite Persistent Knowledge Graph (`graph_engine.py`)

This is the **persistence layer** — it survives IDE restarts:

```python
class CodeGraphEngine:
    def __init__(self, db_path="./state/codegraph_memory.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        # Creates TWO tables in SQLite
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT PRIMARY KEY,
                project_id TEXT,   -- Which repo this node belongs to
                label TEXT,        -- Symbol name
                type TEXT,         -- Function / Class / Route / etc.
                file TEXT,         -- Source file path
                line INTEGER,      -- Line number
                description TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS edges (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                source TEXT,       -- Caller node id
                target TEXT,       -- Callee node id
                relationship TEXT  -- calls / imports / defines / etc.
            )
        """)
```

The `compute_blast_radius()` method queries this to find all transitive callers/callees.

> **Note**: In this project, the graph_engine currently returns hardcoded sample data for the `/impact` endpoint. To make it fully dynamic, it would need to be populated from the `symbols_to_graph()` output after each scan.

---

## 🌐 Part 8 — The 17 Native MCP Tools (the `codebase-memory-mcp` binary)

The native binary is a pre-compiled Rust/Go program that exposes these tools. They're invoked via CLI and also over the **Model Context Protocol (MCP)** — a standard that lets AI agents call tools directly.

| Tool | What it does | Used in project |
|------|-------------|----------------|
| `index_repository` | Index entire codebase into RAM | **YES** — `server.py:389` via subprocess |
| `get_architecture` | Entry points, packages, layer overview | In MCPToolsPanel (demo) |
| `search_graph` | Fuzzy symbol search | In MCPToolsPanel (demo) |
| `trace_path` | Call path from A to B | In MCPToolsPanel (demo) |
| `query_graph` | Cypher-style graph queries | In MCPToolsPanel (demo) |
| `get_code_snippet` | Exact function body (~120x token saving) | In MCPToolsPanel (demo) |
| `get_file_outline` | All symbols in a file | In MCPToolsPanel (demo) |
| `get_graph_schema` | Node/edge type schema | In MCPToolsPanel (demo) |
| `compare_graphs` | Branch-level symbol diff | In MCPToolsPanel (demo) |
| `search_code` | Aho-Corasick pattern match | In MCPToolsPanel (demo) |
| `list_projects` | All indexed repos | In MCPToolsPanel (demo) |
| `delete_project` | Remove a repo from cache | In MCPToolsPanel (demo) |
| `index_status` | Coverage %, last scan time | In MCPToolsPanel (demo) |
| `check_index_coverage` | Find missed files | In MCPToolsPanel (demo) |
| `detect_changes` | Uncommitted change blast radius | In MCPToolsPanel (demo) |
| `manage_adr` | Architectural Decision Records | In MCPToolsPanel (demo) |
| `ingest_traces` | OpenTelemetry trace correlation | In MCPToolsPanel (demo) |

---

## 🧩 Part 9 — The Static Seed Data (`projectMemories.ts`)

Since a new user hasn't scanned anything yet, the project pre-populates 3 demo projects:

```typescript
export const PROJECT_CODEBASE_MEMORIES = {
    'ASTRA-CORE': {
        // 7 nodes: POST /api/v1/trigger, PipelineRunner, ImpactAnalysisStage, ...
        // 6 edges: dispatches, executes, persists, acquires lock, verifies
        // 3 schemas: dev_requests, stage_runs, architectural_rules
        // 3 rules: Repository Layer Isolation, Docker Volume Sandbox, Human-in-Loop
    },
    'PAY-API': { ... },    // Stripe payment microservice
    'WEB-PORTAL': { ... }, // React frontend with Zustand
};
```

When you switch project in the top dropdown (`activeProjectId`), `CodeGraphSection` reads from this record:
```typescript
const seedMemory = (projId: string) =>
    PROJECT_CODEBASE_MEMORIES[projId] ?? emptyMemory();
```

When you run a real scan, it writes back into this record:
```typescript
PROJECT_CODEBASE_MEMORIES[activeProjectId] = finalMem;  // Updates in-memory
```

---

## 🔐 Part 10 — Private Repository Support

The parser supports cloning private repos:

```python
# parser.py → _resolve_or_clone()

if path_or_url.startswith("https://") and self.auth_token:
    # Inject PAT token into HTTPS URL:
    clone_url = path_or_url.replace("https://", f"https://{self.auth_token}@")
    # Result: https://ghp_xxx@github.com/my-org/private-repo.git

# Uses GitPython (pip install gitpython) for cloning:
git.Repo.clone_from(clone_url, cache_dir, depth=1)  # Shallow clone = fast
# Cached at: ~/.codegraph_cache/repo-name/
```

---

## 🚀 Part 11 — How to Start Everything From Scratch

```powershell
# Terminal 1: Start the Python MCP server
cd c:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo\codegraph\mcp_server
.\venv\Scripts\python.exe server.py
# Should print: Starting Codebase Memory MCP Server on http://localhost:8765

# Terminal 2: Start the React dev server
cd c:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo
npm run dev
# Should print: Local:   http://localhost:5173/

# Then in the browser:
# 1. Go to http://localhost:5173
# 2. Click "Codebase Memory & Graph" in sidebar
# 3. Type a repo path: C:\Users\srirag.cr\Desktop\UI_Demo_Astra\UI_demo
# 4. Click "Scan & Visualize"
# 5. Watch the 7 tabs populate with real data
```

---

## 🔑 Part 12 — Key Concepts to Remember

| Concept | Value |
|---------|-------|
| Python server URL | `http://localhost:8765` |
| React dev server URL | `http://localhost:5173` |
| Graph data format | Nodes + Edges (like a database with foreign keys) |
| 3D positions from | Fibonacci sphere algorithm per top-level directory |
| 2D positions from | Fixed lane columns (5 lanes × N rows) |
| Persistence in | `graph_engine.py` → SQLite at `./state/codegraph_memory.db` |
| In-memory cache | `PROJECT_CODEBASE_MEMORIES` (TypeScript Record, lost on page refresh) |
| Node colors | Defined in `server.py → type_color_map` |
| Parser accuracy | Python = very accurate (real AST); TypeScript = good (Regex-based) |
| Token savings | `get_code_snippet` gives 300 tokens vs 300,000 for full files |

---

## 💡 Part 13 — What You Can Improve Next

1. **Real `search_graph` endpoint** — Add `GET /search?q=symbol_name` to `server.py` that queries the SQLite `nodes` table
2. **Persist scanned data to SQLite** — Currently `graph_engine` tables are empty; populate them from `symbols_to_graph()` output
3. **Real `detect_changes`** — Use `git diff --name-only HEAD` + edge traversal in `graph_engine.compute_blast_radius()`
4. **More languages** — Add Go/Rust/Java parsers to `parser.py` using their respective AST libraries
5. **WebSocket updates** — Stream scan progress back to React instead of one big response at the end
