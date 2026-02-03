'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Trash2, FileText, Shirt, Wine, Files, BookOpen, Package,
    Milk, Hammer, Utensils, Layers, Disc, Zap, Snowflake,
    Wind, Box, Cpu, HardDrive
} from 'lucide-react';
import { ScrapItemWithCategory } from '@/lib/types';
import { motion } from 'framer-motion';

// Map icon strings/categories to 2D Illustrations
const ILLUSTRATION_CONFIG: Record<string, { src: string, color: string, bg: string, iconFallback: any }> = {
    'newspaper': { src: '/illustrations/newspaper.png', color: 'text-gray-600', bg: 'bg-gray-50', iconFallback: FileText },
    'books': { src: '/illustrations/books.png', color: 'text-amber-700', bg: 'bg-amber-50', iconFallback: BookOpen },
    'file': { src: '/illustrations/newspaper.png', color: 'text-blue-600', bg: 'bg-blue-50', iconFallback: Files },
    'clothes': { src: '/illustrations/clothes.png', color: 'text-yellow-600', bg: 'bg-yellow-50', iconFallback: Shirt },
    'glass': { src: '/illustrations/glass_bottle.png', color: 'text-cyan-600', bg: 'bg-cyan-50', iconFallback: Wine },
    'plastic': { src: '/illustrations/plastic.png', color: 'text-emerald-600', bg: 'bg-emerald-50', iconFallback: Milk },
    'containers': { src: '/illustrations/containers.png', color: 'text-teal-600', bg: 'bg-teal-50', iconFallback: Box },
    'iron': { src: '/illustrations/iron.png', color: 'text-stone-700', bg: 'bg-stone-100', iconFallback: Hammer },
    'aluminium': { src: '/illustrations/aluminium.png', color: 'text-slate-500', bg: 'bg-slate-100', iconFallback: Layers },
    'electronics': { src: '/illustrations/electronics.png', color: 'text-purple-600', bg: 'bg-purple-50', iconFallback: Cpu },
    'appliance': { src: '/illustrations/electronics.png', color: 'text-orange-600', bg: 'bg-orange-50', iconFallback: Box },
    'default': { src: '', color: 'text-green-600', bg: 'bg-green-50', iconFallback: Trash2 }
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to get illustration key
function getIllustrationKey(item: ScrapItemWithCategory): string {
    const name = item.name.toLowerCase();
    const cat = item.category.name.toLowerCase();

    if (name.includes('newspaper')) return 'newspaper';
    if (name.includes('book') || name.includes('copy')) return 'books';
    if (name.includes('cloth') || cat.includes('textile')) return 'clothes';
    if (name.includes('glass') || cat.includes('glass')) return 'glass';
    if (name.includes('container') || name.includes('tub') || name.includes('bucket')) return 'containers';
    if (name.includes('bottle') || name.includes('plastic') || cat.includes('plastic')) return 'plastic';

    if (name.includes('iron')) return 'iron';
    if (name.includes('alu')) return 'aluminium';

    if (name.includes('computer') || name.includes('pc') || name.includes('laptop')) return 'electronics'; // Fallback to electronics for now due to quota
    if (name.includes('microwave') || name.includes('oven')) return 'appliance';

    if (cat.includes('metal')) return 'iron'; // Generic metal fallback
    if (cat.includes('electric') || cat.includes('e-waste')) return 'electronics';
    if (cat.includes('appliance')) return 'appliance';

    return 'default';
}

export default function RatesView({ items }: { items: ScrapItemWithCategory[] }) {
    const categories = Array.from(new Set(items.map(i => i.category.name)));
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'Normal Recyclables');

    const filteredItems = items.filter(i => i.category.name === activeCategory);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4">
            {/* Category Filter - Pill Style */}
            <div className="flex flex-wrap gap-3 justify-center">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`rounded-full px-8 py-6 text-base transition-all duration-300 font-medium ${activeCategory === cat
                            ? 'bg-green-600 text-white shadow-xl shadow-green-500/30 scale-105'
                            : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-green-200 hover:bg-green-50'
                            }`}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-6"
            >
                {filteredItems.map((item) => {
                    const key = getIllustrationKey(item);
                    const config = ILLUSTRATION_CONFIG[key] || ILLUSTRATION_CONFIG['default'];
                    const FallbackIcon = config.iconFallback;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="h-full border-2 border-gray-50 bg-white shadow-md hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden flex flex-col items-center">
                                <CardContent className="p-8 flex flex-col items-center text-center w-full h-full relative">
                                    {/* Icon/Illustration Container with Floating Animation */}
                                    <motion.div
                                        className={`w-32 h-32 rounded-3xl ${config.bg} flex items-center justify-center mb-6 relative group`}
                                        animate={{ y: [-4, 4, -4] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        {config.src ? (
                                            <img
                                                src={config.src}
                                                alt={item.name}
                                                className="w-24 h-24 object-contain drop-shadow-xl"
                                            />
                                        ) : (
                                            <FallbackIcon className={`h-16 w-16 ${config.color} opacity-80`} strokeWidth={1.5} />
                                        )}

                                        {/* Corner Accent */}
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/40 backdrop-blur-md rounded-bl-3xl rounded-tr-3xl" />
                                    </motion.div>

                                    <div className="flex-1 flex flex-col items-center justify-between w-full">
                                        <h3 className="font-extrabold text-gray-900 text-sm leading-tight mb-2 tracking-tight uppercase max-w-[150px]">
                                            {item.name}
                                        </h3>

                                        <div className="flex flex-col items-center">
                                            {/* Price Badge */}
                                            <div className="relative mt-2">
                                                <div className="text-3xl font-black text-green-600 flex items-baseline">
                                                    <span className="text-lg font-bold mr-1">₹</span>
                                                    {item.currentPrice}
                                                    <span className="text-[11px] font-bold text-gray-400 ml-1.5 border-l border-gray-200 pl-1.5 uppercase">
                                                        {item.unit}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.basePrice < item.currentPrice && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="inline-flex items-center gap-1 mt-2 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100"
                                                >
                                                    <Zap className="h-2.5 w-2.5 fill-current" />
                                                    PRICES INCREASED RECENTLY
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Shadow Decor */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>

        </div>
    );
}
