"use client";

import { motion } from "framer-motion";

const STATS = [
  { label: "Happy Customers", value: "50,000+", suffix: "" },
  { label: "Scrap Recycled", value: "1,200", suffix: " Tons" },
  { label: "Agents Verified", value: "500+", suffix: "" },
  { label: "Trees Saved", value: "15,000+", suffix: "" },
];

export function Stats() {
  return (
    <section className="py-20 bg-green-500 relative">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <h3 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tighter">
                {stat.value}
                <span className="text-2xl font-bold">{stat.suffix}</span>
              </h3>
              <p className="text-black/70 font-bold uppercase tracking-widest text-xs md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
