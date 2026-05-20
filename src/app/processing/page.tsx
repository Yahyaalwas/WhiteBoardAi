"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Enhancing image quality...",
  "Running OCR on text...",
  "Detecting tasks and decisions...",
  "Generating summary with AI...",
  "Done.",
];

export default function Processing() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 1800));
    });
    timers.push(setTimeout(() => {
      sessionStorage.setItem("boardiq_result", JSON.stringify(mockResult()));
      router.push("/results");
    }, STEPS.length * 1800 + 400));
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mb-8">
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
      </div>
      <h2 className="text-white font-semibold text-lg mb-8">Analyzing your board...</h2>
      <div className="w-full max-w-xs space-y-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-500 ${
            i <= step ? "text-white" : "text-white/20"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              i < step ? "bg-violet-400" : i === step ? "bg-violet-400 animate-pulse" : "bg-white/10"
            }`} />
            {s}
          </div>
        ))}
      </div>
      <div className="mt-8 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-600 rounded-full transition-all duration-[1800ms] ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </main>
  );
}

function mockResult() {
  return {
    summary: "Q3 product roadmap session covering mobile app v2.0 launch, API improvements, and market expansion into 3 new regions. Team aligned on priorities and identified key blockers.",
    decisions: [
      "Prioritize mobile v2.0 for Q3 launch",
      "Allocate 2 engineers full-time to API redesign",
      "Defer market expansion to Q4",
    ],
    tasks: [
      { title: "Redesign authentication system", owner: "Alex", priority: "high" },
      { title: "Implement API rate limiting", owner: "Sarah", priority: "high" },
      { title: "Dashboard performance audit", owner: "Marcus", priority: "medium" },
      { title: "Write mobile beta test plan", owner: "Jordan", priority: "medium" },
      { title: "Research localization pipeline", owner: "Sam", priority: "low" },
    ],
    risks: [
      "Design system delay could block frontend work",
      "Payment provider integration timeline uncertain",
    ],
    extracted_text: `Project: Q3 Product Roadmap

Objectives:
- Launch mobile app v2.0
- Improve AI response time 40%
- Expand to 3 new markets

Sprint Goals:
→ Auth system redesign
→ API rate limiting
→ Dashboard performance

Blockers:
- Design system not finalized
- Backend API contract pending`,
    language: "English",
  };
}
