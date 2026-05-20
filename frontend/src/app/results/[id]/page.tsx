"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Sparkles, ArrowLeft, FileText, GitBranch, Users, Brain, CheckSquare, Download } from "lucide-react";
import Link from "next/link";
import { AnalysisResult } from "@/lib/types";
import { MeetingIntelligence } from "@/features/results/MeetingIntelligence";
import { TaskList } from "@/features/results/TaskList";
import { FlowchartViewer } from "@/features/results/FlowchartViewer";
import { ContributorCard } from "@/features/results/ContributorCard";
import { ExportMenu } from "@/features/results/ExportMenu";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "intelligence", label: "Intelligence", icon: Brain },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "flowchart", label: "Flowchart", icon: GitBranch },
  { id: "contributors", label: "Contributors", icon: Users },
  { id: "text", label: "Raw Text", icon: FileText },
];

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("intelligence");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("boardiq_result");
    const storedImage = sessionStorage.getItem("boardiq_image");
    if (stored) setResult(JSON.parse(stored));
    if (storedImage) setImagePreview(storedImage);
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/30">
          <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] opacity-10"
          style={{ background: "radial-gradient(ellipse at top right, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050810]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/upload" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:block">New board</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">BoardIQ</span>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Badge variant="success">Analysis complete</Badge>
            {result.language_detected?.map((lang) => (
              <Badge key={lang} variant="secondary">{lang}</Badge>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Whiteboard" className="w-full object-cover" />
              ) : (
                <div className="h-48 flex items-center justify-center text-white/20 text-sm">No image preview</div>
              )}
              <div className="p-4 border-t border-white/5">
                <p className="text-xs text-white/30 mb-1">Processed whiteboard</p>
                <p className="text-xs text-white/20">{result.language_detected?.join(" + ")} · {result.contributors?.length || 0} contributors</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-white/40" />
                <h3 className="text-white font-semibold text-sm">Export</h3>
              </div>
              <ExportMenu result={result} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Action items", value: result.tasks?.length || 0, color: "text-violet-400" },
                  { label: "Decisions", value: result.decisions?.length || 0, color: "text-emerald-400" },
                  { label: "Risks", value: result.risks?.length || 0, color: "text-red-400" },
                  { label: "Blockers", value: result.blockers?.length || 0, color: "text-amber-400" },
                  { label: "Contributors", value: result.contributors?.length || 0, color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/30">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1 glass rounded-2xl p-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </motion.div>

            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "intelligence" && <MeetingIntelligence result={result} />}
              {activeTab === "tasks" && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">{result.tasks?.length} Action Items</h3>
                  <TaskList tasks={result.tasks || []} />
                </div>
              )}
              {activeTab === "flowchart" && result.flowchart && <FlowchartViewer flowchart={result.flowchart} />}
              {activeTab === "contributors" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.contributors?.map((c, i) => <ContributorCard key={c.id} contributor={c} index={i} />)}
                </div>
              )}
              {activeTab === "text" && (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm text-white/40 font-medium">Extracted text</span>
                    <div className="flex gap-2">{result.language_detected?.map(lang => <Badge key={lang} variant="secondary">{lang}</Badge>)}</div>
                  </div>
                  <pre className="p-5 text-xs text-white/60 whitespace-pre-wrap leading-relaxed font-mono overflow-auto max-h-[600px]">
                    {result.extracted_text || "No text extracted"}
                  </pre>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
