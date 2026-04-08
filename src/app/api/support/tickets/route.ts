import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Get user's tickets
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

        const tickets = await db.supportTicket.findMany({
            where: decoded.role === 'ADMIN' ? {} : { userId: decoded.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Create new ticket
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

        const { subject, message } = await request.json();

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        const ticket = await db.supportTicket.create({
            data: {
                userId: decoded.id,
                subject,
                messages: {
                    create: {
                        senderId: decoded.id,
                        text: message,
                        isAdmin: false
                    }
                }
            },
            include: {
                messages: true
            }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Support Ticket API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
