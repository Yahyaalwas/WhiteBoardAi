"use client";
import { motion } from "framer-motion";
import { Contributor } from "@/lib/types";

export function ContributorCard({ contributor, index }: { contributor: Contributor; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${contributor.color || "from-violet-500 to-blue-600"} flex items-center justify-center text-white font-bold text-sm`}>
          {contributor.label.charAt(contributor.label.length - 1)}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{contributor.label}</p>
          {contributor.handwriting_style && (
            <p className="text-white/30 text-xs">{contributor.handwriting_style}</p>
          )}
        </div>
      </div>
      {contributor.items && contributor.items.length > 0 && (
        <ul className="space-y-1">
          {contributor.items.map((item, i) => (
            <li key={i} className="text-xs text-white/40 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/20" />{item}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
