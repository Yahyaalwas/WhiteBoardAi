from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum
import uuid
from datetime import datetime


class TaskPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in-progress"
    done = "done"


class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    owner: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.medium
    deadline: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.todo


class FlowNode(BaseModel):
    id: str
    label: str
    type: Optional[str] = "process"


class FlowEdge(BaseModel):
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    label: Optional[str] = None

    class Config:
        populate_by_name = True


class FlowchartData(BaseModel):
    mermaid: Optional[str] = None
    nodes: Optional[List[FlowNode]] = None
    edges: Optional[List[FlowEdge]] = None


class Contributor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    handwriting_style: Optional[str] = None
    items: Optional[List[str]] = None
    color: Optional[str] = None


class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["processing", "complete", "error"] = "processing"
    original_image_url: Optional[str] = None
    processed_image_url: Optional[str] = None
    extracted_text: Optional[str] = None
    language_detected: Optional[List[str]] = None
    summary: Optional[str] = None
    decisions: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    blockers: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    tasks: Optional[List[Task]] = None
    flowchart: Optional[FlowchartData] = None
    contributors: Optional[List[Contributor]] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    error_message: Optional[str] = None


class UploadResponse(BaseModel):
    session_id: str
    message: str = "Image uploaded successfully"


class AnalyzeResponse(BaseModel):
    analysis_id: str
    status: str = "processing"
