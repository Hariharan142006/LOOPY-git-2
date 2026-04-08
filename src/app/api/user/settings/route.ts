import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
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

        const user = await db.user.findUnique({ 
            where: { id: decoded.id },
            select: {
                biometricsEnabled: true,
                appNotificationsEnabled: true,
                preferredLanguage: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
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

        const body = await request.json();
        const { biometricsEnabled, appNotificationsEnabled, preferredLanguage } = body;

        const updatedUser = await db.user.update({
            where: { id: decoded.id },
            data: {
                ...(biometricsEnabled !== undefined && { biometricsEnabled }),
                ...(appNotificationsEnabled !== undefined && { appNotificationsEnabled }),
                ...(preferredLanguage !== undefined && { preferredLanguage }),
            },
            select: {
                biometricsEnabled: true,
                appNotificationsEnabled: true,
                preferredLanguage: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Settings Update API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
