'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-green-500/30">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
      </main>

      <Footer />
    </div>
  );
}
