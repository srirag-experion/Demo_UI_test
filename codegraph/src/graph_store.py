"""
Graph Storage and Traversal Engine for Codebase Memory.
Maintains in-memory networkx graph backed by SQLite for fast structural queries.
"""

import os
import sqlite3
import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
import networkx as nx

from graph_models import SymbolNode, SymbolEdge, ImpactResult
from parser import CodeParser

class CodeGraphStore:
    def __init__(self, db_path: str = "./codegraph.db"):
        self.db_path = Path(db_path)
        self.graph = nx.DiGraph()
        self.nodes_by_id: Dict[str, SymbolNode] = {}
        self.symbols_by_name: Dict[str, List[SymbolNode]] = {}
        self.parser = CodeParser()
        self._init_sqlite()

    def _init_sqlite(self):
        """Initializes SQLite tables for persistent graph caching."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS nodes (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    kind TEXT,
                    file_path TEXT,
                    start_line INTEGER,
                    end_line INTEGER,
                    docstring TEXT,
                    signature TEXT,
                    metadata_json TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS edges (
                    source_id TEXT,
                    target_id TEXT,
                    kind TEXT,
                    metadata_json TEXT,
                    PRIMARY KEY (source_id, target_id, kind)
                )
            """)
            conn.commit()

    def index_repository(self, root_path: str, extensions: Optional[List[str]] = None) -> Dict[str, Any]:
        """Scans and indexes all code files in the given directory."""
        root = Path(root_path).resolve()
        if not root.exists():
            raise FileNotFoundError(f"Repository path does not exist: {root_path}")

        exts = extensions or [".py", ".ts", ".tsx", ".js", ".jsx"]
        all_nodes: List[SymbolNode] = []
        all_edges: List[SymbolEdge] = []
        processed_files = 0

        # Ignore patterns
        ignore_dirs = {".git", "node_modules", "dist", "build", "__pycache__", ".venv", "venv", ".idea"}

        for dirpath, dirnames, filenames in os.walk(root):
            # Prune ignored directories
            dirnames[:] = [d for d in dirnames if d not in ignore_dirs]

            for file in filenames:
                file_path = Path(dirpath) / file
                if file_path.suffix.lower() in exts:
                    nodes, edges = self.parser.parse_file(file_path, root)
                    all_nodes.extend(nodes)
                    all_edges.extend(edges)
                    processed_files += 1

        # Populate in-memory graph
        self.graph.clear()
        self.nodes_by_id.clear()
        self.symbols_by_name.clear()

        for node in all_nodes:
            self.nodes_by_id[node.id] = node
            self.symbols_by_name.setdefault(node.name, []).append(node)
            self.graph.add_node(node.id, **node.model_dump())

        for edge in all_edges:
            self.graph.add_edge(edge.source_id, edge.target_id, kind=edge.kind)

        # Save to SQLite
        self._persist_to_db(all_nodes, all_edges)

        return {
            "status": "indexed",
            "files_scanned": processed_files,
            "total_symbols": len(all_nodes),
            "total_relationships": len(all_edges),
            "root_path": str(root),
        }

    def _persist_to_db(self, nodes: List[SymbolNode], edges: List[SymbolEdge]):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM nodes")
            conn.execute("DELETE FROM edges")
            conn.executemany(
                "INSERT INTO nodes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    (
                        n.id,
                        n.name,
                        n.kind,
                        n.file_path,
                        n.start_line,
                        n.end_line,
                        n.docstring,
                        n.signature,
                        json.dumps(n.metadata),
                    )
                    for n in nodes
                ],
            )
            conn.executemany(
                "INSERT OR IGNORE INTO edges VALUES (?, ?, ?, ?)",
                [(e.source_id, e.target_id, e.kind, json.dumps(e.metadata)) for e in edges],
            )
            conn.commit()

    def find_symbol(self, name: str, kind: Optional[str] = None) -> List[SymbolNode]:
        """Finds all occurrences of a symbol by name."""
        matches = self.symbols_by_name.get(name, [])
        if kind:
            matches = [m for m in matches if m.kind == kind]
        return matches

    def get_call_hierarchy(self, symbol_name: str, direction: str = "incoming") -> List[Dict[str, Any]]:
        """
        Traces call hierarchy:
        - direction='incoming': who calls this symbol? (callers)
        - direction='outgoing': what does this symbol call? (callees)
        """
        results = []
        matching_nodes = self.find_symbol(symbol_name)

        for sym in matching_nodes:
            if direction == "incoming":
                # Find edges targeting this symbol
                callers = []
                for u, v, data in self.graph.in_edges(sym.id, data=True):
                    caller_node = self.nodes_by_id.get(u)
                    if caller_node:
                        callers.append(caller_node.model_dump())
                # Also check matching wildcard symbols
                for u, v, data in self.graph.in_edges(f"symbol::{sym.name}", data=True):
                    caller_node = self.nodes_by_id.get(u)
                    if caller_node and caller_node.id != sym.id:
                        callers.append(caller_node.model_dump())

                results.append({"symbol": sym.model_dump(), "direction": "callers", "references": callers})
            else:
                callees = []
                for u, v, data in self.graph.out_edges(sym.id, data=True):
                    target_node = self.nodes_by_id.get(v)
                    if target_node:
                        callees.append(target_node.model_dump())
                    else:
                        callees.append({"id": v, "name": v.replace("symbol::", "")})
                results.append({"symbol": sym.model_dump(), "direction": "callees", "invocations": callees})

        return results

    def get_impact_analysis(self, target_file: Optional[str] = None, symbol_name: Optional[str] = None) -> ImpactResult:
        """
        Calculates the blast radius / impact of modifying a specific file or symbol.
        """
        direct_dependents: Set[str] = set()
        indirect_dependents: Set[str] = set()
        affected_files: Set[str] = set()

        seed_nodes: List[str] = []
        if symbol_name:
            for node in self.find_symbol(symbol_name):
                seed_nodes.append(node.id)
                seed_nodes.append(f"symbol::{node.name}")
        if target_file:
            clean_path = target_file.replace("\\", "/")
            seed_nodes.append(f"file::{clean_path}")

        # 1. Direct callers / importers (1 hop)
        for seed in seed_nodes:
            if self.graph.has_node(seed):
                for pred in self.graph.predecessors(seed):
                    direct_dependents.add(pred)
                    if self.nodes_by_id.get(pred):
                        affected_files.add(self.nodes_by_id[pred].file_path)

        # 2. Transitive dependents (2 hops)
        for direct in list(direct_dependents):
            if self.graph.has_node(direct):
                for trans in self.graph.predecessors(direct):
                    if trans not in direct_dependents:
                        indirect_dependents.add(trans)
                        if self.nodes_by_id.get(trans):
                            affected_files.add(self.nodes_by_id[trans].file_path)

        total_files = len(affected_files)
        risk = "LOW"
        if total_files > 15:
            risk = "CRITICAL"
        elif total_files > 7:
            risk = "HIGH"
        elif total_files > 2:
            risk = "MEDIUM"

        return ImpactResult(
            target_symbol=symbol_name or "N/A",
            target_file=target_file or "N/A",
            direct_dependents=list(direct_dependents),
            indirect_dependents=list(indirect_dependents),
            total_affected_files=list(affected_files),
            risk_score=risk,
        )

    def get_file_dependencies(self, file_path: str) -> Dict[str, Any]:
        """Lists all files and modules imported by a specific file."""
        clean_path = file_path.replace("\\", "/")
        file_id = f"file::{clean_path}"

        imports = []
        contained_symbols = []

        if self.graph.has_node(file_id):
            for u, v, data in self.graph.out_edges(file_id, data=True):
                if data.get("kind") == "IMPORTS":
                    imports.append(v.replace("module::", "").replace("import::", ""))
                elif data.get("kind") == "CONTAINS":
                    node = self.nodes_by_id.get(v)
                    if node:
                        contained_symbols.append(node.model_dump())

        return {
            "file": clean_path,
            "imports": imports,
            "declared_symbols": contained_symbols,
        }
