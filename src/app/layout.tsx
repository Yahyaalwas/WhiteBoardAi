import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoardIQ",
  description: "Turn whiteboard photos into structured notes instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
