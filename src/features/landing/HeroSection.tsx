"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Globe, Brain } from "lucide-react";

const floatingOrbs = [
  { x: "10%", y: "20%", size: 400, color: "violet", delay: 0 },
  { x: "70%", y: "60%", size: 350, color: "blue", delay: 2 },
  { x: "40%", y: "80%", size: 300, color: "emerald", delay: 4 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color === "violet"
              ? "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)"
              : orb.color === "blue"
              ? "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60">Powered by Claude AI</span>
          <span className="text-white/30">·</span>
          <span className="text-white/60">Multilingual OCR</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          <span className="text-white">Turn messy</span>
          <br />
          <span className="gradient-text">whiteboards</span>
          <br />
          <span className="text-white">into structured</span>
          <br />
          <span className="text-white/40">intelligence.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Capture brainstorms, diagrams, tasks, and multilingual meeting notes
          instantly using AI. English, Arabic, and more.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/upload"
            className="group flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Try BoardIQ
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 glass px-6 py-4 rounded-2xl text-white/60 hover:text-white transition-colors text-sm">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">▶</span>
            Watch demo
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-16 text-sm"
        >
          {[
            { value: "10s", label: "avg. processing time" },
            { value: "12+", label: "languages supported" },
            { value: "99%", label: "OCR accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/30 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-4"
      >
        {[
          { icon: Zap, label: "Instant processing" },
          { icon: Globe, label: "Arabic + English" },
          { icon: Brain, label: "Meeting intelligence" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-white/40">
            <Icon className="w-4 h-4 text-violet-400" />
            {label}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
