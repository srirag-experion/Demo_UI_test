"""
AST Codebase Parser for Codebase Memory MCP.
Parses Python, TypeScript, and JavaScript to extract classes, functions, calls, and imports.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

class ASTCodeParser:
    def __init__(self, repo_path: str = ".", auth_token: Optional[str] = None, branch: str = "main"):
        self.raw_path = repo_path
        self.auth_token = auth_token
        self.branch = branch
        self.repo_path = self._resolve_or_clone(repo_path)

    def _resolve_or_clone(self, path_or_url: str) -> Path:
        """Resolves local directory or clones remote private/public Git repository."""
        p = Path(path_or_url)
        if p.exists():
            return p

        # If it's a remote URL
        if path_or_url.startswith("http://") or path_or_url.startswith("https://") or path_or_url.startswith("git@"):
            try:
                import git
                clone_url = path_or_url
                if self.auth_token and "github.com" in path_or_url and "https://" in path_or_url:
                    # Inject PAT into HTTPS URL: https://<token>@github.com/org/repo.git
                    clone_url = path_or_url.replace("https://", f"https://{self.auth_token}@")
                
                cache_dir = Path.home() / ".codegraph_cache" / Path(path_or_url).stem
                if not cache_dir.exists():
                    cache_dir.parent.mkdir(parents=True, exist_ok=True)
                    git.Repo.clone_from(clone_url, cache_dir, branch=self.branch, depth=1)
                return cache_dir
            except Exception as err:
                print(f"[CodeGraph Parser] Git Clone Note: {err}")
                return p
        return p

    @classmethod
    def parse_repo_path(cls, path: str = ".", auth_token: Optional[str] = None, branch: str = "main") -> Dict[str, Any]:
        parser = cls(path, auth_token=auth_token, branch=branch)
        return parser.parse_repository()

    def parse_repository(self) -> Dict[str, Any]:
        """
        Scans all files in the repository and extracts symbols and import graphs.
        """
        symbols = []
        calls = []
        schemas = []

        if not self.repo_path.exists():
            return {"symbols": [], "calls": [], "schemas": []}

        for file_path in self.repo_path.rglob("*"):
            if any(part.startswith(".") or part in ["node_modules", "dist", "__pycache__", "venv"] for part in file_path.parts):
                continue

            if file_path.suffix in [".ts", ".tsx", ".js", ".jsx"]:
                res = self._parse_typescript_file(file_path)
                symbols.extend(res["symbols"])
                calls.extend(res["calls"])
                schemas.extend(res["schemas"])
            elif file_path.suffix == ".py":
                res = self._parse_python_file(file_path)
                symbols.extend(res["symbols"])
                calls.extend(res["calls"])
                schemas.extend(res["schemas"])

        return {
            "symbols": symbols,
            "calls": calls,
            "schemas": schemas,
        }

    def _parse_typescript_file(self, file_path: Path) -> Dict[str, Any]:
        rel_path = str(file_path.relative_to(self.repo_path))
        symbols = []
        calls = []
        schemas = []

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            lines = content.splitlines()

            # Extract classes / interfaces
            for idx, line in enumerate(lines):
                # Interface / Type / Schema detection
                if re.match(r"^\s*export\s+(interface|type)\s+([A-Za-z0-9_]+)", line):
                    match = re.search(r"(interface|type)\s+([A-Za-z0-9_]+)", line)
                    if match:
                        symbols.append({"name": match.group(2), "type": "schema", "file": rel_path, "line": idx + 1})
                        schemas.append({"name": match.group(2), "file": rel_path, "type": "TypeScript Interface"})

                # Exported Functions / Consts
                elif re.match(r"^\s*export\s+(const|function|class)\s+([A-Za-z0-9_]+)", line):
                    match = re.search(r"(const|function|class)\s+([A-Za-z0-9_]+)", line)
                    if match:
                        name = match.group(2)
                        stype = "api" if "Route" in name or "Controller" in name or "handler" in name.lower() else "service"
                        symbols.append({"name": name, "type": stype, "file": rel_path, "line": idx + 1})

        except Exception as e:
            print(f"Error parsing TS file {file_path}: {e}")

        return {"symbols": symbols, "calls": calls, "schemas": schemas}

    def _parse_python_file(self, file_path: Path) -> Dict[str, Any]:
        rel_path = str(file_path.relative_to(self.repo_path))
        symbols = []
        calls = []
        schemas = []

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            lines = content.splitlines()

            for idx, line in enumerate(lines):
                # Class / BaseModel
                if re.match(r"^\s*class\s+([A-Za-z0-9_]+)", line):
                    match = re.search(r"class\s+([A-Za-z0-9_]+)(\((.*?)\))?", line)
                    if match:
                        class_name = match.group(1)
                        parent = match.group(3) or ""
                        stype = "database" if "BaseModel" in parent or "Model" in parent or "Base" in parent else "service"
                        symbols.append({"name": class_name, "type": stype, "file": rel_path, "line": idx + 1})
                        if stype == "database":
                            schemas.append({"name": class_name, "file": rel_path, "type": "Pydantic / ORM Model"})

                # Async or Sync Defs
                elif re.match(r"^\s*(async\s+)?def\s+([A-Za-z0-9_]+)", line):
                    match = re.search(r"def\s+([A-Za-z0-9_]+)", line)
                    if match:
                        func_name = match.group(1)
                        if not func_name.startswith("__"):
                            stype = "api" if "route" in rel_path or "endpoint" in rel_path else "service"
                            symbols.append({"name": func_name, "type": stype, "file": rel_path, "line": idx + 1})

        except Exception as e:
            print(f"Error parsing Python file {file_path}: {e}")

        return {"symbols": symbols, "calls": calls, "schemas": schemas}

# Alias for backward compatibility
RepoParser = ASTCodeParser
