"""
Multi-Project Configuration Schema for Autonomous Coding Agent.
Defines isolated settings per repository/project.
"""

from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field

class LLMSettings(BaseModel):
    provider: Literal["openai", "anthropic", "google", "azure"] = "openai"
    model: str = "gpt-5.1-codex-mini"
    api_key: Optional[str] = None
    temperature: float = 0.2
    max_tokens: int = 4096

class GitSettings(BaseModel):
    provider: Literal["github", "gitlab", "bitbucket"] = "github"
    owner: str
    repo: str
    default_branch: str = "main"
    target_branch: str = "main"
    token: Optional[str] = None
    enable_pr_comments: bool = True
    auto_trigger_on_push: bool = True

class JiraSettings(BaseModel):
    base_url: str
    email: str
    api_token: str
    project_key: str
    issue_type: str = "Bug"
    trigger_status: str = "Ready for Agent"
    status_working: str = "Agent Working"
    status_pr_created: str = "PR Created"
    status_failed: str = "Agent Failed"
    status_mappings: List[Dict[str, str]] = Field(default_factory=list)

class TestRunnerSettings(BaseModel):
    framework: Literal["vitest", "jest", "playwright", "cypress", "pytest"] = "vitest"
    config_path: Optional[str] = None
    test_command: str = "npm test"
    lint_command: str = "npm run lint"
    build_command: str = "npm run build"
    timeout_minutes: int = 10

class RAGSettings(BaseModel):
    docs_path: str = "./docs"
    chroma_collection: str
    embedding_model: str = "text-embedding-3-small"
    chunk_size: int = 512
    chunk_overlap: int = 64

class GooseSettings(BaseModel):
    model: str = "claude-3-7-sonnet"
    autonomy_level: Literal["suggest", "semi-autonomous", "full-autonomous"] = "semi-autonomous"
    sandbox_dir: str = "/workspace"
    max_iterations: int = 25
    require_approval_for_dangerous_commands: bool = True

class NotificationSettings(BaseModel):
    slack_webhook_url: Optional[str] = None
    slack_channel: str = "#agent-escalations"
    notify_on_failure: bool = True
    notify_on_pr: bool = True

class ProjectConfig(BaseModel):
    project_id: str                      # Unique key e.g. "PAY", "WEB", "CORE"
    name: str                            # Human display name
    organization: str = "Enterprise Org"
    environment: str = "production"
    enabled: bool = True
    llm: LLMSettings = Field(default_factory=LLMSettings)
    git: GitSettings
    jira: JiraSettings
    test_runner: TestRunnerSettings = Field(default_factory=TestRunnerSettings)
    rag: RAGSettings
    goose: GooseSettings = Field(default_factory=GooseSettings)
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)
