import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';
import { assignAgentToBookingAction, updateBookingStatusAction } from '@/app/actions';

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const authorization = headerList.get('Authorization');
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string, role: string };
        if (!decoded || decoded.role !== 'AGENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { bookingId, action, status } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        if (action === 'ACCEPT') {
            const result = await assignAgentToBookingAction(bookingId, decoded.id);
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'STATUS') {
            const result = await updateBookingStatusAction(bookingId, status);
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error("Agent Task Action Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
