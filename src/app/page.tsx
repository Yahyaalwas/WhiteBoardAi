"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, Sparkles } from "lucide-react";

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
    await new Promise(r => setTimeout(r, 400));
    router.push("/processing");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* subtle bg glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

      {/* logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-lg">BoardIQ</span>
      </div>

      {/* headline */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          Whiteboard to notes,<br />
          <span className="text-violet-400">instantly.</span>
        </h1>
        <p className="text-white/40 text-base">
          Upload a photo. AI extracts text, tasks, and decisions.
        </p>
      </div>

      {/* upload box */}
      <div className="w-full max-w-md">
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              dragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-medium mb-1">Drop a photo here</p>
            <p className="text-white/20 text-sm">or tap to browse / use camera</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <img src={preview} alt="preview" className="w-full max-h-72 object-cover" />
            <div className="p-4 flex items-center justify-between bg-white/[0.03]">
              <span className="text-white/40 text-sm">Ready to analyze</span>
              <button onClick={() => setPreview(null)} className="text-white/30 hover:text-white text-sm transition-colors">
                Remove
              </button>
            </div>
          </div>
        )}

        {preview && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Starting..." : "Analyze with AI"}
          </button>
        )}

        {!preview && (
          <p className="text-center text-white/20 text-xs mt-6">
            Supports JPG, PNG, HEIC · Arabic + English · No account needed
          </p>
        )}
      </div>
    </main>
  );
}
