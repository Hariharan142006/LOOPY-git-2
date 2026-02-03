'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Package, TrendingUp, UserCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    const routes = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/pickups', label: 'Monitor Pickups', icon: Package },
        { href: '/admin/rates', label: 'Pricing Config', icon: TrendingUp },
        { href: '/admin/agents', label: 'Agents', icon: Users },
        { href: '/admin/users', label: 'Users', icon: UserCircle },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-white/5 hidden md:block">
                <div className="p-6">
                    <h2 className="text-lg font-bold tracking-tight">Admin Console</h2>
                </div>
                <nav className="space-y-1 px-3">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === route.href
                                ? 'bg-green-500/10 text-green-400'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <route.icon className="h-4 w-4" />
                            {route.label}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-4 left-0 w-64 px-3">
                    <Button
                        variant="ghost"
                        onClick={() => logout()}
                        className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
