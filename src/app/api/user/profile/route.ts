import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function GET(request: Request) {
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

        const user = await db.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                vehicleType: true,
                biometricsEnabled: true,
                appNotificationsEnabled: true,
                preferredLanguage: true,
                image: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile GET API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

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
        const { name, email, phone, image } = body;

        const updatedUser = await db.user.update({
            where: { id: decoded.id },
            data: {
                name,
                email,
                phone,
                image
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                image: true
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Profile Update API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
