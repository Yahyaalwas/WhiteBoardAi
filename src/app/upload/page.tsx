"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { UploadZone } from "@/features/upload/UploadZone";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      // In demo mode, simulate upload and go to processing
      const sessionId = `demo_${Date.now()}`;
      // Store file in sessionStorage for demo
      const reader = new FileReader();
      reader.onload = (e) => {
        sessionStorage.setItem("boardiq_image", e.target?.result as string);
        sessionStorage.setItem("boardiq_filename", selectedFile.name);
      };
      reader.readAsDataURL(selectedFile);

      // Simulate brief upload delay
      await new Promise(r => setTimeout(r, 800));
      router.push(`/processing?session=${sessionId}`);
    } catch {
      toast.error("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-6 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">BoardIQ</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Upload your whiteboard
            </h1>
            <p className="text-white/30 text-sm">
              Get the best results with a clear, well-lit photo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <UploadZone onFileSelected={setSelectedFile} />

            {/* Tips */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-white/30 font-medium mb-2 uppercase tracking-wider">Tips for best results</p>
              <ul className="space-y-1.5 text-xs text-white/40">
                {[
                  "Ensure good lighting — avoid harsh shadows",
                  "Capture the full whiteboard in frame",
                  "Hold camera parallel to the board",
                  "Works great with mixed Arabic + English",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!selectedFile}
              loading={isUploading}
              onClick={handleAnalyze}
            >
              {isUploading ? "Uploading..." : "Analyze with AI"}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
