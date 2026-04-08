import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const user = await db.user.findUnique({ where: { email } });

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Token
        const token = signToken({ id: user.id, role: user.role });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                vehicleType: user.vehicleType
            }
        });
    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
