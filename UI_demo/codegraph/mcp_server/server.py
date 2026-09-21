"""
Codebase Memory MCP Server — FastAPI HTTP mode.
Exposes REST endpoints callable from the React frontend.
"""

from typing import Dict, List, Any, Optional
from pathlib import Path
import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from parser import ASTCodeParser
from graph_engine import CodeGraphEngine

app = FastAPI(title="Codebase Memory MCP", version="1.0.0")

# Allow the Vite dev server (localhost:5173) to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph_engine = CodeGraphEngine()

# ─────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────

class ScanRequest(BaseModel):
    repo_path: str
    branch: str = "main"
    auth_token: Optional[str] = None
    project_id: str = "DEFAULT"


# ─────────────────────────────────────────────
# Helper: convert raw parser output → graph nodes + edges
# ─────────────────────────────────────────────

import math
import random

def symbols_to_graph(
    symbols: list,
    schemas_raw: list,
    calls_raw: list = None,
    imports_raw: list = None,
    files_raw: list = None,
    folders_raw: list = None,
    dir_counts: dict = None,
) -> Dict[str, Any]:
    """
    Convert raw symbols, files, folders & imports into the 3D / 2D Celestial Force-Directed
    Codebase Memory Graph.
    """
    calls_raw = calls_raw or []
    imports_raw = imports_raw or []
    files_raw = files_raw or []
    folders_raw = folders_raw or []
    dir_counts = dir_counts or {}

    nodes = []
    edges = []
    symbol_to_id: Dict[str, str] = {}
    seen_names = set()

    node_types_count: Dict[str, int] = {}
    edge_types_count: Dict[str, int] = {}

    def count_node_type(t: str):
        node_types_count[t] = node_types_count.get(t, 0) + 1

    def count_edge_type(t: str):
        edge_types_count[t] = edge_types_count.get(t, 0) + 1

    # Color mapping matching the Codebase Memory MCP theme
    type_color_map = {
        "Function": "#00f5ff",
        "Field": "#a3e635",
        "Class": "#d946ef",
        "File": "#38bdf8",
        "Module": "#fb923c",
        "Variable": "#2dd4bf",
        "Folder": "#4ade80",
        "Enum": "#facc15",
        "Method": "#a78bfa",
        "Interface": "#f472b6",
        "Route": "#84cc16",
        "Type": "#67e8f9",
        "Project": "#ef4444",
    }

    # Generate Cluster Centers for major top-level folders
    folder_clusters: Dict[str, Dict[str, float]] = {}
    top_dirs = list(dir_counts.keys())
    num_dirs = max(1, len(top_dirs))

    for idx, d in enumerate(top_dirs):
        phi = math.acos(-1.0 + (2.0 * idx) / num_dirs)
        theta = math.sqrt(num_dirs * math.pi) * phi
        cluster_radius = 180.0
        folder_clusters[d] = {
            "cx": cluster_radius * math.cos(theta) * math.sin(phi),
            "cy": cluster_radius * math.sin(theta) * math.sin(phi),
            "cz": cluster_radius * math.cos(phi),
        }

    # 2D Layer Column Mapping for 2D Architecture Grid View
    layer_2d_cols = {
        "Route": 0,
        "api": 0,
        "Function": 1,
        "Method": 1,
        "service": 1,
        "Class": 2,
        "Interface": 2,
        "Enum": 2,
        "Type": 2,
        "database": 2,
        "File": 3,
        "Module": 3,
        "Variable": 3,
        "Field": 3,
        "util": 3,
        "Folder": 4,
        "test": 4,
    }
    col_row_counters: Dict[int, int] = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    col_x_positions = {0: 50, 1: 340, 2: 630, 3: 920, 4: 1210}

    def get_2d_coords(stype: str) -> tuple:
        col = layer_2d_cols.get(stype, 1)
        r = col_row_counters[col]
        col_row_counters[col] += 1
        gx = col_x_positions[col]
        gy = 60 + r * 115
        return gx, gy

    # 1. Add Folder Nodes (if any)
    node_idx = 0
    for fldr in folders_raw[:30]:
        nid = f"folder_{node_idx}"
        node_idx += 1
        top_d = fldr.split("/")[0]
        c = folder_clusters.get(top_d, {"cx": 0, "cy": 0, "cz": 0})
        
        # 3D position with spherical jitter
        jitter = random.uniform(30, 70)
        u = random.random()
        v = random.random()
        theta = u * 2.0 * math.pi
        phi = math.acos(2.0 * v - 1.0)
        x = c["cx"] + jitter * math.sin(phi) * math.cos(theta)
        y = c["cy"] + jitter * math.sin(phi) * math.sin(theta)
        z = c["cz"] + jitter * math.cos(phi)

        gx, gy = get_2d_coords("Folder")
        count_node_type("Folder")
        nodes.append({
            "id": nid,
            "label": fldr.split("/")[-1],
            "type": "Folder",
            "file": fldr,
            "line": 1,
            "color": type_color_map["Folder"],
            "size": 4.5,
            "x": x,
            "y": y,
            "z": z,
            "gridX": gx,
            "gridY": gy,
            "metrics": {"callersCount": 0, "calleesCount": 0},
        })

    # 2. Add File Nodes
    for f in files_raw[:120]:
        nid = f"file_{node_idx}"
        node_idx += 1
        rel_f = f["file"]
        symbol_to_id[rel_f] = nid
        top_d = rel_f.split("/")[0] if "/" in rel_f else "."
        c = folder_clusters.get(top_d, {"cx": 0, "cy": 0, "cz": 0})

        jitter = random.uniform(20, 60)
        u = random.random()
        v = random.random()
        theta = u * 2.0 * math.pi
        phi = math.acos(2.0 * v - 1.0)
        x = c["cx"] + jitter * math.sin(phi) * math.cos(theta)
        y = c["cy"] + jitter * math.sin(phi) * math.sin(theta)
        z = c["cz"] + jitter * math.cos(phi)

        gx, gy = get_2d_coords("File")
        count_node_type("File")
        nodes.append({
            "id": nid,
            "label": f["name"],
            "type": "File",
            "file": rel_f,
            "line": 1,
            "color": type_color_map["File"],
            "size": 3.5,
            "x": x,
            "y": y,
            "z": z,
            "gridX": gx,
            "gridY": gy,
            "metrics": {"callersCount": 0, "calleesCount": 0},
        })

    # 3. Add Symbol Nodes (Functions, Methods, Classes, Interfaces, Enums, Variables, Fields, Routes)
    for sym in symbols[:450]:
        name = sym["name"]
        if name in seen_names:
            continue
        seen_names.add(name)

        nid = f"sym_{node_idx}"
        node_idx += 1
        symbol_to_id[name] = nid

        stype = sym.get("type", "Function")
        if stype not in type_color_map:
            stype = "Function"

        rel_f = sym.get("file", "")
        top_d = rel_f.split("/")[0] if "/" in rel_f else "."
        c = folder_clusters.get(top_d, {"cx": 0, "cy": 0, "cz": 0})

        jitter = random.uniform(10, 50)
        u = random.random()
        v = random.random()
        theta = u * 2.0 * math.pi
        phi = math.acos(2.0 * v - 1.0)
        x = c["cx"] + jitter * math.sin(phi) * math.cos(theta)
        y = c["cy"] + jitter * math.sin(phi) * math.sin(theta)
        z = c["cz"] + jitter * math.cos(phi)

        gx, gy = get_2d_coords(stype)
        count_node_type(stype)
        nodes.append({
            "id": nid,
            "label": name,
            "type": stype,
            "file": rel_f,
            "line": sym.get("line", 1),
            "color": type_color_map.get(stype, "#00f5ff"),
            "size": 4.0 if stype in ("Class", "Route", "Module") else 2.5,
            "x": x,
            "y": y,
            "z": z,
            "gridX": gx,
            "gridY": gy,
            "metrics": {"callersCount": 0, "calleesCount": 0},
        })

    # 4. Create Edges
    edge_set = set()
    def add_rel_edge(src: str, tgt: str, label: str, etype: str):
        if not src or not tgt or src == tgt:
            return
        edge_key = (src, tgt)
        if edge_key in edge_set:
            return
        edge_set.add(edge_key)
        count_edge_type(etype)
        edges.append({
            "id": f"e_{src}_{tgt}",
            "source": src,
            "target": tgt,
            "label": label,
            "type": etype,
        })

    # A) File defines symbol edges
    for sym_node in [n for n in nodes if n["type"] not in ("File", "Folder")]:
        file_path = sym_node["file"]
        if file_path in symbol_to_id:
            add_rel_edge(symbol_to_id[file_path], sym_node["id"], "defines", "defines")

    # B) Class defines method / field edges
    for sym_node in [n for n in nodes if n["type"] in ("Method", "Field")]:
        label = sym_node["label"]
        if "." in label:
            parent_class = label.split(".")[0]
            if parent_class in symbol_to_id:
                etype = "defines method" if sym_node["type"] == "Method" else "defines"
                add_rel_edge(symbol_to_id[parent_class], sym_node["id"], etype, etype)

    # C) Function calls / usages
    for call in calls_raw:
        caller = call.get("caller")
        callee = call.get("callee")
        if caller in symbol_to_id and callee in symbol_to_id:
            add_rel_edge(symbol_to_id[caller], symbol_to_id[callee], "calls", "calls")

    # D) Imports
    for imp in imports_raw:
        sym_name = imp.get("symbol")
        imp_file = imp.get("file")
        if sym_name in symbol_to_id and imp_file in symbol_to_id:
            add_rel_edge(symbol_to_id[imp_file], symbol_to_id[sym_name], "imports", "imports")

    # Inter-cluster connecting edges to form celestial galaxy web
    class_nodes = [n for n in nodes if n["type"] in ("Class", "Route")]
    fn_nodes = [n for n in nodes if n["type"] == "Function"]
    for i in range(min(len(class_nodes), len(fn_nodes))):
        add_rel_edge(class_nodes[i]["id"], fn_nodes[i]["id"], "usage", "usage")

    # Calculate degrees
    in_deg: Dict[str, int] = {}
    out_deg: Dict[str, int] = {}
    for e in edges:
        out_deg[e["source"]] = out_deg.get(e["source"], 0) + 1
        in_deg[e["target"]] = in_deg.get(e["target"], 0) + 1

    for n in nodes:
        nid = n["id"]
        n["metrics"]["callersCount"] = in_deg.get(nid, 0)
        n["metrics"]["calleesCount"] = out_deg.get(nid, 0)

    # 5. Build schemas from raw schema list
    schemas = []
    for idx, s in enumerate(schemas_raw[:40]):
        fields = s.get("fields", [
            {"name": "id", "type": "UUID", "isPrimary": True},
            {"name": "created_at", "type": "TIMESTAMP"},
        ])
        schemas.append({
            "id": s.get("id", f"s{idx}"),
            "tableName": s.get("tableName") or s.get("name", f"Schema_{idx}"),
            "description": s.get("description") or f"{s.get('type', 'Schema')} in {s.get('file', '')}",
            "fields": fields,
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "schemas": schemas,
        "node_types_count": node_types_count,
        "edge_types_count": edge_types_count,
        "dir_counts": dir_counts,
    }


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "codebase-memory-mcp"}


