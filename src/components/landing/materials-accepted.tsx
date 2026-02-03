"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const materials = [
    "Newspapers & Magazines",
    "Cardboard & Cartons",
    "Plastic Bottles (PET)",
    "Hard Plastics (HDPE)",
    "Iron & Steel Scrap",
    "Aluminium Cans/Utensils",
    "Copper Wire/Utensils",
    "Brass Fixtures",
    "Electronic Waste (E-Waste)",
    "Old Vehicle Batteries",
    "Inverter/UPS Batteries",
    "Old Appliances (AC/Fridge)"
];

export function MaterialsAccepted() {
    return (
        <section className="py-24 bg-neutral-900 overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                        Materials We Accept
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        From household papers to heavy metals, we collect almost everything.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {materials.map((material, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-colors"
                        >
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-200 font-medium">{material}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
