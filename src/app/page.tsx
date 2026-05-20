import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/features/landing/HeroSection";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { DemoSection } from "@/features/landing/DemoSection";

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <footer className="border-t border-white/5 py-12 text-center text-white/20 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/40">BoardIQ</span>
            <span>·</span>
            <span>AI Whiteboard Intelligence</span>
          </div>
          <div>© 2025 BoardIQ. Built with Claude AI.</div>
        </div>
      </footer>
    </main>
  );
}
