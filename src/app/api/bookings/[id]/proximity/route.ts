import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { proximityAlertAction } from '@/app/actions';
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

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string, role: string };
        if (!decoded || decoded.role !== 'AGENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { distance } = body;

        const result = await proximityAlertAction(id, distance);

        return NextResponse.json({ success: result.success });
    } catch (error) {
        console.error("Proximity API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
