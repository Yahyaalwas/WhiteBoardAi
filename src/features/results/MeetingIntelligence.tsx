"use client";
import { motion } from "framer-motion";
import { AlertTriangle, CheckSquare, Link2, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/lib/types";

interface SectionProps {
  title: string;
  icon: React.ElementType;
  items: string[];
  color: string;
}

function IntelSection({ title, icon: Icon, items, color }: SectionProps) {
  if (!items?.length) return null;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 text-sm text-white/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function MeetingIntelligence({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {result.summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Executive Summary</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">{result.summary}</p>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntelSection title="Decisions Made" icon={CheckSquare} items={result.decisions || []} color="bg-emerald-500/20" />
        <IntelSection title="Risks Identified" icon={Shield} items={result.risks || []} color="bg-red-500/20" />
        <IntelSection title="Blockers" icon={AlertTriangle} items={result.blockers || []} color="bg-amber-500/20" />
        <IntelSection title="Dependencies" icon={Link2} items={result.dependencies || []} color="bg-blue-500/20" />
      </div>
    </div>
  );
}
