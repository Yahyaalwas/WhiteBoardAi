"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
    >
      <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">BoardIQ</span>
      </div>

      <nav className="glass rounded-2xl px-4 py-2 hidden md:flex items-center gap-6">
        {["Features", "How it works", "Pricing"].map((item) => (
          <a key={item} href="#" className="text-sm text-white/50 hover:text-white transition-colors">
            {item}
          </a>
        ))}
      </nav>

      <div className="glass rounded-2xl px-4 py-2 flex items-center gap-3">
        <a href="#" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
          Sign in
        </a>
        <Link
          href="/upload"
          className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-1.5 rounded-xl hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/20"
        >
          Try free
        </Link>
      </div>
    </motion.header>
  );
}
