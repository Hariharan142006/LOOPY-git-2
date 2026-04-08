import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { payBookingAction } from '@/app/actions';
import { headers } from 'next/headers';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headerList = await headers();
        const authorization = headerList.get('Authorization');
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string, role: string };
        if (!decoded || (decoded.role !== 'AGENT' && decoded.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { items, photos, totalAmount, customerWalletId } = body;

        const result = await payBookingAction(id, { items, photos, totalAmount, customerWalletId });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error || 'Payment failed' }, { status: 400 });
        }

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
