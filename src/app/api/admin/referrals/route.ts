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
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const referrals = await db.referralConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(referrals);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const authHeader = headerList.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { rewardAmount, referralCode, description, isActive } = body;

        const config = await db.referralConfig.create({
            data: {
                rewardAmount: parseFloat(rewardAmount),
                referralCode,
                description,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("Referral Sync Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
