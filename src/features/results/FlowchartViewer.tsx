"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { FlowchartData } from "@/lib/types";
import toast from "react-hot-toast";

export function FlowchartViewer({ flowchart }: { flowchart: FlowchartData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!flowchart?.mermaid || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          theme: "dark",
          themeVariables: {
            primaryColor: "#7c3aed",
            primaryTextColor: "#fff",
            primaryBorderColor: "#6d28d9",
            lineColor: "#6d28d9",
            secondaryColor: "#1e1b4b",
            tertiaryColor: "#0f172a",
            background: "#050810",
            mainBkg: "#0f0a1e",
            nodeBorder: "#6d28d9",
            clusterBkg: "#0f172a",
            titleColor: "#a78bfa",
            edgeLabelBackground: "#1e1b4b",
            fontFamily: "Inter",
          },
          startOnLoad: false,
          securityLevel: "loose",
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, flowchart.mermaid as string);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.style.maxHeight = "400px";
          }
        }
      } catch (e) {
        console.error("Mermaid render failed:", e);
      }
    };

    renderDiagram();
  }, [flowchart]);

  const copyMermaid = () => {
    if (!flowchart.mermaid) return;
    navigator.clipboard.writeText(flowchart.mermaid);
    setCopied(true);
    toast.success("Mermaid code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 overflow-auto">
        <div ref={containerRef} className="flex items-center justify-center min-h-[200px]">
          {!rendered && (
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
              Rendering diagram...
            </div>
          )}
        </div>
      </div>
      {flowchart.mermaid && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <span className="text-xs text-white/30 font-mono">mermaid source</span>
            <button onClick={copyMermaid} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-xs text-violet-300 font-mono p-4 overflow-auto leading-relaxed">
            {flowchart.mermaid}
          </pre>
        </div>
      )}
    </div>
  );
}
