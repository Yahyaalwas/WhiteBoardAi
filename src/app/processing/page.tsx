"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const STEPS = [
  { en: "Uploading image...",                    ar: "جارٍ رفع الصورة..." },
  { en: "Enhancing whiteboard quality...",       ar: "تحسين جودة السبورة..." },
  { en: "Extracting text (EN + AR)...",          ar: "استخراج النصوص (عربي + إنجليزي)..." },
  { en: "Detecting tasks and decisions...",      ar: "تحديد المهام والقرارات..." },
  { en: "Generating summary with AI...",         ar: "إنشاء الملخص بالذكاء الاصطناعي..." },
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
      if (!API) throw new Error(
        "Backend not configured.\n\nSet NEXT_PUBLIC_API_URL in Vercel → Settings → Environment Variables."
      );

      const imageDataUrl = sessionStorage.getItem("boardiq_image");
      const filename = sessionStorage.getItem("boardiq_filename") || "board.jpg";
      if (!imageDataUrl) { router.push("/"); return; }

      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

      setStep(0);
      let uploadRes: Response;
      try {
        const form = new FormData();
        form.append("file", file);
        uploadRes = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      } catch {
        throw new Error(
          `Cannot reach backend at:\n${API}\n\nCheck:\n• NEXT_PUBLIC_API_URL in Vercel env vars\n• Railway service is running\n• ALLOWED_ORIGINS includes your Vercel URL`
        );
      }

      if (!uploadRes.ok) {
        const body = await uploadRes.text().catch(() => "");
        throw new Error(`Upload failed (HTTP ${uploadRes.status})\n\n${body.slice(0, 300)}`);
      }
      const { session_id } = await uploadRes.json();

      setStep(1);
      await fetch(`${API}/api/analyze/${session_id}`, { method: "POST" });

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
        if (data.status === "error") throw new Error(
          data.error_message || "Analysis failed.\n\nCheck ANTHROPIC_API_KEY is set in Railway environment variables."
        );
      }

      if (!result) throw new Error("Timed out after 2 minutes. The AI may be overloaded — please try again.");

      sessionStorage.setItem("boardiq_result", JSON.stringify({
        summary: result.summary || "",
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        background: "var(--bg)",
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: "50%",
          background: "rgba(220,50,50,0.1)",
          border: "1px solid rgba(220,50,50,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, fontSize: 20,
        }}>⚠</div>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>{error}</p>
        {errorDetail && (
          <pre style={{
            fontSize: 12,
            color: "var(--muted)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            maxWidth: 400,
            textAlign: "left",
            whiteSpace: "pre-wrap",
            marginBottom: 16,
            fontFamily: "monospace",
          }}>{errorDetail}</pre>
        )}
        <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 20, fontFamily: "monospace" }}>
          API: {API || "(not configured)"}
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            fontSize: 13, color: "#3b6ef5", background: "none",
            border: "1px solid rgba(59,110,245,0.3)", borderRadius: 6,
            padding: "8px 16px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          ← Go back / العودة
        </button>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg)",
    }}>
      <Logo size={40} />

      <p style={{ fontSize: 15, fontWeight: 500, margin: "20px 0 6px", color: "var(--text)" }}>
        Analyzing your board
      </p>
      <p dir="rtl" lang="ar" style={{ fontSize: 14, color: "var(--muted)", marginBottom: 36 }}>
        جارٍ تحليل سبورتك
      </p>

      <div style={{ width: "100%", maxWidth: 340, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "8px 0",
            opacity: i <= step ? 1 : 0.25,
            transition: "opacity 0.4s ease",
          }}>
            <div style={{
              width: 7, height: 7,
              borderRadius: "50%",
              background: i < step ? "#3b6ef5" : i === step ? "#3b6ef5" : "var(--border)",
              marginTop: 5, flexShrink: 0,
              boxShadow: i === step ? "0 0 8px rgba(59,110,245,0.6)" : "none",
              transition: "all 0.4s ease",
            }}/>
            <div>
              <p style={{ fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.4 }}>{s.en}</p>
              <p dir="rtl" lang="ar" style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0", lineHeight: 1.4 }}>{s.ar}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        width: "100%", maxWidth: 340,
        height: 3, background: "var(--border)",
        borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "#3b6ef5",
          borderRadius: 2,
          transition: "width 1.2s ease",
        }}/>
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>
        This may take up to 30 seconds · قد يستغرق حتى 30 ثانية
      </p>
    </div>
  );
}
