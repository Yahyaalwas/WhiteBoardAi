import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BoardIQ — AI Whiteboard Intelligence",
  description: "Turn messy whiteboards into structured intelligence. Capture brainstorms, diagrams, tasks, and multilingual meeting notes instantly using AI.",
  keywords: ["whiteboard", "AI", "OCR", "meeting notes", "flowchart", "intelligence"],
  openGraph: {
    title: "BoardIQ — AI Whiteboard Intelligence",
    description: "Turn messy whiteboards into structured intelligence.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-[#050810] text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 20, 40, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
