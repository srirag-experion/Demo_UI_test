"""
Storage Manager for Project Configurations.
Persists isolated JSON config files under ./config/projects/
"""

import json
from pathlib import Path
from typing import List, Optional, Dict
from project_config import ProjectConfig

class ProjectConfigStore:
    def __init__(self, storage_dir: str = "./config/projects"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def get_project(self, project_id: str) -> Optional[ProjectConfig]:
        """Fetch project configuration by ID (case-insensitive)."""
        file_path = self.storage_dir / f"{project_id.upper()}.json"
        if not file_path.exists():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return ProjectConfig.model_validate(data)
        except Exception as e:
            print(f"Error loading project config {project_id}: {e}")
            return None

    def save_project(self, config: ProjectConfig) -> ProjectConfig:
        """Save or update project configuration."""
        file_path = self.storage_dir / f"{config.project_id.upper()}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(config.model_dump_json(indent=2))
        return config

    def list_projects(self) -> List[Dict[str, str]]:
        """List all registered projects summary."""
        projects = []
        for file in self.storage_dir.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    projects.append({
                        "project_id": data.get("project_id", file.stem),
                        "name": data.get("name", file.stem),
                        "org": data.get("organization", "Default Org"),
                        "repo": f"{data.get('git', {}).get('owner', '')}/{data.get('git', {}).get('repo', '')}",
                        "runner": data.get("test_runner", {}).get("framework", "vitest"),
                    })
            except Exception:
                continue
        return projects

    def delete_project(self, project_id: str) -> bool:
        """Delete a project configuration file."""
        file_path = self.storage_dir / f"{project_id.upper()}.json"
        if file_path.exists():
            file_path.unlink()
            return True
        return False
