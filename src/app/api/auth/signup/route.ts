import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role = 'CUSTOMER', phone } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const user = await db.user.create({
            data: {
                name,
                email,
                password, // Simple text for demo, use hashing in production
                role,
                phone,
                walletBalance: 0.0
            }
        });

        const token = signToken({ id: user.id, role: user.role });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Signup API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
