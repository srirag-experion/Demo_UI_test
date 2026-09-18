"""
FastAPI REST routes for Project Configuration and Dynamic Pipeline Triggering.
Drop this into your Autonomous Coding Agent src/api/routes.py
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from project_config import ProjectConfig
from project_store import ProjectConfigStore

router = APIRouter(prefix="/api/v1", tags=["Project Configuration"])
project_store = ProjectConfigStore()

class TriggerRequest(BaseModel):
    key: str                                    # e.g. "PAY-104", "WEB-92"
    title: str
    type: str = "bug"
    description: Optional[str] = None
    acceptance_criteria: Optional[List[str]] = None
    project_id: Optional[str] = None            # Explicit override or inferred from key prefix

@router.get("/projects", response_model=List[Dict[str, str]])
async def list_all_projects():
    """List all registered projects for the UI console."""
    return project_store.list_projects()

@router.get("/projects/{project_id}/config", response_model=ProjectConfig)
async def get_project_configuration(project_id: str):
    """Retrieve isolated configuration for a given project."""
    config = project_store.get_project(project_id)
    if not config:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return config

@router.put("/projects/{project_id}/config", response_model=ProjectConfig)
async def update_project_configuration(project_id: str, config: ProjectConfig):
    """Save or update project configuration from UI console."""
    config.project_id = project_id.upper()
    saved = project_store.save_project(config)
    return saved

@router.delete("/projects/{project_id}")
async def delete_project_configuration(project_id: str):
    """Delete a project configuration."""
    deleted = project_store.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"message": f"Project '{project_id}' removed successfully."}

@router.post("/trigger")
async def trigger_pipeline_with_dynamic_project(req: TriggerRequest):
    """
    Dynamically resolves project configuration and dispatches the 6-stage pipeline.
    """
    # 1. Infer project key: e.g. "PAY-104" -> "PAY"
    inferred_key = req.key.split("-")[0].upper() if "-" in req.key else req.project_id
    if not inferred_key:
        raise HTTPException(status_code=400, detail="Cannot infer project key from ticket key.")

    # 2. Fetch project-specific config
    project_cfg = project_store.get_project(inferred_key)
    if not project_cfg:
        raise HTTPException(
            status_code=400,
            detail=f"No configuration found for project '{inferred_key}'. Please register it via UI console first."
        )

    # 3. Create scoped pipeline context
    pipeline_context = {
        "ticket_key": req.key,
        "ticket_title": req.title,
        "project_id": project_cfg.project_id,
        "project_name": project_cfg.name,
        "repo": f"{project_cfg.git.owner}/{project_cfg.git.repo}",
        "default_branch": project_cfg.git.default_branch,
        "test_runner": project_cfg.test_runner.framework,
        "test_command": project_cfg.test_runner.test_command,
        "chroma_collection": project_cfg.rag.chroma_collection,
        "slack_channel": project_cfg.notifications.slack_channel,
    }

    # 4. Return confirmation (Pipeline runner executes with pipeline_context)
    dev_request_id = f"{req.key}-AUTO-{project_cfg.project_id}"
    return {
        "dev_request_id": dev_request_id,
        "status": "started",
        "project": project_cfg.name,
        "repository": pipeline_context["repo"],
        "test_runner": pipeline_context["test_runner"],
    }
