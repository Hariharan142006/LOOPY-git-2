"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Landmark, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { withdrawFundsAction } from "@/app/actions";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

interface WithdrawDialogProps {
    availableAmount: number;
    trigger?: React.ReactNode;
}

export function WithdrawDialog({ availableAmount, trigger }: WithdrawDialogProps) {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleWithdraw = async () => {
        if (!user || !selectedMethod) return;

        setLoading(true);
        try {
            const { success, error } = await withdrawFundsAction(user.id, availableAmount, selectedMethod);
            if (success) {
                setSuccess(true);
                toast.success("Withdrawal request submitted successfully");
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    setSelectedMethod(null);
                }, 2000);
            } else {
                toast.error(error || "Withdrawal failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const methods = [
        { id: "upi", name: "UPI Transfer", desc: "Instant transfer to UPI ID", icon: Smartphone },
        { id: "netbanking", name: "Net Banking", desc: "Direct bank account transfer", icon: Landmark },
        { id: "account", name: "Account Transfer", desc: "NEFT/RTGS to bank account", icon: CreditCard },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Withdraw</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Request Submitted!</h3>
                        <p className="text-gray-500">Your specific withdrawal request has been received and will be processed shortly.</p>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-sm text-gray-600 mb-1">Withdrawal Amount</p>
                            <div className="text-3xl font-bold text-green-700">₹{Math.floor(availableAmount)}</div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Choose your preferred withdrawal method</p>
                            {methods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === method.id
                                        ? "border-green-500 bg-green-50/50 ring-1 ring-green-500"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <method.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                                        <p className="text-xs text-gray-500">{method.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white font-bold"
                            disabled={!selectedMethod || loading || availableAmount <= 0}
                            onClick={handleWithdraw}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Withdrawal"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
