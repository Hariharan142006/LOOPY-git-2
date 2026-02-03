"use client";

import { motion } from "framer-motion";
import { Building2, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessSolutions() {
    return (
        <section className="py-24 bg-gradient-to-b from-black to-neutral-900">
            <div className="container mx-auto px-4">
                <div className="rounded-3xl bg-green-900/10 border border-green-500/20 p-8 md:p-16 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-green-500/10 text-green-500 mb-6">
                        <Building2 className="h-8 w-8" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-6">For Businesses & Corporates</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
                        We provide tailored scrap management solutions for offices, factories, and institutions. Get GST invoices, destruction certificates, and contract-based regular pickups.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button className="h-12 px-8 rounded-full bg-green-600 hover:bg-green-500 text-black font-bold">
                            Schedule a Consultation
                        </Button>
                        <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5">
                            Download Brochure
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
