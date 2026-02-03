import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./dev.db',
        },
    },
});

async function main() {
    console.log('Seeding database...');

    // Create Scrap Categories
    const paper = await prisma.scrapCategory.create({
        data: { name: 'Paper', image: '/icons/newspaper.png' }
    });
    const plastic = await prisma.scrapCategory.create({
        data: { name: 'Plastics', image: '/icons/plastic.png' }
    });
    const metal = await prisma.scrapCategory.create({
        data: { name: 'Metals', image: '/icons/metal.png' }
    });
    const ewaste = await prisma.scrapCategory.create({
        data: { name: 'E-waste / Electronics', image: '/icons/electronics.png' }
    });

    // Paper Items
    await prisma.scrapItem.create({ data: { name: 'Newspaper', categoryId: paper.id, basePrice: 14, currentPrice: 14, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Books', categoryId: paper.id, basePrice: 12, currentPrice: 12, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Copies', categoryId: paper.id, basePrice: 13, currentPrice: 13, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Magazines', categoryId: paper.id, basePrice: 10, currentPrice: 10, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Cardboard', categoryId: paper.id, basePrice: 8, currentPrice: 8, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Other paper scrap', categoryId: paper.id, basePrice: 5, currentPrice: 5, unit: 'kg' } });

    // Plastic Items
    await prisma.scrapItem.create({ data: { name: 'Bottles', categoryId: plastic.id, basePrice: 12, currentPrice: 12, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Containers', categoryId: plastic.id, basePrice: 15, currentPrice: 15, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Old plastic items', categoryId: plastic.id, basePrice: 10, currentPrice: 10, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Mixed plastic household scrap', categoryId: plastic.id, basePrice: 8, currentPrice: 8, unit: 'kg' } });

    // Metal Items
    await prisma.scrapItem.create({ data: { name: 'Iron', categoryId: metal.id, basePrice: 26, currentPrice: 28, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Steel', categoryId: metal.id, basePrice: 35, currentPrice: 38, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Aluminium', categoryId: metal.id, basePrice: 105, currentPrice: 110, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Copper', categoryId: metal.id, basePrice: 420, currentPrice: 425, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Brass', categoryId: metal.id, basePrice: 305, currentPrice: 310, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Other metal scrap', categoryId: metal.id, basePrice: 20, currentPrice: 20, unit: 'kg' } });

    // E-waste Items
    await prisma.scrapItem.create({ data: { name: 'Computers', categoryId: ewaste.id, basePrice: 200, currentPrice: 200, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'TVs', categoryId: ewaste.id, basePrice: 150, currentPrice: 150, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'Fridge', categoryId: ewaste.id, basePrice: 500, currentPrice: 550, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'Washing Machine', categoryId: ewaste.id, basePrice: 600, currentPrice: 600, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'Printers', categoryId: ewaste.id, basePrice: 100, currentPrice: 100, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'Scanners', categoryId: ewaste.id, basePrice: 80, currentPrice: 80, unit: 'pcs' } });
    await prisma.scrapItem.create({ data: { name: 'Batteries', categoryId: ewaste.id, basePrice: 40, currentPrice: 40, unit: 'kg' } });
    await prisma.scrapItem.create({ data: { name: 'Other electronic items', categoryId: ewaste.id, basePrice: 20, currentPrice: 20, unit: 'kg' } });

    // Create Users
    // Password is not hashed for simplicity in this demo, usually use bcrypt
    await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'customer@example.com',
            password: 'password', // Plain text for demo
            role: 'CUSTOMER',
            phone: '9876543210'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Agent Smith',
            email: 'agent@example.com',
            password: 'password',
            role: 'AGENT',
            phone: '9999999999',
            isOnline: true
        }
    });

    await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password',
            role: 'ADMIN',
        }
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
