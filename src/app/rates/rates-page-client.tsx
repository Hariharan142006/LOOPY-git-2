'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Navbar } from '@/components/navbar';
import RatesView from './rates-view';
import { ScrapItemWithCategory } from '@/lib/types';
import Link from 'next/link';

export default function RatesPageClient({ items }: { items: ScrapItemWithCategory[] }) {
    const { user } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // While mounting/checking auth, we can default to public or a loader. 
    // Defaulting to public layout is better for SEO and perceived performance.

    if (isMounted && user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <RatesView items={items} />
                </main>
            </div>
        );
    }

    // Public Layout
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Public Header */}
            <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back to Home
                    </Link>
                    <span className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10c0-2.21 1.79-4 4-4h6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8" /></svg>
                        </div>
                        Loopy Rates
                    </span>
                    <div className="w-24"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="text-center py-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">Live Scrap Rates</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Check out the latest market prices for recyclables.
                        We offer the best rates for your scrap with instant payment.
                    </p>
                </div>

                {items.length > 0 ? (
                    <RatesView items={items} />
                ) : (
                    <div className="text-center text-gray-500 py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        No rates available at the moment.
                    </div>
                )}

            </div>
        </div>
    );
}
