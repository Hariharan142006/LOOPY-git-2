import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const messages = await db.supportMessage.findMany({
            where: { ticketId: params.id },
            orderBy: { createdAt: 'asc' }
        });

        // Verify user owns the ticket or is admin
        const ticket = await db.supportTicket.findUnique({
            where: { id: params.id }
        });

        if (!ticket || (ticket.userId !== decoded.id && decoded.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
        }

        const isAdmin = decoded.role === 'ADMIN';

        const message = await db.supportMessage.create({
            data: {
                ticketId: params.id,
                senderId: decoded.id,
                text,
                isAdmin: isAdmin
            }
        });

        // Get the ticket to find the participant
        const ticket = await db.supportTicket.findUnique({
            where: { id: params.id }
        });

        if (ticket) {
            if (isAdmin) {
                // Admin replied -> Notify customer
                await db.notification.create({
                    data: {
                        userId: ticket.userId,
                        title: 'New Support Message',
                        message: `Admin replied: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
                        type: 'INFO',
                        relatedId: params.id
                    }
                });
            } else {
                // Customer wrote -> Notify admins
                const admins = await db.user.findMany({
                    where: { role: 'ADMIN' },
                    select: { id: true }
                });

                for (const admin of admins) {
                    await db.notification.create({
                        data: {
                            userId: admin.id,
                            title: 'New Support Required',
                            message: `Ticket #${params.id.slice(-6).toUpperCase()}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
                            type: 'WARNING',
                            relatedId: params.id
                        }
                    });
                }
            }
        }

        // Update ticket's updatedAt for sorting
        await db.supportTicket.update({
            where: { id: params.id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Support Message API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
