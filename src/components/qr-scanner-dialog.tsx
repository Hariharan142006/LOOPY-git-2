'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerDialogProps {
    open: boolean;
    onClose: () => void;
    onScan: (userId: string) => void;
}

export default function QRScannerDialog({ open, onClose, onScan }: QRScannerDialogProps) {
    const scannerRef = useRef<any>(null);
    const qrboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        let html5QrCode: any = null;

        const startScanner = async () => {
            try {
                // Dynamically import html5-qrcode
                const { Html5Qrcode } = await import('html5-qrcode');

                html5QrCode = new Html5Qrcode('qr-reader');

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText: string) => {
                        console.log('[QR Scanner] Scanned:', decodedText);
                        html5QrCode?.stop();
                        onScan(decodedText);
                        onClose();
                    },
                    (error: any) => {
                        // Ignore continuous scan errors
                    }
                );
            } catch (err) {
                console.error('[QR Scanner] Error:', err);
                toast.error('Failed to access camera. Please check permissions.');
            }
        };

        startScanner();

        return () => {
            if (html5QrCode?.isScanning) {
                html5QrCode.stop().catch((err: any) => console.error('Stop error:', err));
            }
        };
    }, [open, onScan, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Scan Customer QR Code
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Point your camera at the customer's profile QR code to verify their identity.
                    </p>

                    <div id="qr-reader" className="w-full"></div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