@app.post("/scan")
def scan_repository(req: ScanRequest) -> Dict[str, Any]:
    """
    Main endpoint: parse a local path or Git URL and return 3D celestial graph data.
    """
    try:
        parser = ASTCodeParser(
            repo_path=req.repo_path,
            auth_token=req.auth_token or None,
            branch=req.branch,
        )
        raw = parser.parse_repository()
        graph = symbols_to_graph(
            symbols=raw["symbols"],
            schemas_raw=raw["schemas"],
            calls_raw=raw.get("calls", []),
            imports_raw=raw.get("imports", []),
            files_raw=raw.get("files", []),
            folders_raw=raw.get("folders", []),
            dir_counts=raw.get("dir_counts", {}),
        )

        total_files = len(raw.get("files", [])) or len(set(s.get("file", "") for s in raw["symbols"]))
        total_symbols = len(raw["symbols"])

        return {
            "success": True,
            "project_id": req.project_id,
            "repo_path": req.repo_path,
            "branch": req.branch,
            "totalFiles": total_files,
            "totalSymbols": total_symbols,
            "nodes": graph["nodes"],
            "edges": graph["edges"],
            "schemas": graph["schemas"],
            "node_types_count": graph["node_types_count"],
            "edge_types_count": graph["edge_types_count"],
            "dir_counts": graph["dir_counts"],
            "rules": [],
            "lastParsedAt": "Just now (Synced)",
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "nodes": [],
            "edges": [],
            "schemas": [],
            "rules": [],
            "node_types_count": {},
            "edge_types_count": {},
            "dir_counts": {},
            "totalFiles": 0,
            "totalSymbols": 0,
        }


@app.get("/impact")
def get_impact(file_path: str = Query(..., description="File path to compute blast radius for")):
    """Return impact blast-radius for a changed file."""
    return graph_engine.compute_blast_radius(file_path)


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("Starting Codebase Memory MCP Server on http://localhost:8765 ...")
    uvicorn.run("server:app", host="0.0.0.0", port=8765, reload=True, log_level="info")


