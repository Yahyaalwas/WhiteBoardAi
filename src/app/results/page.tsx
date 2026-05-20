"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Download, CheckSquare, AlertTriangle, FileText, Printer } from "lucide-react";

interface Task { title: string; owner: string; priority: string; }
interface Result {
  summary: string;
  decisions: string[];
  tasks: Task[];
  risks: string[];
  blockers: string[];
  extracted_text: string;
  language: string;
}

function downloadMd(result: Result) {
  const lines = [
    "# BoardIQ — Whiteboard Notes\n",
    `## Summary\n${result.summary}\n`,
    result.decisions.length ? `## Decisions\n${result.decisions.map(d => `- ${d}`).join("\n")}\n` : "",
    result.tasks.length ? `## Tasks\n${result.tasks.map(t => `- [ ] **${t.title}**${t.owner ? ` — ${t.owner}` : ""} (${t.priority})`).join("\n")}\n` : "",
    result.risks.length ? `## Risks\n${result.risks.map(r => `- ${r}`).join("\n")}\n` : "",
    result.blockers.length ? `## Blockers\n${result.blockers.map(b => `- ${b}`).join("\n")}\n` : "",
    result.extracted_text ? `## Extracted Text\n\`\`\`\n${result.extracted_text}\n\`\`\`\n` : "",
  ].filter(Boolean).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines], { type: "text/markdown" }));
  a.download = "boardiq-notes.md";
  a.click();
}

function downloadJson(result: Result) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
  a.download = "boardiq-notes.json";
  a.click();
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "tasks" | "text">("summary");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("boardiq_result");
    const img = sessionStorage.getItem("boardiq_image");
    if (!r) { router.push("/"); return; }
    setResult(JSON.parse(r));
    if (img) setImage(img);
  }, [router]);

  if (!result) return null;

  const allDecisions = result.decisions || [];
  const allRisks = [...(result.risks || []), ...(result.blockers || [])];

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-card { border: 1px solid #ddd !important; background: white !important; }
          .print-text { color: #333 !important; }
          .print-muted { color: #666 !important; }
        }
      `}</style>

      <main className="min-h-screen bg-[#0a0a0f]">
        {/* header */}
        <header className="no-print sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">BoardIQ</span>
            </div>
            <div className="ml-auto relative">
              <button
                onClick={() => setShowExport(v => !v)}
                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {showExport && (
                <div className="absolute right-0 top-full mt-1 bg-[#141420] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 w-44">
                  <button
                    onClick={() => { window.print(); setShowExport(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Save as PDF
                  </button>
                  <button
                    onClick={() => { downloadMd(result); setShowExport(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
                  >
                    <FileText className="w-4 h-4" /> Markdown
                  </button>
                  <button
                    onClick={() => { downloadJson(result); setShowExport(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
                  >
                    <FileText className="w-4 h-4" /> JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* image */}
          {image && (
            <div className="print-card rounded-xl overflow-hidden border border-white/8 max-h-52">
              <img src={image} alt="whiteboard" className="w-full h-full object-cover" />
            </div>
          )}

          {/* summary */}
          <div className="print-card rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <p className="print-muted text-white/30 text-xs font-medium uppercase tracking-wider mb-2">AI Summary</p>
            <p className="print-text text-white/80 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* tabs — hidden when printing */}
          <div className="no-print flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
            {([
              { id: "summary", label: "Decisions & Risks", icon: AlertTriangle },
              { id: "tasks",   label: "Tasks",             icon: CheckSquare },
              { id: "text",    label: "Extracted Text",    icon: FileText },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  tab === id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>

          {/* decisions & risks — shown in tab or always in print */}
          <div className={tab === "summary" ? "" : "no-print hidden"}>
            {allDecisions.length > 0 && (
              <div className="print-card rounded-xl border border-white/8 bg-white/[0.02] p-5 mb-4">
                <p className="print-muted text-white/30 text-xs font-medium uppercase tracking-wider mb-3">Decisions</p>
                <ul className="space-y-2">
                  {allDecisions.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {allRisks.length > 0 && (
              <div className="print-card rounded-xl border border-amber-500/15 bg-amber-500/5 p-5">
                <p className="print-muted text-amber-400/60 text-xs font-medium uppercase tracking-wider mb-3">Risks & Blockers</p>
                <ul className="space-y-2">
                  {allRisks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {allDecisions.length === 0 && allRisks.length === 0 && (
              <p className="text-white/20 text-sm text-center py-8">No decisions or risks detected</p>
            )}
          </div>

          {/* tasks */}
          <div className={tab === "tasks" ? "" : "no-print hidden"}>
            {result.tasks.length > 0 ? (
              <div className="space-y-2">
                {result.tasks.map((task, i) => (
                  <div key={i} className="print-card flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === "high" ? "bg-red-400" :
                      task.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="print-text text-white/80 text-sm">{task.title}</p>
                      {task.owner && <p className="print-muted text-white/30 text-xs mt-0.5">{task.owner}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high" ? "bg-red-500/10 text-red-400" :
                      task.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-sm text-center py-8">No tasks detected</p>
            )}
          </div>

          {/* extracted text */}
          <div className={tab === "text" ? "" : "no-print hidden"}>
            <div className="print-card rounded-xl border border-white/8 bg-white/[0.02] p-5">
              <p className="print-muted text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
                Raw extracted text · {result.language}
              </p>
              {result.extracted_text ? (
                <pre className="print-text text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {result.extracted_text}
                </pre>
              ) : (
                <p className="text-white/20 text-sm">No text could be extracted from this image.</p>
              )}
            </div>
          </div>

          {/* print: show all sections */}
          <div className="hidden print:block space-y-4">
            {result.tasks.length > 0 && (
              <div className="print-card rounded-xl border border-white/8 p-5">
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{color:"#666"}}>Tasks</p>
                <ul className="space-y-1.5">
                  {result.tasks.map((t, i) => (
                    <li key={i} className="text-sm" style={{color:"#333"}}>
                      ☐ {t.title}{t.owner ? ` — ${t.owner}` : ""} [{t.priority}]
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.extracted_text && (
              <div className="print-card rounded-xl border border-white/8 p-5">
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{color:"#666"}}>Extracted Text</p>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono" style={{color:"#333"}}>
                  {result.extracted_text}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
