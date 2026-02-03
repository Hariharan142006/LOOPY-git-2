import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating scrap item images...');

    const updates = [
        { name: 'Newspaper', image: '/items/newspaper.png' },
        { name: 'Copper', image: '/items/copper.png' },
        { name: 'Bottles', image: '/items/plastic_bottles.png' },
        { name: 'Iron', image: '/items/iron.png' },
        // Also update sub-items if they match
        { name: 'White Paper', image: '/items/newspaper.png' },
        { name: 'PET Bottles (Clear)', price: 25, unit: 'kg', image: '/items/plastic_bottles.png' },
        { name: 'Iron G.I. Pipe', image: '/items/iron.png' }
    ];

    for (const update of updates) {
        await prisma.scrapItem.updateMany({
            where: { name: update.name },
            data: { image: update.image }
        });
        console.log(`Updated images for: ${update.name}`);
    }

    console.log('Finished updating images.');
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
