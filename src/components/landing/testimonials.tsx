"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Rahul Sharma",
        role: "Homeowner",
        content: "Used Loopy for the first time to clear out my garage. The agent arrived on time, weighed everything digitally, and I got the money in my UPI immediately. Super smooth!",
    },
    {
        name: "Priya Patel",
        role: "Small Business Owner",
        content: "We generate a lot of cardboard waste. Loopy's regular pickup service has made disposal so easy for us. Plus, knowing it gets recycled is a big bonus.",
    },
    {
        name: "Amit Kumar",
        role: "IT Professional",
        content: "The app is very user-friendly. I like the transparency in rates. No haggling with the local scrap dealer anymore. Highly recommended.",
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-white text-center mb-16">What Our Users Say</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 relative"
                        >
                            <Quote className="absolute top-8 right-8 h-8 w-8 text-white/5" />
                            <div className="flex gap-1 text-yellow-500 mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                            <div>
                                <div className="font-bold text-white">{testimonial.name}</div>
                                <div className="text-sm text-gray-500">{testimonial.role}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
