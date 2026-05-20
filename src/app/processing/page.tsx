"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ProcessingAnimation } from "@/features/processing/ProcessingAnimation";
import { ProcessingStep } from "@/lib/types";

const PROCESSING_STEPS: Omit<ProcessingStep, "status">[] = [
  { id: "upload", label: "Uploading image securely", duration: 1 },
  { id: "detect", label: "Detecting whiteboard edges & perspective", duration: 2.5 },
  { id: "enhance", label: "Enhancing image quality & contrast", duration: 2 },
  { id: "ocr", label: "Running multilingual OCR (EN + AR)", duration: 3 },
  { id: "flowchart", label: "Detecting flowcharts & diagrams", duration: 2.5 },
  { id: "contributors", label: "Analyzing handwriting styles", duration: 2 },
  { id: "claude", label: "Generating meeting intelligence with Claude AI", duration: 4 },
  { id: "structure", label: "Structuring digital board", duration: 1.5 },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const [steps, setSteps] = useState<ProcessingStep[]>(
    PROCESSING_STEPS.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const runSteps = async () => {
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < i ? "done" : idx === i ? "active" : "pending",
          }))
        );
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, (PROCESSING_STEPS[i].duration || 2) * 1000));
      }
      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
      await new Promise((r) => setTimeout(r, 600));

      // Store mock result in sessionStorage for demo
      const mockResult = generateMockResult();
      sessionStorage.setItem("boardiq_result", JSON.stringify(mockResult));
      router.push(`/results/${sessionId || "demo"}`);
    };

    runSteps();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const progress = ((currentStep + 1) / PROCESSING_STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/40"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Processing your board</h1>
          <p className="text-white/30 text-sm">AI is working its magic...</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 glass rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="glass rounded-2xl p-4">
          <ProcessingAnimation steps={steps} currentStep={currentStep} />
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          {Math.round(progress)}% complete · Average processing time: ~10 seconds
        </p>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810] flex items-center justify-center"><div className="text-white/20">Loading...</div></div>}>
      <ProcessingContent />
    </Suspense>
  );
}

function generateMockResult() {
  return {
    id: `demo_${Date.now()}`,
    status: "complete",
    language_detected: ["English", "Arabic"],
    extracted_text: `Project: Q3 Product Roadmap

## Objectives
- Launch mobile app v2.0
- Improve AI response time by 40%
- Expand to 3 new markets

## Sprint Goals
→ Authentication system redesign
→ API rate limiting implementation
→ Dashboard performance optimization

## Blockers
- Design system not finalized
- Backend API contract pending approval

مشروع خارطة الطريق للربع الثالث
الأهداف الرئيسية:
- إطلاق تطبيق الجوال الإصدار 2.0
- تحسين وقت استجابة الذكاء الاصطناعي`,
    summary: "Q3 Product Roadmap planning session covering mobile app v2.0 launch strategy, AI performance improvements, and market expansion into 3 new regions. Team identified 2 critical blockers and 8 action items with clear ownership.",
    decisions: [
      "Prioritize mobile app v2.0 for Q3 launch",
      "Allocate 2 engineers full-time to API redesign",
      "Postpone market expansion to Q4 if mobile launch slips",
    ],
    risks: [
      "Design system delay could block frontend work for 2 weeks",
      "API contract approval pending exec sign-off",
      "Third-party payment provider integration timeline uncertain",
    ],
    blockers: [
      "Design system not finalized — awaiting design team",
      "Backend API contract requires product approval",
    ],
    dependencies: [
      "Mobile v2.0 depends on new auth system",
      "Dashboard performance blocked by API rate limiting",
      "Market expansion requires localization pipeline",
    ],
    tasks: [
      { id: "1", title: "Finalize authentication system redesign", owner: "Alex Chen", priority: "high", status: "in-progress" },
      { id: "2", title: "Implement API rate limiting", owner: "Sarah Kim", priority: "high", status: "todo" },
      { id: "3", title: "Dashboard performance audit", owner: "Marcus Lee", priority: "medium", status: "todo" },
      { id: "4", title: "Design system review meeting", owner: "Priya Sharma", priority: "high", status: "todo" },
      { id: "5", title: "Mobile app v2.0 beta testing plan", owner: "Jordan Wu", priority: "medium", status: "todo" },
      { id: "6", title: "Localization pipeline research", owner: "Sam Torres", priority: "low", status: "todo" },
    ],
    flowchart: {
      mermaid: `graph TD
    A([Start: User Opens App]) --> B{Authenticated?}
    B -->|No| C[Show Login Screen]
    B -->|Yes| D[Load Dashboard]
    C --> E[Enter Credentials]
    E --> F{Valid?}
    F -->|No| G[Show Error]
    G --> C
    F -->|Yes| D
    D --> H[Upload Whiteboard]
    H --> I[AI Processing]
    I --> J([Show Results])`,
    },
    contributors: [
      { id: "1", label: "Contributor A", handwriting_style: "Print, upright", items: ["Project objectives", "Sprint goals"], color: "from-violet-500 to-purple-600" },
      { id: "2", label: "Contributor B", handwriting_style: "Cursive, slanted", items: ["Blockers section", "Risk items"], color: "from-blue-500 to-cyan-600" },
      { id: "3", label: "Contributor C", handwriting_style: "Arabic script", items: ["Arabic content", "Meeting notes"], color: "from-emerald-500 to-teal-600" },
    ],
  };
}
