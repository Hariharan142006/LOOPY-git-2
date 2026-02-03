'use client';

import Link from "next/link";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-green-500/30">

      {/* Navbar / Header Overlay */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 container mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-black fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Loopy</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="text-sm font-medium text-white hover:text-green-400 transition-colors">Sign Up</Link>
        </div>
      </motion.header>

      {/* Main Content Flow */}
      <Hero />

    </div>
  );
}

