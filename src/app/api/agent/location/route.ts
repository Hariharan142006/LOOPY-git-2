import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';
import { updateAgentLocationAction } from '@/app/actions';

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
        const { lat, lng } = body;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
        }

        const result = await updateAgentLocationAction(decoded.id, lat, lng);
        
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Agent Location Update API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
