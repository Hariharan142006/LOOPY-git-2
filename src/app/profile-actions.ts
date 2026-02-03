'use server';

import { db } from '@/lib/db';

export async function updateUserProfileAction(userId: string, data: { name?: string; email?: string; phone?: string; address?: string }) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                // Address is usually stored in a separate table, but if we want to store it on User for simplicity or update the primary address:
                // For now, let's assume we update the user details. If address is needed, we update the first address or create one.
            }
        });

        // If address is provided, update the first address found or create it
        if (data.address) {
            const existingAddress = await db.address.findFirst({ where: { userId } });
            if (existingAddress) {
                await db.address.update({
                    where: { id: existingAddress.id },
                    data: { street: data.address } // Simplified mapping
                });
            } else {
                await db.address.create({
                    data: {
                        userId,
                        street: data.address,
                        city: 'Unknown',
                        state: 'Unknown',
                        zip: '000000',
                        lat: 0,
                        lng: 0
                    }
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function getAgentStatsAction(agentId: string) {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        console.log(`[Stats] Fetching stats for agent: ${agentId}`);

        const [completed, pending, user, transactions] = await Promise.all([
            db.booking.count({
                where: {
                    agentId: agentId,
                    status: 'COMPLETED',
                    updatedAt: { gte: firstDayOfMonth }
                }
            }),
            db.booking.count({
                where: {
                    agentId: agentId,
                    status: { in: ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS'] }
                }
            }),
            db.user.findUnique({
                where: { id: agentId },
                select: { walletBalance: true }
            }),
            db.walletTransaction.findMany({
                where: {
                    userId: agentId,
                    type: 'CREDIT',
                    reference: { not: 'ADMIN_FUND' }  // Exclude admin-added funds
                },
                select: { amount: true }
            })
        ]);

        console.log(`[Stats] Wallet balance from DB: ${user?.walletBalance}`);

        // Calculate total earnings from all credit transactions (excluding admin funds)
        const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        console.log(`[Stats] Total earnings from ${transactions.length} job transactions: ${totalEarnings}`);

        return {
            completedThisMonth: completed,
            pendingOrders: pending,
            walletBalance: user?.walletBalance || 0,
            earnings: totalEarnings
        };
    } catch (error) {
        console.error("Get Agent Stats Error:", error);
        return { completedThisMonth: 0, pendingOrders: 0, walletBalance: 0, earnings: 0 };
    }
}
