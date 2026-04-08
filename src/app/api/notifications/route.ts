import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function GET() {
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

        const notifications = await (db as any).notification.findMany({
            where: { userId: decoded.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Notifications API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
