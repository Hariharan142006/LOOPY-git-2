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

        const userData: any = {
            name,
            email,
            password,
            role,
            walletBalance: 0.0
        };

        if (phone) userData.phone = phone;

        const user = await db.user.create({
            data: userData
        });

        const token = signToken({ id: user.id, role: user.role });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error("Signup API Error:", error);
        
        if (error.code === 'P2002') {
            const target = error.meta?.target || '';
            if (target.includes('email')) {
                return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
            }
            if (target.includes('phone')) {
                return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
            }
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
    }
}
