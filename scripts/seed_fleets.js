import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
    await db.fleetVehicle.createMany({
        data: [
            { name: "Tata Ace 1", licensePlate: "MH-12-AB-3401", vehicleType: "Mini Truck", status: "ACTIVE" },
            { name: "Ashok Leyland Dost", licensePlate: "KA-01-XY-9902", vehicleType: "Large Truck", status: "ACTIVE" },
            { name: "Hero Splendor Pro", licensePlate: "TN-09-CQ-1103", vehicleType: "Bike", status: "ACTIVE" }
        ]
    });
    console.log("Seeded fleets");
}

main().catch(console.error).finally(() => db.$disconnect());
