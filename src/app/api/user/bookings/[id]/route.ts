import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function GET(
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
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const booking = await db.booking.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, phone: true, email: true }
                },
                agent: {
                    select: { id: true, name: true, phone: true, currentLat: true, currentLng: true, vehicleType: true }
                },
                address: true,
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Allow both the customer and the assigned agent to view
        if (booking.userId !== decoded.id && booking.agentId !== decoded.id && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Single Booking API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
