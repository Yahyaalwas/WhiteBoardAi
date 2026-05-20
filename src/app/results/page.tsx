"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Download, CheckSquare, AlertTriangle, FileText } from "lucide-react";

interface Result {
  summary: string;
  decisions: string[];
  tasks: { title: string; owner: string; priority: string }[];
  risks: string[];
  extracted_text: string;
  language: string;
}

function download(content: string, filename: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "tasks" | "text">("summary");

  useEffect(() => {
    const r = sessionStorage.getItem("boardiq_result");
    const img = sessionStorage.getItem("boardiq_image");
    if (!r) { router.push("/"); return; }
    setResult(JSON.parse(r));
    if (img) setImage(img);
  }, [router]);

  if (!result) return null;

  const exportMd = () => {
    const md = [
      "# BoardIQ Summary\n",
      `## Summary\n${result.summary}\n`,
      `## Decisions\n${result.decisions.map(d => `- ${d}`).join("\n")}\n`,
      `## Tasks\n${result.tasks.map(t => `- [ ] ${t.title} (${t.owner}, ${t.priority})`).join("\n")}\n`,
      `## Risks\n${result.risks.map(r => `- ${r}`).join("\n")}\n`,
    ].join("\n");
    download(md, "boardiq-notes.md", "text/markdown");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-sm">
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
          <div className="ml-auto">
            <button
              onClick={exportMd}
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* image thumbnail */}
        {image && (
          <div className="rounded-xl overflow-hidden border border-white/8 max-h-48">
            <img src={image} alt="board" className="w-full h-full object-cover" />
          </div>
        )}

        {/* summary card */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-2">Summary</p>
          <p className="text-white/80 text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          {([
            { id: "summary", label: "Decisions & Risks", icon: AlertTriangle },
            { id: "tasks", label: "Tasks", icon: CheckSquare },
            { id: "text", label: "Extracted Text", icon: FileText },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                tab === id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* tab content */}
        {tab === "summary" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">Decisions</p>
              <ul className="space-y-2">
                {result.decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            {result.risks.length > 0 && (
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-5">
                <p className="text-amber-400/60 text-xs font-medium uppercase tracking-wider mb-3">Risks</p>
                <ul className="space-y-2">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "tasks" && (
          <div className="space-y-2">
            {result.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === "high" ? "bg-red-400" :
                  task.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm">{task.title}</p>
                  {task.owner && <p className="text-white/30 text-xs mt-0.5">{task.owner}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === "high" ? "bg-red-500/10 text-red-400" :
                  task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "text" && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
              Raw extracted text · {result.language}
            </p>
            <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {result.extracted_text}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
