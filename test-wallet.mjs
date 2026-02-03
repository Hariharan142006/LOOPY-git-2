// Test script to verify database wallet operations
import { db } from './src/lib/db';

async function testWalletOperations() {
    try {
        console.log('=== Starting Wallet Test ===');

        // 1. Find an agent user
        const agent = await db.user.findFirst({
            where: { role: 'AGENT' }
        });

        if (!agent) {
            console.log('No agent found in database');
            return;
        }

        console.log(`Found agent: ${agent.name} (ID: ${agent.id})`);
        console.log(`Current balance: ${agent.walletBalance}`);

        // 2. Add funds
        const amountToAdd = 1000;
        console.log(`\nAdding ${amountToAdd} to wallet...`);

        const updated = await db.user.update({
            where: { id: agent.id },
            data: {
                walletBalance: { increment: amountToAdd }
            }
        });

        console.log(`Update result - new balance: ${updated.walletBalance}`);

        // 3. Verify by re-querying
        const verified = await db.user.findUnique({
            where: { id: agent.id },
            select: { walletBalance: true }
        });

        console.log(`Verified balance from DB: ${verified?.walletBalance}`);

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await db.$disconnect();
    }
}

testWalletOperations();
