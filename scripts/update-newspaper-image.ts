// Script to update newspaper item image in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateNewspaperImage() {
    try {
        // Find all items with "Newspaper" in the name
        const newspaperItems = await prisma.scrapItem.findMany({
            where: {
                name: {
                    contains: 'Newspaper',
                    mode: 'insensitive'
                }
            }
        });

        console.log(`Found ${newspaperItems.length} newspaper item(s):`);
        newspaperItems.forEach(item => {
            console.log(`- ID: ${item.id}, Name: ${item.name}, Current Image: ${item.image || 'null'}`);
        });

        // Update all newspaper items to use the new icon
        const result = await prisma.scrapItem.updateMany({
            where: {
                name: {
                    contains: 'Newspaper',
                    mode: 'insensitive'
                }
            },
            data: {
                image: '/icons/newspaper.png'
            }
        });

        console.log(`\n✅ Updated ${result.count} item(s) with new newspaper illustration!`);
        console.log(`Image path set to: /icons/newspaper.png`);

    } catch (error) {
        console.error('❌ Error updating newspaper image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateNewspaperImage();
