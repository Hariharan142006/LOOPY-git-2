'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Mail, Phone, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// Import Server Actions
import { sendOtpAction, verifyOtpAction, registerUserAction } from '@/app/actions';

export default function SignupPage() {
    const router = useRouter();
    const setAuthUser = useAuthStore((state) => state.login);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
        setError('');
    };

    const handleNextStep = async () => {
        setError('');

        // Step 1 Validation
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.phone) {
                setError('Please fill in all fields');
                return;
            }
            if (!formData.email.includes('@')) {
                setError('Please enter a valid email address');
                return;
            }
            if (formData.phone.length < 10) {
                setError('Please enter a valid phone number');
                return;
            }
            setStep(2);
        }

        // Step 2 Validation (Method Selection -> Send OTP)
        else if (step === 2) {
            setIsLoading(true);
            try {
                const contact = otpMethod === 'email' ? formData.email : formData.phone;
                const result = await sendOtpAction(contact, otpMethod);

                if (result.success) {
                    toast.success(`OTP sent to your ${otpMethod}`);
                    setStep(3);
                } else {
                    setError(result.error || 'Failed to send OTP');
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        // Step 3 Validation (Verify OTP)
        else if (step === 3) {
            if (otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                return;
            }

            setIsLoading(true);
            try {
                const contact = otpMethod === 'email' ? formData.email : formData.phone;
                const result = await verifyOtpAction(contact, otp);

                if (result.success) {
                    toast.success('OTP Verified Successfully');
                    setStep(4);
                } else {
                    setError(result.error || 'Invalid OTP');
                }
            } catch (err) {
                setError('Verification failed');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const contact = otpMethod === 'email' ? formData.email : formData.phone;
            const result = await sendOtpAction(contact, otpMethod);

            if (result.success) {
                toast.success(`OTP Resent to your ${otpMethod}`);
            } else {
                toast.error(result.error || 'Failed to resend OTP');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Step 4 Validation (Password)
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerUserAction({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (result.success && result.user) {
                setAuthUser(result.user);
                toast.success('Account created successfully!');
                router.push('/dashboard');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-green-600/20 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
            </div>

            <Card className="z-10 w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div
                        className="h-full bg-green-500 transition-all duration-300 ease-in-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <CardHeader className="space-y-1 text-center pt-8">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                        {step === 4 ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                            <Trash2 className="h-6 w-6 text-green-500" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        {step === 1 && "Create Account"}
                        {step === 2 && "Verification Method"}
                        {step === 3 && "Verify OTP"}
                        {step === 4 && "Secure your Account"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        {step === 1 && "Enter your basic details to get started"}
                        {step === 2 && "Choose how you want to receive your OTP"}
                        {step === 3 && `Enter the 6-digit code sent to your ${otpMethod}`}
                        {step === 4 && "Set a strong password for your account"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSignup}>
                        {/* Step 1: Basic Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: OTP Method Selection */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div
                                    className={cn(
                                        "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                                        otpMethod === 'email'
                                            ? "border-green-500 bg-green-500/10 ring-1 ring-green-500 text-white"
                                            : "border-white/10 text-gray-400 hover:border-green-500/50 hover:bg-white/5"
                                    )}
                                    onClick={() => setOtpMethod('email')}
                                >
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                                        <Mail className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Email Verification</p>
                                        <p className="text-sm text-gray-500">Send code to {formData.email}</p>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                                        otpMethod === 'phone'
                                            ? "border-green-500 bg-green-500/10 ring-1 ring-green-500 text-white"
                                            : "border-white/10 text-gray-400 hover:border-green-500/50 hover:bg-white/5"
                                    )}
                                    onClick={() => setOtpMethod('phone')}
                                >
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                                        <Phone className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">SMS Verification</p>
                                        <p className="text-sm text-gray-500">Send code to {formData.phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Enter OTP */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-gray-300">One-Time Password</Label>
                                    <Input
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        className="text-center text-2xl tracking-widest bg-black/50 border-white/10 text-white placeholder:text-gray-700 focus:border-green-500 focus:ring-green-500 h-14"
                                        maxLength={6}
                                    />
                                    <p className="text-center text-sm text-gray-500 mt-2">
                                        Check your terminal for the code, or use '123456'. <br />
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-green-400 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Resending...' : 'Resend Code'}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Password Creation */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="bg-black/50 border-white/10 text-white focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="bg-black/50 border-white/10 text-white focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                                {error}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex gap-3">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goBack}
                                    className="flex-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}

                            {step < 4 ? (
                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold shadow-lg shadow-green-900/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold shadow-lg shadow-green-900/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-400 pt-0 pb-6">
                    <div>
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-green-400 hover:text-green-300 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
