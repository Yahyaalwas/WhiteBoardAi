"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

interface Task { title: string; owner: string; priority: string }
interface Result {
  summary: string;
  decisions: string[];
  tasks: Task[];
  risks: string[];
  blockers: string[];
  extracted_text: string;
  language: string;
}

const LABELS = {
  summary:       { en: "Summary",           ar: "الملخص" },
  decisions:     { en: "Decisions",         ar: "القرارات" },
  risks:         { en: "Risks & Blockers",  ar: "المخاطر والعوائق" },
  tasks:         { en: "Action Items",      ar: "بنود العمل" },
  extractedText: { en: "Extracted Text",    ar: "النص المستخرج" },
  noContent:     { en: "None detected",     ar: "لم يتم الكشف عن أي شيء" },
  language:      { en: "Detected language", ar: "اللغة المكتشفة" },
  export:        { en: "Export",            ar: "تصدير" },
  newBoard:      { en: "New board",         ar: "سبورة جديدة" },
};

const TABS = [
  { id: "overview", en: "Overview",      ar: "نظرة عامة" },
  { id: "tasks",    en: "Action Items",  ar: "بنود العمل" },
  { id: "text",     en: "Raw Text",      ar: "النص الخام" },
] as const;

type Tab = typeof TABS[number]["id"];

const PRIORITY_COLOR: Record<string, string> = {
  high:   "#e05252",
  medium: "#c98a2e",
  low:    "#3b8e5e",
};

function download(content: string, filename: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
}

