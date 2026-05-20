export interface AnalysisResult {
  id: string;
  status: "processing" | "complete" | "error";
  original_image_url?: string;
  processed_image_url?: string;
  extracted_text?: string;
  language_detected?: string[];
  summary?: string;
  decisions?: string[];
  risks?: string[];
  blockers?: string[];
  dependencies?: string[];
  tasks?: Task[];
  flowchart?: FlowchartData;
  contributors?: Contributor[];
  sections?: BoardSection[];
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  owner?: string;
  priority?: "high" | "medium" | "low";
  deadline?: string;
  status?: "todo" | "in-progress" | "done";
}

export interface FlowchartData {
  mermaid?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}

export interface FlowNode {
  id: string;
  label: string;
  type?: "start" | "end" | "process" | "decision" | "data";
  x?: number;
  y?: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Contributor {
  id: string;
  label: string;
  handwriting_style?: string;
  items?: string[];
  color?: string;
}

export interface BoardSection {
  id: string;
  type: "heading" | "bullets" | "tasks" | "diagram" | "note";
  title?: string;
  content?: string | string[];
  items?: string[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
  duration?: number;
}

export interface ExportFormat {
  type: "pdf" | "markdown" | "json" | "mermaid" | "notion";
  label: string;
  icon: string;
}
