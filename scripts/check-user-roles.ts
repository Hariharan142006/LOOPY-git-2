
import { db } from '../src/lib/db';

async function main() {
    console.log('Checking users in database...');
    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true
            }
        });

        console.log('Found users:', users.length);
        console.table(users);

        const john = users.find(u => u.name?.toLowerCase().includes('john'));
        if (john) {
            console.log('\nPotential match for "John Doe":');
            console.log(john);
            if (john.role !== 'AGENT') {
                console.warn(`WARNING: John Doe has role "${john.role}", expected "AGENT".`);
            }
        } else {
            console.log('\nUser "John Doe" not found in database.');
        }

    } catch (error) {
        console.error('Error querying database:', error);
    }
}

main();
