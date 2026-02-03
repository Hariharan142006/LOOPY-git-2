'use server';

import { db } from '@/lib/db';

// Admin adds funds to Agent's wallet
export async function addFundsToAgentAction(adminId: string, agentId: string, amount: number) {
    try {
        console.log(`[Wallet] ===== STARTING FUND TRANSFER =====`);
        console.log(`[Wallet] Amount: ${amount}, Agent: ${agentId}, Admin: ${adminId}`);

        if (amount <= 0) {
            console.log(`[Wallet] Invalid amount: ${amount}`);
            return { success: false, error: "Invalid amount" };
        }

        // Read current balance
        const agent = await db.user.findUnique({
            where: { id: agentId },
            select: { walletBalance: true, name: true, role: true }
        });

        if (!agent) {
            console.log(`[Wallet] Agent not found: ${agentId}`);
            return { success: false, error: "Agent not found" };
        }

        console.log(`[Wallet] Agent: ${agent.name} (${agent.role})`);
        console.log(`[Wallet] Current balance: ${agent.walletBalance}`);

        // Calculate new balance
        const currentBalance = agent.walletBalance || 0;
        const newBalance = currentBalance + amount;
        console.log(`[Wallet] Calculated new balance: ${currentBalance} + ${amount} = ${newBalance}`);

        // Update with explicit new value
        const updated = await db.user.update({
            where: { id: agentId },
            data: { walletBalance: newBalance }
        });
        console.log(`[Wallet] Update result - balance is now: ${updated.walletBalance}`);

        // Verify by re-reading
        const verified = await db.user.findUnique({
            where: { id: agentId },
            select: { walletBalance: true }
        });
        console.log(`[Wallet] Verified from DB: ${verified?.walletBalance}`);

        // Create transaction record
        const txRecord = await db.walletTransaction.create({
            data: {
                userId: agentId,
                amount: amount,
                type: 'CREDIT',
                reference: 'ADMIN_FUND',
                description: 'Funds added by Admin',
                relatedUserId: adminId
            }
        });
        console.log(`[Wallet] Transaction record created: ${txRecord.id}`);
        console.log(`[Wallet] ===== TRANSFER COMPLETE =====`);

        return { success: true, newBalance: verified?.walletBalance || 0 };

    } catch (error) {
        console.error("[Wallet] ===== ERROR =====", error);
        return { success: false, error: "Failed to add funds" };
    }
}

// Agent pays Customer (Deducts Agent, Credits Customer)
export async function payCustomerFromAgentWalletAction(agentId: string, customerId: string, bookingId: string, amount: number) {
    try {
        console.log(`[Payment] Starting payment: ₹${amount} from agent ${agentId} to customer ${customerId}`);

        if (amount <= 0) {
            console.log(`[Payment] Invalid amount: ${amount}`);
            return { success: false, error: "Invalid amount" };
        }

        // 1. Check Agent Balance
        const agent = await db.user.findUnique({
            where: { id: agentId },
            select: { walletBalance: true, name: true }
        });

        console.log(`[Payment] Agent ${agent?.name} balance: ₹${agent?.walletBalance}`);

        if (!agent || (agent.walletBalance || 0) < amount) {
            console.log(`[Payment] Insufficient balance`);
            return { success: false, error: "Insufficient wallet balance" };
        }

        // Get customer current balance
        const customer = await db.user.findUnique({
            where: { id: customerId },
            select: { walletBalance: true, name: true }
        });

        console.log(`[Payment] Customer ${customer?.name} balance BEFORE: ₹${customer?.walletBalance}`);

        await db.$transaction(async (tx) => {
            // 2. Deduct from Agent (using decrement is OK for deduction)
            const agentBalance = agent.walletBalance || 0;
            await tx.user.update({
                where: { id: agentId },
                data: { walletBalance: agentBalance - amount }
            });

            // 3. Create Debit Record for Agent
            await tx.walletTransaction.create({
                data: {
                    userId: agentId,
                    amount: amount,
                    type: 'DEBIT',
                    reference: bookingId,
                    description: `Paid for pickup #${bookingId.slice(0, 8)}`,
                    relatedUserId: customerId
                }
            });

            // 4. Add to Customer (explicit calculation instead of increment)
            const customerBalance = customer?.walletBalance || 0;
            const newCustomerBalance = customerBalance + amount;
            console.log(`[Payment] Customer new balance: ${customerBalance} + ${amount} = ${newCustomerBalance}`);

            await tx.user.update({
                where: { id: customerId },
                data: { walletBalance: newCustomerBalance }
            });

            // 5. Create Credit Record for Customer
            await tx.walletTransaction.create({
                data: {
                    userId: customerId,
                    amount: amount,
                    type: 'CREDIT',
                    reference: bookingId,
                    description: `Payment received for pickup`,
                    relatedUserId: agentId
                }
            });

            // 6. Mark Booking as COMPLETED and PAID
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'COMPLETED' }
            });
        });

        // Verify the update
        const verifiedCustomer = await db.user.findUnique({
            where: { id: customerId },
            select: { walletBalance: true }
        });
        console.log(`[Payment] Customer balance AFTER (verified): ₹${verifiedCustomer?.walletBalance}`);
        console.log(`[Payment] Payment complete!`);

        return { success: true };

    } catch (error) {
        console.error("[Payment] Error:", error);
        return { success: false, error: "Transaction failed" };
    }
}

export async function getWalletBalanceAction(userId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { walletBalance: true }
        });
        return user?.walletBalance || 0;
    } catch (error) {
        return 0;
    }
}

export async function getWalletTransactionsAction(userId: string) {
    try {
        const txs = await db.walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return txs;
    } catch (error) {
        return [];
    }
}
