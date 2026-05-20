"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  { step: "01", label: "Capture", desc: "Snap a photo or upload from your device" },
  { step: "02", label: "Process", desc: "AI cleans, crops, and extracts all content" },
  { step: "03", label: "Analyze", desc: "Claude generates structured intelligence" },
  { step: "04", label: "Export", desc: "Download in any format you need" },
];

export function DemoSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            How it works
          </h2>
          <p className="text-white/30 text-lg">Four steps from chaos to clarity.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              <div className="glass rounded-2xl p-5 relative z-10">
                <div className="text-xs text-violet-400 font-mono font-bold mb-3">{s.step}</div>
                <div className="text-white font-semibold mb-1">{s.label}</div>
                <div className="text-white/30 text-sm">{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 md:p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-3">Ready to try it?</h3>
          <p className="text-white/30 mb-8">No account needed. Upload a photo and see the magic.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-2xl shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Try BoardIQ free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
