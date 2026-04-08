import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo bookings...');

    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const agent = await prisma.user.findFirst({ where: { role: 'AGENT' } });
    const item = await prisma.scrapItem.findFirst();

    if (!customer || !agent || !item) {
        console.error('Missing required seed data (User or Item). Run main seed first.');
        return;
    }

    // 1. Create a PENDING booking for the Marketplace
    const address1 = await prisma.address.create({
        data: {
            userId: customer.id,
            street: '123 Market St',
            city: 'Hyderabad',
            state: 'Telangana',
            zip: '500001',
            lat: 17.3850,
            lng: 78.4867,
            label: 'Home'
        }
    });

    await prisma.booking.create({
        data: {
            userId: customer.id,
            addressId: address1.id,
            status: 'PENDING',
            scheduledAt: new Date(),
            pickupLat: 17.3850,
            pickupLng: 78.4867,
            totalAmount: 450,
            items: {
                create: [
                    { itemId: item.id, quantity: 10, priceAtBooking: 14 }
                ]
            }
        }
    });

    // 2. Create an ASSIGNED booking for the Agent's Active Tasks
    const address2 = await prisma.address.create({
        data: {
            userId: customer.id,
            street: '456 Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            zip: '500033',
            lat: 17.4334,
            lng: 78.4062,
            label: 'Office'
        }
    });

    await prisma.booking.create({
        data: {
            userId: customer.id,
            addressId: address2.id,
            agentId: agent.id,
            status: 'ASSIGNED',
            scheduledAt: new Date(Date.now() + 3600000), // 1 hour later
            pickupLat: 17.4334,
            pickupLng: 78.4062,
            totalAmount: 1200,
            items: {
                create: [
                    { itemId: item.id, quantity: 25, priceAtBooking: 14 }
                ]
            }
        }
    });

    console.log('Demo bookings created successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
