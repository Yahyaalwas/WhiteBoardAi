import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoardIQ — Whiteboard Intelligence",
  description: "Transform whiteboard photos into structured notes, tasks, and summaries. Supports English and Arabic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
