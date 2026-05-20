"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, ImageIcon, X, CheckCircle2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onFileSelected(file);
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...(getRootProps() as any)}
            className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center group ${
              isDragActive
                ? "border-violet-500 bg-violet-500/10"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />

            {/* Animated background */}
            <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 to-blue-500/5" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-5">
              <motion.div
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                  isDragActive
                    ? "bg-violet-500/20 border border-violet-500/40"
                    : "bg-white/5 border border-white/10 group-hover:bg-white/8"
                }`}
              >
                <Upload className={`w-9 h-9 transition-colors ${isDragActive ? "text-violet-400" : "text-white/30 group-hover:text-white/50"}`} />
              </motion.div>

              <div>
                <p className="text-white font-semibold text-lg mb-1">
                  {isDragActive ? "Drop it here" : "Upload whiteboard photo"}
                </p>
                <p className="text-white/30 text-sm">
                  Drag & drop or click to browse · JPG, PNG, HEIC · Max 20MB
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-white/40">
                  <ImageIcon className="w-4 h-4" />
                  Browse files
                </div>
                <span className="text-white/20 text-xs">or</span>
                <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-white/40">
                  <Camera className="w-4 h-4" />
                  Take photo
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 group"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <button
              onClick={clear}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{selectedFile?.name}</p>
                <p className="text-white/50 text-xs">{selectedFile && formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
