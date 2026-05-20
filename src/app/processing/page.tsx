"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Uploading image...",
  "Enhancing & cleaning whiteboard...",
  "Running OCR (EN + AR)...",
  "Extracting tasks and decisions...",
  "Generating AI summary...",
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Processing() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    run();
  }, []);

  async function run() {
    try {
      // Step 0 — get image from session
      const imageDataUrl = sessionStorage.getItem("boardiq_image");
      const filename = sessionStorage.getItem("boardiq_filename") || "board.jpg";
      if (!imageDataUrl) { router.push("/"); return; }

      // Convert dataURL → Blob
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

      // Step 1 — upload
      setStep(0);
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      const { session_id } = await uploadRes.json();

      // Step 2 — start analysis
      setStep(1);
      await fetch(`${API}/api/analyze/${session_id}`, { method: "POST" });

      // Steps 3-5 — poll for result
      setStep(2);
      let result = null;
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        if (i === 1) setStep(3);
        if (i === 3) setStep(4);
        const pollRes = await fetch(`${API}/api/results/${session_id}`);
        if (!pollRes.ok) continue;
        const data = await pollRes.json();
        if (data.status === "complete") { result = data; break; }
        if (data.status === "error") throw new Error(data.error_message || "Analysis failed");
      }

      if (!result) throw new Error("Timed out waiting for analysis");

      // Normalize to frontend shape
      sessionStorage.setItem("boardiq_result", JSON.stringify({
        summary: result.summary || "No summary generated.",
        decisions: result.decisions || [],
        risks: result.risks || [],
        blockers: result.blockers || [],
        tasks: (result.tasks || []).map((t: { title: string; owner?: string; priority?: string }) => ({
          title: t.title,
          owner: t.owner || "",
          priority: t.priority || "medium",
        })),
        extracted_text: result.extracted_text || "",
        language: (result.language_detected || ["Unknown"]).join(", "),
      }));

      router.push("/results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-400 font-medium mb-2">Analysis failed</p>
        <p className="text-white/30 text-sm mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
        >
          ← Try again
        </button>
      </main>
    );
  }

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
              i < step ? "bg-violet-400" :
              i === step ? "bg-violet-400 animate-pulse" :
              "bg-white/10"
            }`} />
            {s}
          </div>
        ))}
      </div>
      <div className="mt-8 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="text-white/20 text-xs mt-4">This takes 10–30 seconds</p>
    </main>
  );
}
