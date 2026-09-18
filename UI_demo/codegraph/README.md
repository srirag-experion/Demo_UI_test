# Codebase Memory MCP & Data Structure Visualizer (`codegraph`)

A Model Context Protocol (MCP) server and interactive visualizer providing cross-session codebase intelligence, call graphs, data structure ER diagrams, and impact blast-radius analysis.

## Features

1. **AST Call Graph**: Discovers callers and callees for any class or method.
2. **Data Structure & Schema Viewer**: Auto-extracts database models, Pydantic schemas, and TypeScript interfaces into Entity-Relationship (ER) cards.
3. **Impact Blast-Radius**: Identifies affected callers and mandatory unit tests when modifying any file.
4. **Learned Architectural Rules**: Persists project invariants to prevent recurring agent mistakes.
5. **Multi-Project Aware**: Dynamically switches graphs when switching projects (`ASTRA-CORE`, `PAY-API`, `WEB-PORTAL`).

## Running the MCP Server

```bash
cd codegraph/mcp_server
pip install -r requirements.txt
python server.py
```
