const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.booking.findMany();
  console.log('All Bookings:', all.map(b => ({ id: b.id, status: b.status, agentId: b.agentId })));
  process.exit(0);
}

check();
