import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log('--- DIAGNOSTIC START ---');
    
    const agents = await prisma.user.findMany({ where: { role: 'AGENT' } });
    console.log('Agents Found:', agents.map(a => ({ id: a.id, name: a.name, isOnline: a.isOnline })));

    const bookings = await prisma.booking.findMany({
        include: { user: true, agent: true }
    });
    console.log('Total Bookings:', bookings.length);
    
    bookings.forEach(b => {
        console.log(`Booking ID: ${b.id}`);
        console.log(`  Status: ${b.status}`);
        console.log(`  Agent ID in DB: ${b.agentId}`);
        if (b.agent) console.log(`  Agent Name: ${b.agent.name}`);
    });

    console.log('--- DIAGNOSTIC END ---');
}

run().catch(console.error).finally(() => prisma.$disconnect());
