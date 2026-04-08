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

        const addresses = await db.address.findMany({
            where: {
                userId: decoded.id
            }
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error("Addresses API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
