import { db } from './src/lib/db';

async function main() {
    try {
        const items = await db.scrapItem.findMany();
        console.log('Scrap Items:', items);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
