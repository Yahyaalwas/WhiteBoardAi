"use client";
import { motion } from "framer-motion";
import { Camera, FileText, GitBranch, Users, Sparkles, Download } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart Capture",
    description: "Take a photo or upload an image. Auto edge detection, perspective correction, glare removal.",
    color: "from-violet-500 to-purple-600",
    glow: "violet",
  },
  {
    icon: FileText,
    title: "Multilingual OCR",
    description: "Accurate extraction of English, Arabic, and mixed-language content. Detects headings, bullets, tasks.",
    color: "from-blue-500 to-cyan-600",
    glow: "blue",
  },
  {
    icon: GitBranch,
    title: "Flowchart Recognition",
    description: "Automatically converts hand-drawn boxes and arrows into editable Mermaid.js flowcharts.",
    color: "from-emerald-500 to-teal-600",
    glow: "emerald",
  },
  {
    icon: Users,
    title: "Contributor Detection",
    description: "Identifies different handwriting styles. Know exactly who contributed what on the board.",
    color: "from-amber-500 to-orange-600",
    glow: "amber",
  },
  {
    icon: Sparkles,
    title: "Meeting Intelligence",
    description: "Claude AI generates executive summaries, action items, decisions, risks, and dependencies.",
    color: "from-rose-500 to-pink-600",
    glow: "rose",
  },
  {
    icon: Download,
    title: "One-click Export",
    description: "Export to PDF, Markdown, JSON, Mermaid, or Notion-compatible documents instantly.",
    color: "from-indigo-500 to-violet-600",
    glow: "indigo",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm text-white/40">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            One snap. Full intelligence.
          </h2>
          <p className="text-white/30 text-lg max-w-xl mx-auto">
            From raw photo to structured knowledge in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 gradient-border cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
