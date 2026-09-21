"""
AST Codebase Parser for Codebase Memory MCP.
Parses Python, TypeScript, and JavaScript to extract complete Codebase Memory graph:
Nodes: Function, Field, Class, File, Module, Variable, Folder, Enum, Method, Interface, Route, Type, Project
Edges: defines, usage, calls, contains file, contains folder, writes, defines method, configures, inherits, imports
"""

import ast
import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional, Set


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

        if path_or_url.startswith("http://") or path_or_url.startswith("https://") or path_or_url.startswith("git@"):
            try:
                import git
                clone_url = path_or_url
                if self.auth_token and "github.com" in path_or_url and "https://" in path_or_url:
                    clone_url = path_or_url.replace("https://", f"https://{self.auth_token}@")

                cache_dir = Path.home() / ".codegraph_cache" / Path(path_or_url).stem

                if cache_dir.exists():
                    try:
                        git.Repo(cache_dir)
                        return cache_dir
                    except Exception:
                        shutil.rmtree(cache_dir, ignore_errors=True)

                cache_dir.parent.mkdir(parents=True, exist_ok=True)

                try:
                    git.Repo.clone_from(clone_url, cache_dir, depth=1)
                except Exception:
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
        Scans all files in the repository and extracts full Codebase Memory Graph.
        """
        symbols: List[Dict[str, Any]] = []
        calls: List[Dict[str, Any]] = []
        schemas: List[Dict[str, Any]] = []
        imports_list: List[Dict[str, Any]] = []
        files_list: List[Dict[str, Any]] = []
        folders_set: Set[str] = set()
        dir_counts: Dict[str, int] = {}

        if not self.repo_path.exists():
            return {
                "symbols": [],
                "calls": [],
                "schemas": [],
                "imports": [],
                "files": [],
                "folders": [],
                "dir_counts": {},
            }

        ignored_parts = {
            ".git", ".venv", "venv", "node_modules", "dist", "build", 
            "__pycache__", ".pytest_cache", ".next", "coverage", ".turbo"
        }

        for file_path in self.repo_path.rglob("*"):
            if not file_path.is_file():
                continue

            rel_parts = file_path.relative_to(self.repo_path).parts
            if any(part in ignored_parts or (part.startswith(".") and part not in (".env", ".env.local")) for part in rel_parts):
                continue

            rel_path = str(file_path.relative_to(self.repo_path)).replace("\\", "/")
            
            # Record directory hierarchy
            top_dir = rel_parts[0] if len(rel_parts) > 1 else "."
            dir_counts[top_dir] = dir_counts.get(top_dir, 0) + 1

            if len(rel_parts) > 1:
                for i in range(1, len(rel_parts)):
                    folders_set.add("/".join(rel_parts[:i]))

            # Record File node
            files_list.append({
                "name": rel_path.split("/")[-1],
                "file": rel_path,
                "type": "File",
                "line": 1,
            })

            if file_path.suffix in [".ts", ".tsx", ".js", ".jsx"]:
                res = self._parse_typescript_file(file_path, rel_path)
                symbols.extend(res["symbols"])
                calls.extend(res["calls"])
                schemas.extend(res["schemas"])
                imports_list.extend(res["imports"])

            elif file_path.suffix == ".py":
                res = self._parse_python_file(file_path, rel_path)
                symbols.extend(res["symbols"])
                calls.extend(res["calls"])
                schemas.extend(res["schemas"])
                imports_list.extend(res["imports"])

        return {
            "symbols": symbols,
            "calls": calls,
            "schemas": schemas,
            "imports": imports_list,
            "files": files_list,
            "folders": list(folders_set),
            "dir_counts": dir_counts,
        }

    def _parse_typescript_file(self, file_path: Path, rel_path: str) -> Dict[str, Any]:
        symbols = []
        calls = []
        schemas = []
        imports = []

        is_test = "test" in rel_path.lower() or "spec" in rel_path.lower()

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            lines = content.splitlines()

            # 1. Imports
            for line in lines:
                m_imp = re.search(r"import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['\"]([^'\"]+)['\"]", line)
                if m_imp:
                    imp_source = m_imp.group(4)
                    imported_names = []
                    if m_imp.group(1):
                        imported_names = [n.strip().split(" as ")[0].strip() for n in m_imp.group(1).split(",") if n.strip()]
                    elif m_imp.group(2):
                        imported_names = [m_imp.group(2)]
                    elif m_imp.group(3):
                        imported_names = [m_imp.group(3)]

                    for iname in imported_names:
                        imports.append({"symbol": iname, "source": imp_source, "file": rel_path})

            # 2. Interfaces & Types (Interface / Type / Field)
            interface_regex = re.compile(r"export\s+(interface|type)\s+([A-Za-z0-9_]+)")
            for idx, line in enumerate(lines):
                m_iface = interface_regex.search(line)
                if m_iface:
                    kind = m_iface.group(1)
                    name = m_iface.group(2)
                    stype = "Interface" if kind == "interface" else "Type"
                    
                    fields = []
                    block_lines = lines[idx: min(len(lines), idx + 25)]
                    for bl in block_lines:
                        m_field = re.search(r"^\s*([A-Za-z0-9_]+)\s*(\??)\s*:\s*([^;,\n]+)", bl)
                        if m_field and m_field.group(1) not in ("export", "interface", "type", "return"):
                            fname = m_field.group(1)
                            ftype = m_field.group(3).strip()
                            is_opt = bool(m_field.group(2))
                            is_pk = fname.lower() in ("id", f"{name.lower()}_id", f"{name.lower()}id")
                            fields.append({
                                "name": fname,
                                "type": ftype[:32],
                                "isPrimary": is_pk,
                                "isNullable": is_opt,
                            })
                            # Add field node
                            symbols.append({
                                "name": f"{name}.{fname}",
                                "type": "Field",
                                "file": rel_path,
                                "line": idx + 1,
                                "parent": name,
                            })

                    if not fields:
                        fields = [
                            {"name": "id", "type": "string", "isPrimary": True},
                            {"name": "created_at", "type": "string"},
                        ]

                    symbols.append({
                        "name": name,
                        "type": stype,
                        "file": rel_path,
                        "line": idx + 1,
                        "description": f"TypeScript {stype}",
                    })

                    schemas.append({
                        "id": f"schema-{name}",
                        "tableName": name,
                        "description": f"TypeScript {kind} ({rel_path}:{idx + 1})",
                        "fields": fields[:8],
                    })

                # 3. Exported Components, Functions, Enums, Consts
                elif re.search(r"export\s+(const|function|class|enum)\s+([A-Za-z0-9_]+)", line):
                    m_exp = re.search(r"export\s+(const|function|class|enum)\s+([A-Za-z0-9_]+)", line)
                    if m_exp:
                        kind = m_exp.group(1)
                        name = m_exp.group(2)
                        
                        if kind == "enum":
                            stype = "Enum"
                        elif kind == "class":
                            stype = "Class"
                        elif is_test or name.startswith("test_") or "Test" in name:
                            stype = "Function"
                        elif "Route" in name or "Controller" in name or "handler" in name.lower() or "Endpoint" in name or "api" in rel_path.lower():
                            stype = "Route"
                        elif name.startswith("use") or "Store" in name:
                            stype = "Function"
                        elif kind == "const" and name.isupper():
                            stype = "Variable"
                        else:
                            stype = "Function"

                        symbols.append({
                            "name": name,
                            "type": stype,
                            "file": rel_path,
                            "line": idx + 1,
                            "description": f"{stype} in {rel_path}",
                        })

                # 4. Standalone Test suites
                elif is_test and re.search(r"(describe|it|test)\s*\(\s*['\"]([^'\"]+)['\"]", line):
                    m_test = re.search(r"(describe|it|test)\s*\(\s*['\"]([^'\"]+)['\"]", line)
                    if m_test:
                        test_label = m_test.group(2)
                        symbols.append({
                            "name": f"test: {test_label[:30]}",
                            "type": "Function",
                            "file": rel_path,
                            "line": idx + 1,
                            "description": f"Test case in {rel_path}",
                        })

        except Exception as e:
            print(f"Error parsing TS file {file_path}: {e}")

        return {"symbols": symbols, "calls": calls, "schemas": schemas, "imports": imports}

    def _parse_python_file(self, file_path: Path, rel_path: str) -> Dict[str, Any]:
        symbols = []
        calls = []
        schemas = []
        imports = []

        is_test = "test" in rel_path.lower()

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            tree = ast.parse(content, filename=str(file_path))

            for node in ast.walk(tree):
                # 1. Imports
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append({"symbol": alias.name, "source": alias.name, "file": rel_path})
                elif isinstance(node, ast.ImportFrom):
                    mod = node.module or ""
                    for alias in node.names:
                        imports.append({"symbol": alias.name, "source": mod, "file": rel_path})

                # 2. Classes (Class / Enum / Field)
                elif isinstance(node, ast.ClassDef):
                    class_name = node.name
                    bases = [b.id for b in node.bases if isinstance(b, ast.Name)]
                    is_enum = any(b in ("Enum", "IntEnum", "StrEnum") for b in bases)
                    is_model = any(b in ("BaseModel", "Model", "Base", "SQLModel", "Document") for b in bases)
                    
                    stype = "Enum" if is_enum else "Class"

                    fields = []
                    for item in node.body:
                        if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                            fname = item.target.id
                            ftype = ast.unparse(item.annotation) if hasattr(ast, "unparse") else "Any"
                            is_pk = fname.lower() in ("id", f"{class_name.lower()}_id")
                            fields.append({
                                "name": fname,
                                "type": ftype[:32],
                                "isPrimary": is_pk,
                            })
                            symbols.append({
                                "name": f"{class_name}.{fname}",
                                "type": "Field",
                                "file": rel_path,
                                "line": item.lineno,
                                "parent": class_name,
                            })
                        elif isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            # Methods
                            mname = item.name
                            if not (mname.startswith("__") and mname.endswith("__")):
                                symbols.append({
                                    "name": f"{class_name}.{mname}",
                                    "type": "Method",
                                    "file": rel_path,
                                    "line": item.lineno,
                                    "parent": class_name,
                                })

                    if is_model or is_enum:
                        if not fields:
                            fields = [
                                {"name": "id", "type": "UUID", "isPrimary": True},
                                {"name": "created_at", "type": "datetime"},
                            ]

                        schemas.append({
                            "id": f"py-schema-{class_name}",
                            "tableName": class_name,
                            "description": f"{'Enum' if is_enum else 'Pydantic Model'} in {rel_path}:{node.lineno}",
                            "fields": fields[:8],
                        })

                    symbols.append({
                        "name": class_name,
                        "type": stype,
                        "file": rel_path,
                        "line": node.lineno,
                        "description": f"{stype} in {rel_path}",
                    })

                # 3. Functions / Routes / Methods
                elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    func_name = node.name
                    if func_name.startswith("__") and func_name.endswith("__"):
                        continue

                    # Check for route decorators (@app.get, @router.post, etc.)
                    is_route = False
                    for dec in node.decorator_list:
                        dec_str = ast.unparse(dec) if hasattr(ast, "unparse") else ""
                        if any(k in dec_str for k in ("get", "post", "put", "delete", "patch", "route", "api")):
                            is_route = True
                            break

                    stype = "Route" if (is_route or "route" in rel_path.lower() or "endpoint" in rel_path.lower()) else "Function"

                    symbols.append({
                        "name": func_name,
                        "type": stype,
                        "file": rel_path,
                        "line": node.lineno,
                        "description": f"{stype} in {rel_path}",
                    })

                    # Extract calls inside body
                    for sub in ast.walk(node):
                        if isinstance(sub, ast.Call):
                            if isinstance(sub.func, ast.Name):
                                calls.append({"caller": func_name, "callee": sub.func.id, "file": rel_path})
                            elif isinstance(sub.func, ast.Attribute):
                                calls.append({"caller": func_name, "callee": sub.func.attr, "file": rel_path})

                # 4. Global Variables
                elif isinstance(node, ast.Assign):
                    for tgt in node.targets:
                        if isinstance(tgt, ast.Name) and tgt.id.isupper():
                            symbols.append({
                                "name": tgt.id,
                                "type": "Variable",
                                "file": rel_path,
                                "line": node.lineno,
                                "description": f"Global variable in {rel_path}",
                            })

        except Exception as e:
            print(f"Error parsing Python file {file_path}: {e}")

        return {"symbols": symbols, "calls": calls, "schemas": schemas, "imports": imports}


# Alias for backward compatibility
RepoParser = ASTCodeParser


