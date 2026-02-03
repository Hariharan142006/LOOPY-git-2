'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, History, BarChart3, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/book', label: 'Book Pickup', icon: Truck },
        { href: '/history', label: 'History', icon: History },
        { href: '/rates', label: 'Scrap Rates', icon: BarChart3 },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    if (!user) return null;

    return (
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        <span>Loopy</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`text-sm font-medium transition-colors hover:text-green-600 ${pathname === route.href ? 'text-green-600' : 'text-gray-600'
                                    }`}
                            >
                                {route.label}
                            </Link>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => logout()}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-600"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white absolute w-full pb-4 shadow-lg">
                    <div className="flex flex-col space-y-2 p-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === route.href
                                    ? 'bg-green-50 text-green-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
