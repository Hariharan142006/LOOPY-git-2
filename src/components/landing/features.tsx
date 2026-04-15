"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Zap, Smartphone, BadgePercent, Coins } from "lucide-react";

const FEATURES = [
  {
    title: "Doorstep Pickup",
    description: "Our professional agents come to your location at your preferred time. No more hauling scrap to local dealers.",
    icon: Truck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Accurate Weighing",
    description: "Every agent carries certified digital scales. Get accurate measurement of every gram of your scrap.",
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Instant Payment",
    description: "Receive money directly in your wallet or bank account the moment the weighing is done. Transparent and fast.",
    icon: Coins,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Live Market Rates",
    description: "Check today's scrap prices before booking. No more haggling with local dealers over prices.",
    icon: BadgePercent,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Smart Tracking",
    description: "Track your agent's location in real-time as they arrive for pickup. Total transparency throughout.",
    icon: Zap,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "Easy Management",
    description: "Manage multiple addresses, view pickup history, and track your environmental impact in one app.",
    icon: Smartphone,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16 px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Why Choose <span className="text-green-500">Loopy?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            We are redefining the scrap collection industry in India with technology, transparency, and a commitment to sustainability.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group"
            >
              <div className={`h-12 w-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
