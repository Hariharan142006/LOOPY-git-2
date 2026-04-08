import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
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

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing address ID' }, { status: 400 });
        }

        const address = await db.address.findUnique({ where: { id } });
        if (!address || address.userId !== decoded.id) {
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
        }

        await db.address.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Address API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
