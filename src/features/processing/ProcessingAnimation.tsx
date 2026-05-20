"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import { ProcessingStep } from "@/lib/types";

interface ProcessingAnimationProps {
  steps: ProcessingStep[];
  currentStep: number;
}

export function ProcessingAnimation({ steps, currentStep }: ProcessingAnimationProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
            step.status === "active"
              ? "glass-strong border-violet-500/20"
              : step.status === "done"
              ? "bg-white/[0.02] border border-white/5"
              : "opacity-30"
          } border border-transparent`}
        >
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            {step.status === "done" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </motion.div>
            ) : step.status === "active" ? (
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            ) : (
              <Clock className="w-5 h-5 text-white/20" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              step.status === "active" ? "text-white" :
              step.status === "done" ? "text-white/60" : "text-white/20"
            }`}>
              {step.label}
            </p>
            {step.status === "active" && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: step.duration || 3, ease: "easeInOut" }}
                className="mt-1.5 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
              />
            )}
          </div>

          {step.status === "done" && (
            <span className="text-xs text-white/20 font-mono">done</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
