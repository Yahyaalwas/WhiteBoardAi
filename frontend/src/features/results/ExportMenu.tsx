"use client";
import { useState } from "react";
import { FileText, Code, FileJson, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { downloadBlob } from "@/lib/utils";
import toast from "react-hot-toast";

const EXPORT_OPTIONS = [
  { format: "markdown", label: "Markdown", icon: FileText, ext: "md" },
  { format: "json", label: "JSON", icon: FileJson, ext: "json" },
  { format: "mermaid", label: "Mermaid", icon: Code, ext: "mmd" },
];

function generateMarkdown(result: AnalysisResult): string {
  const lines: string[] = ["# BoardIQ Analysis Report", ""];
  if (result.summary) lines.push("## Executive Summary", result.summary, "");
  if (result.decisions?.length) lines.push("## Decisions", ...result.decisions.map(d => `- ${d}`), "");
  if (result.risks?.length) lines.push("## Risks", ...result.risks.map(r => `- ${r}`), "");
  if (result.blockers?.length) lines.push("## Blockers", ...result.blockers.map(b => `- ${b}`), "");
  if (result.tasks?.length) {
    lines.push("## Action Items");
    result.tasks.forEach(t => lines.push(`- [ ] **${t.title}** — Owner: ${t.owner || "TBD"} | Priority: ${t.priority || "medium"}`));
    lines.push("");
  }
  if (result.flowchart?.mermaid) lines.push("## Flowchart", "```mermaid", result.flowchart.mermaid, "```", "");
  if (result.extracted_text) lines.push("## Extracted Text", "```", result.extracted_text, "```", "");
  return lines.join("\n");
}

export function ExportMenu({ result }: { result: AnalysisResult }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: string, ext: string) => {
    setLoading(format);
    try {
      let content = "";
      const filename = `boardiq-${result.id}.${ext}`;
      if (format === "json") {
        content = JSON.stringify(result, null, 2);
        downloadBlob(new Blob([content], { type: "application/json" }), filename);
      } else if (format === "markdown") {
        content = generateMarkdown(result);
        downloadBlob(new Blob([content], { type: "text/markdown" }), filename);
      } else if (format === "mermaid") {
        content = result.flowchart?.mermaid || "";
        downloadBlob(new Blob([content], { type: "text/plain" }), filename);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {EXPORT_OPTIONS.map((opt) => (
        <button
          key={opt.format}
          onClick={() => handleExport(opt.format, opt.ext)}
          disabled={!!loading}
          className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-50"
        >
          {loading === opt.format ? <Loader2 className="w-4 h-4 animate-spin" /> : <opt.icon className="w-4 h-4" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
