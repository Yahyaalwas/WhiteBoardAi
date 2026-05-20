"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";

const STEPS = [
  "Uploading image...",
  "Enhancing & cleaning whiteboard...",
  "Running OCR (EN + AR)...",
  "Extracting tasks and decisions...",
  "Generating AI summary...",
];

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function Processing() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    run();
  }, []);

  async function run() {
    try {
      if (!API) {
        throw new Error("NEXT_PUBLIC_API_URL is not set.\n\nGo to Vercel → Project Settings → Environment Variables and add:\nNEXT_PUBLIC_API_URL = https://your-backend.railway.app");
      }

      const imageDataUrl = sessionStorage.getItem("boardiq_image");
      const filename = sessionStorage.getItem("boardiq_filename") || "board.jpg";
      if (!imageDataUrl) { router.push("/"); return; }

      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

      // Upload
      setStep(0);
      let uploadRes: Response;
      try {
        const form = new FormData();
        form.append("file", file);
        uploadRes = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      } catch {
        throw new Error(
          `Cannot reach backend at ${API}\n\nLikely causes:\n• NEXT_PUBLIC_API_URL is wrong in Vercel env vars\n• Railway backend is not running\n• CORS: add your Vercel URL to ALLOWED_ORIGINS in Railway`
        );
      }

      if (!uploadRes.ok) {
        const body = await uploadRes.text().catch(() => "");
        throw new Error(`Upload failed (HTTP ${uploadRes.status})\n\n${body.slice(0, 200)}`);
      }
      const { session_id } = await uploadRes.json();

      // Start analysis
      setStep(1);
      await fetch(`${API}/api/analyze/${session_id}`, { method: "POST" });

      // Poll for result
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
        if (data.status === "error") throw new Error(data.error_message || "Claude analysis failed.\n\nCheck that ANTHROPIC_API_KEY is set in Railway environment variables.");
      }

      if (!result) throw new Error("Timed out after 2 minutes.\n\nThe backend may be overloaded or Claude API is slow.");

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
      const msg = e instanceof Error ? e.message : "Something went wrong";
      const lines = msg.split("\n");
      setError(lines[0]);
      setErrorDetail(lines.slice(1).join("\n").trim() || null);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-white font-medium mb-2">{error}</p>
        {errorDetail && (
          <pre className="text-white/30 text-xs mb-6 max-w-sm text-left bg-white/[0.03] rounded-xl p-4 whitespace-pre-wrap font-mono">
            {errorDetail}
          </pre>
        )}
        <p className="text-white/20 text-xs mb-6">
          API: <span className="font-mono">{API || "(not set)"}</span>
        </p>
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
