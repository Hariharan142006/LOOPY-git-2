"use client";

import { motion } from "framer-motion";
import { CalendarSearch, Truck, Wallet } from "lucide-react";

const STEPS = [
  {
    title: "Schedule Pickup",
    description: "Choose your scrap items and select a convenient time slot for our agent to visit your doorstep.",
    icon: CalendarSearch,
    color: "#3b82f6", // blue
  },
  {
    title: "On-site Weighing",
    description: "Our agent arrives and weighs your scrap using high-precision digital scales. Live rates are always applied.",
    icon: Truck,
    color: "#10b981", // green
  },
  {
    title: "Instant Payout",
    description: "Accept the final weight and amount. Payment is instantly credited to your Loopy wallet or bank.",
    icon: Wallet,
    color: "#f59e0b", // amber
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            How it <span className="text-green-500">Works</span>
          </motion.h2>
          <div className="h-1 w-20 bg-green-500 mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-amber-500/20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div 
                  className="h-24 w-24 rounded-full flex items-center justify-center mb-8 relative"
                  style={{ backgroundColor: `${step.color}10`, border: `2px solid ${step.color}30` }}
                >
                  <div 
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xl"
                    style={{ backgroundColor: step.color }}
                  >
                    {idx + 1}
                  </div>
                  <step.icon size={40} style={{ color: step.color }} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-500 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
