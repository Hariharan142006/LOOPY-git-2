import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAgentTasksAction } from '@/app/actions';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'forensic.log');
function auditLog(msg: string) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
}

export async function GET(request: Request) {
    try {
        const headerList = await headers();
        const authorization = headerList.get('Authorization');
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string, role: string };
        if (!decoded || (decoded.role !== 'AGENT' && decoded.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Default to no location for simple GET
        console.log(`[ROUTE] GET /api/agent/tasks for ID: "${decoded.id}"`);
        const result = await getAgentTasksAction(decoded.id);

        // Return structured data
        return NextResponse.json(result);
    } catch (error) {
        console.error("Agent Tasks GET Error:", error);
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
        if (!decoded || (decoded.role !== 'AGENT' && decoded.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { lat, lng } = body;

        const result = await getAgentTasksAction(decoded.id, lat, lng);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Agent Tasks POST Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
