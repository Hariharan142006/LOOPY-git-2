'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { loginAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const setAuthUser = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('customer@example.com');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { user, error: authError } = await loginAction(email, password);

            if (authError || !user) {
                setError(authError || 'Login failed');
                // toast.error(authError || 'Login failed');
            } else {
                setAuthUser(user);
                // toast.success('Welcome back!');
                // Redirect based on role
                if (user.role === 'AGENT') router.push('/agent/dashboard');
                else if (user.role === 'ADMIN') router.push('/admin');
                else router.push('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-green-600/20 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
            </div>

            <Card className="z-10 w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                        <Trash2 className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
                    <CardDescription className="text-gray-400">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-xs font-semibold text-blue-400 mb-2">Sample Credentials:</p>
                        <div className="text-xs text-blue-300/80 space-y-1">
                            <p><strong className="text-blue-200">Customer:</strong> customer@example.com / password</p>
                            <p><strong className="text-blue-200">Agent:</strong> agent@example.com / password</p>
                            <p><strong className="text-blue-200">Admin:</strong> admin@example.com / password</p>
                        </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-300">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/50 border-white/10 text-white focus:border-green-500 focus:ring-green-500"
                                required
                            />
                        </div>
                        {error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold shadow-lg shadow-green-900/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-400">
                    <div>
                        Don&apos;t have an account?{' '}
                        <a href="/signup" className="font-medium text-green-400 hover:text-green-300 hover:underline">
                            Sign up
                        </a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
