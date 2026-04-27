import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { toggleAgentOnlineAction } from '@/app/actions';

export async function POST(request: Request) {
    try {
        const session = await getAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.role !== 'AGENT' && session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { isOnline } = body;

        if (isOnline === undefined) {
            return NextResponse.json({ error: 'Status required' }, { status: 400 });
        }

        const result = await toggleAgentOnlineAction(session.id, isOnline);
        
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Agent Status Update API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
