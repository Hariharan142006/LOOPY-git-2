import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAgentTasksAction } from '@/app/actions';

export async function POST(request: Request) {
    try {
        // 1. Verify Token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = verifyToken(token);

        if (!decoded || (decoded.role !== 'AGENT' && decoded.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Get Data from Request
        const body = await request.json();
        const { lat, lng } = body;

        // 3. Call existing logic
        // Use user ID from token to ensure they only see their own assigned tasks + pending
        const tasks = await getAgentTasksAction(decoded.id, lat, lng);

        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Agent Tasks API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
