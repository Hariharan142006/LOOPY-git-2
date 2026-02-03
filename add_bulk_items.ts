import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Bulk adding 72 scrap items...');

    const categoriesData = [
        {
            name: 'Paper', items: [
                { name: 'White Paper', price: 15, unit: 'kg' },
                { name: 'Shredded Paper', price: 10, unit: 'kg' },
                { name: 'Office Waste Paper', price: 12, unit: 'kg' },
                { name: 'Textbooks (Hardcover)', price: 11, unit: 'kg' },
                { name: 'Notebooks', price: 13, unit: 'kg' },
                { name: 'Craft Paper', price: 9, unit: 'kg' },
                { name: 'Carton Boxes (Corrugated)', price: 8, unit: 'kg' },
                { name: 'Envelopes & Mail', price: 7, unit: 'kg' }
            ]
        },
        {
            name: 'Plastics', items: [
                { name: 'PET Bottles (Clear)', price: 25, unit: 'kg' },
                { name: 'HDPE Milk Jugs/Cans', price: 18, unit: 'kg' },
                { name: 'LDPE Plastic Wrap', price: 5, unit: 'kg' },
                { name: 'PP Buckets & Tubs', price: 12, unit: 'kg' },
                { name: 'PVC Pipes', price: 15, unit: 'kg' },
                { name: 'ABS Plastic Scraps', price: 20, unit: 'kg' },
                { name: 'Plastic Toys', price: 8, unit: 'kg' },
                { name: 'Plastic Hangers', price: 6, unit: 'kg' },
                { name: 'Tupperware Containers', price: 14, unit: 'kg' },
                { name: 'Plastic Crates', price: 10, unit: 'kg' }
            ]
        },
        {
            name: 'Metals', items: [
                { name: 'Iron G.I. Pipe', price: 30, unit: 'kg' },
                { name: 'Cast Iron Scrap', price: 28, unit: 'kg' },
                { name: 'M.S. Industrial Scrap', price: 32, unit: 'kg' },
                { name: 'S.S. 304 Grade', price: 90, unit: 'kg' },
                { name: 'S.S. 316 Grade', price: 140, unit: 'kg' },
                { name: 'Aluminium Foil', price: 50, unit: 'kg' },
                { name: 'Aluminium Section/Wire', price: 120, unit: 'kg' },
                { name: 'Heavy Copper Cable', price: 550, unit: 'kg' },
                { name: 'Copper Mixed Scrap', price: 480, unit: 'kg' },
                { name: 'Brass Valves/Fittings', price: 320, unit: 'kg' },
                { name: 'Zinc Die Cast', price: 150, unit: 'kg' },
                { name: 'Lead Plates', price: 160, unit: 'kg' }
            ]
        },
        {
            name: 'E-waste / Electronics', items: [
                { name: 'Computer Motherboard', price: 150, unit: 'pcs' },
                { name: 'RAM Sticks (High Grade)', price: 50, unit: 'pcs' },
                { name: 'Desktop CPU Processors', price: 40, unit: 'pcs' },
                { name: 'Hard Disk Drives (HDD)', price: 60, unit: 'pcs' },
                { name: 'Solid State Drives (SSD)', price: 30, unit: 'pcs' },
                { name: 'Power Supply Unit (SMPS)', price: 45, unit: 'pcs' },
                { name: 'Server UPS Unit', price: 800, unit: 'pcs' },
                { name: 'LCD/LED Monitor', price: 250, unit: 'pcs' },
                { name: 'Mechanical Keyboard', price: 40, unit: 'pcs' },
                { name: 'Wireless Mouse', price: 15, unit: 'pcs' }
            ]
        },
        {
            name: 'Appliances', items: [
                { name: 'Microwave Oven', price: 400, unit: 'pcs' },
                { name: 'Mixer Grinder', price: 150, unit: 'pcs' },
                { name: 'Electric Water Heater', price: 300, unit: 'pcs' },
                { name: 'Induction Cooktop', price: 200, unit: 'pcs' },
                { name: 'Bread Toaster', price: 50, unit: 'pcs' },
                { name: 'Ceiling Fan (Aluminium)', price: 120, unit: 'pcs' },
                { name: 'Electric Iron Box', price: 40, unit: 'pcs' },
                { name: 'Vacuum Cleaner', price: 250, unit: 'pcs' }
            ]
        },
        {
            name: 'Glass', items: [
                { name: 'Clear Glass Bottles', price: 2, unit: 'kg' },
                { name: 'Beer/Liquor Bottles', price: 1, unit: 'kg' },
                { name: 'Broken Glass (Cullet)', price: 1.5, unit: 'kg' },
                { name: 'Mirror Glass Scraps', price: 0.5, unit: 'kg' },
                { name: 'Window Panes', price: 1, unit: 'kg' },
                { name: 'Glass Jars/Food Containers', price: 1.2, unit: 'kg' }
            ]
        },
        {
            name: 'Automotive', items: [
                { name: 'Bike Tire (Old)', price: 20, unit: 'pcs' },
                { name: 'Car Tire (Steel Belted)', price: 50, unit: 'pcs' },
                { name: 'Alloy Wheel Rim', price: 400, unit: 'pcs' },
                { name: 'Car Plastic Bumper', price: 100, unit: 'pcs' },
                { name: 'Car Door (Metal)', price: 500, unit: 'pcs' },
                { name: 'Car Radiator (Copper/Alu)', price: 600, unit: 'pcs' }
            ]
        },
        {
            name: 'Textiles', items: [
                { name: 'Cotton Rags (Mixed)', price: 4, unit: 'kg' },
                { name: 'Woolen Garment Scraps', price: 6, unit: 'kg' },
                { name: 'Old Bed Sheets', price: 5, unit: 'kg' },
                { name: 'Curtain Waste', price: 3, unit: 'kg' },
                { name: 'Denim Jean Scraps', price: 7, unit: 'kg' },
                { name: 'Synthetic Fabric Rags', price: 2, unit: 'kg' }
            ]
        },
        {
            name: 'Batteries', items: [
                { name: 'UPS Battery (7Ah)', price: 120, unit: 'pcs' },
                { name: 'Inverter Battery (150Ah)', price: 1500, unit: 'pcs' },
                { name: 'Li-ion Battery (Mobile)', price: 10, unit: 'pcs' },
                { name: 'Laptop Battery (Old)', price: 30, unit: 'pcs' },
                { name: 'AAA Rechargeable Cells', price: 2, unit: 'pcs' },
                { name: 'AA Alkaline Cells', price: 1, unit: 'pcs' }
            ]
        }
    ];

    let totalAdded = 0;

    for (const catData of categoriesData) {
        // Find or Create Category
        let category = await prisma.scrapCategory.findFirst({
            where: { name: catData.name }
        });

        if (!category) {
            category = await prisma.scrapCategory.create({
                data: {
                    name: catData.name,
                    image: `/icons/${catData.name.toLowerCase().split(' ')[0]}.png`
                }
            });
            console.log(`Created category: ${category.name}`);
        } else {
            console.log(`Using existing category: ${category.name}`);
        }

        console.log(`Processing category: ${category.name}`);

        for (const item of catData.items) {
            // Check if item exists in this category
            const existing = await prisma.scrapItem.findFirst({
                where: {
                    name: item.name,
                    categoryId: category.id
                }
            });

            if (!existing) {
                await prisma.scrapItem.create({
                    data: {
                        name: item.name,
                        categoryId: category.id,
                        basePrice: item.price,
                        currentPrice: item.price,
                        unit: item.unit
                    }
                });
                totalAdded++;
            }
        }
    }

    console.log(`Success! Added ${totalAdded} new scrap items.`);
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
