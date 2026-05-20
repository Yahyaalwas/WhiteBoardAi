"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      sessionStorage.setItem("boardiq_image", result);
      sessionStorage.setItem("boardiq_filename", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    router.push("/processing");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={30} />
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>BoardIQ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
          <span style={{ 
            background: "rgba(59,110,245,0.12)", 
            color: "#3b6ef5", 
            padding: "3px 8px", 
            borderRadius: 4, 
            fontWeight: 500,
            fontSize: 11
          }}>
            EN / عر
          </span>
          <span>Whiteboard Intelligence</span>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        maxWidth: 520,
        margin: "0 auto",
        width: "100%",
      }}>

        {/* Hero text */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: 12,
            color: "var(--text)",
          }}>
            Whiteboard to structured notes
          </h1>
          {/* Arabic subtitle */}
          <p dir="rtl" lang="ar" style={{
            fontSize: 16,
            color: "var(--muted)",
            marginBottom: 8,
            fontWeight: 400,
          }}>
            حوّل صورة السبورة إلى ملاحظات منظمة فوراً
          </p>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            Upload a photo. AI extracts text, tasks, and decisions.
            <br />Supports English and Arabic.
          </p>
        </div>

        {/* Upload area */}
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            style={{
              width: "100%",
              border: `1.5px dashed ${dragging ? "#3b6ef5" : "var(--border)"}`,
              borderRadius: 10,
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "rgba(59,110,245,0.05)" : "var(--surface)",
              transition: "all 0.15s ease",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "rgba(59,110,245,0.1)",
              border: "1px solid rgba(59,110,245,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Upload size={20} color="#3b6ef5" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>
              Upload whiteboard photo
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Drag & drop, browse, or use camera
            </p>
            <p dir="rtl" lang="ar" style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              اسحب الصورة أو انقر للتحميل
            </p>
          </div>
        ) : (
          <div style={{
            width: "100%",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}>
            <img src={preview} alt="Whiteboard preview" style={{
              width: "100%",
              maxHeight: 280,
              objectFit: "cover",
              display: "block",
            }} />
            <div style={{
              padding: "12px 16px",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Ready to analyze</span>
              <button
                onClick={() => setPreview(null)}
                style={{ fontSize: 13, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {preview && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px 24px",
              borderRadius: 8,
              background: "#3b6ef5",
              color: "white",
              fontWeight: 500,
              fontSize: 14,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            {loading
              ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}/>
                  Starting...
                </span>
              : "Analyze Board / تحليل السبورة"
            }
          </button>
        )}

        {/* Feature tags */}
        <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 32,
        }}>
          {[
            { en: "OCR", ar: "استخراج النص" },
            { en: "Arabic + English", ar: "عربي + إنجليزي" },
            { en: "Tasks", ar: "المهام" },
            { en: "Summaries", ar: "الملخصات" },
          ].map(tag => (
            <div key={tag.en} style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid var(--border)",
              color: "var(--muted)",
              background: "var(--surface)",
            }}>
              {tag.en} · <span lang="ar">{tag.ar}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        color: "var(--muted)",
      }}>
        <span>BoardIQ © 2025</span>
        <span dir="rtl" lang="ar">ذكاء اصطناعي · سبورة ذكية</span>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
