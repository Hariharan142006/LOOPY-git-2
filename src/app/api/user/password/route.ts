import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const authHeader = headerList.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;
        
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        const user = await db.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.password !== currentPassword) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        await db.user.update({
            where: { id: decoded.id },
            data: { password: newPassword }
        });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Password Update API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