function buildMarkdown(r: Result): string {
  const lines = ["# BoardIQ — Board Notes\n"];
  if (r.summary) lines.push(`## Summary\n${r.summary}\n`);
  if (r.decisions.length) lines.push(`## Decisions\n${r.decisions.map(d => `- ${d}`).join("\n")}\n`);
  if (r.tasks.length) lines.push(`## Action Items\n${r.tasks.map(t => `- [ ] ${t.title}${t.owner ? ` (${t.owner})` : ""} [${t.priority}]`).join("\n")}\n`);
  if (r.risks.length) lines.push(`## Risks & Blockers\n${r.risks.map(x => `- ${x}`).join("\n")}\n`);
  if (r.extracted_text) lines.push(`## Extracted Text\n\`\`\`\n${r.extracted_text}\n\`\`\``);
  return lines.join("\n");
}

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("boardiq_result");
    const img = sessionStorage.getItem("boardiq_image");
    if (!r) { router.push("/"); return; }
    setResult(JSON.parse(r));
    if (img) setImage(img);
  }, [router]);

  if (!result) return null;

  const allRisks = [...(result.risks || []), ...(result.blockers || [])];

  const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "16px 18px",
      ...extra,
    }}>
      {children}
    </div>
  );

  const label = (en: string, ar: string) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{en}</span>
      <span dir="rtl" lang="ar" style={{ fontSize: 11, color: "var(--muted)" }}>{ar}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #111 !important; }
          [style*="background: var(--surface)"] { background: #f9f9f9 !important; border-color: #ddd !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header className="no-print" style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 20px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/")} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 18, padding: "4px 6px",
            display: "flex", alignItems: "center",
          }}>←</button>
          <Logo size={26} />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>BoardIQ</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language badge */}
          {result.language && (
            <span style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 4,
              border: "1px solid var(--border)", color: "var(--muted)",
            }}>
              {result.language}
            </span>
          )}

          {/* Export dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowExport(v => !v)}
              style={{
                fontSize: 13, padding: "6px 14px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 6, cursor: "pointer", color: "var(--text)",
                fontFamily: "inherit",
              }}
            >
              {LABELS.export.en} · {LABELS.export.ar}
            </button>
            {showExport && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, overflow: "hidden", minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50,
              }}>
                {[
                  { label: "Save as PDF", ar: "PDF", action: () => window.print() },
                  { label: "Markdown",    ar: "ماركداون", action: () => download(buildMarkdown(result), "boardiq.md", "text/markdown") },
                  { label: "JSON",        ar: "جيسون",    action: () => download(JSON.stringify(result, null, 2), "boardiq.json", "application/json") },
                ].map(opt => (
                  <button key={opt.label} onClick={() => { opt.action(); setShowExport(false); }} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "none", border: "none",
                    borderTop: "1px solid var(--border)", cursor: "pointer",
                    fontSize: 13, color: "var(--text)", fontFamily: "inherit",
                    textAlign: "left",
                  }}>
                    <span>{opt.label}</span>
                    <span dir="rtl" lang="ar" style={{ fontSize: 11, color: "var(--muted)" }}>{opt.ar}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Image */}
        {image && (
          <div style={{
            borderRadius: 10, overflow: "hidden",
            border: "1px solid var(--border)", marginBottom: 16, maxHeight: 220,
          }}>
            <img src={image} alt="Whiteboard" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {/* Summary */}
        {result.summary && card(
          <>
            {label(LABELS.summary.en, LABELS.summary.ar)}
            <p style={{ fontSize: 14, color: "#c8d0e0", lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
          </>,
          { marginBottom: 16 }
        )}

        {/* Tabs */}
        <div className="no-print" style={{
          display: "flex", gap: 2, padding: 4,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, marginBottom: 16,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "7px 10px", borderRadius: 5,
              background: tab === t.id ? "rgba(255,255,255,0.07)" : "transparent",
              border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: tab === t.id ? "var(--text)" : "var(--muted)" }}>{t.en}</span>
              <span dir="rtl" lang="ar" style={{ fontSize: 10, color: "var(--muted)" }}>{t.ar}</span>
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.decisions.length > 0 && card(
              <>
                {label(LABELS.decisions.en, LABELS.decisions.ar)}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.decisions.map((d, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#c8d0e0", lineHeight: 1.5 }}>
                      <span style={{ color: "#3b6ef5", marginTop: 1, flexShrink: 0 }}>—</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {allRisks.length > 0 && card(
              <>
                {label(LABELS.risks.en, LABELS.risks.ar)}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {allRisks.map((r, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#c8d0e0", lineHeight: 1.5 }}>
                      <span style={{ color: "#c98a2e", marginTop: 1, flexShrink: 0 }}>⚠</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </>,
              { borderColor: "rgba(201,138,46,0.2)", background: "rgba(201,138,46,0.04)" }
            )}
            {result.decisions.length === 0 && allRisks.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "32px 0" }}>
                {LABELS.noContent.en} · <span lang="ar">{LABELS.noContent.ar}</span>
              </p>
            )}
          </div>
        )}

        {/* Tasks tab */}
        {tab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.tasks.length > 0 ? result.tasks.map((task, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: PRIORITY_COLOR[task.priority] || "var(--muted)",
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{task.title}</p>
                  {task.owner && (
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>{task.owner}</p>
                  )}
                </div>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 4,
                  color: PRIORITY_COLOR[task.priority] || "var(--muted)",
                  background: `${PRIORITY_COLOR[task.priority] || "#555"}18`,
                  border: `1px solid ${PRIORITY_COLOR[task.priority] || "var(--border)"}30`,
                  whiteSpace: "nowrap",
                }}>
                  {task.priority}
                </span>
              </div>
            )) : (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "32px 0" }}>
                {LABELS.noContent.en} · <span lang="ar">{LABELS.noContent.ar}</span>
              </p>
            )}
          </div>
        )}

        {/* Raw text tab */}
        {tab === "text" && card(
          <>
            {label(LABELS.extractedText.en, LABELS.extractedText.ar)}
            {result.extracted_text ? (
              <pre style={{
                fontSize: 12, lineHeight: 1.7, margin: 0,
                color: "#9aa0b0", whiteSpace: "pre-wrap",
                fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                maxHeight: 480, overflowY: "auto",
              }}>
                {result.extracted_text}
              </pre>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                {LABELS.noContent.en} · <span lang="ar">{LABELS.noContent.ar}</span>
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
