'use server';

import { db } from '@/lib/db';

export async function addAddressAction(userId: string, data: { label?: string, street: string, city: string, state: string, zip: string, lat: number, lng: number }) {
    try {
        const address = await db.address.create({
            data: {
                userId,
                label: data.label || 'Home',
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                lat: data.lat,
                lng: data.lng
            }
        });
        return { success: true, address };
    } catch (error) {
        console.error("Add Address Error:", error);
        return { success: false, error: "Failed to add address" };
    }
}

export async function getUserAddressesAction(userId: string) {
    try {
        const addresses = await db.address.findMany({
            where: {
                userId,
                label: { not: null } // Only return explicitly saved addresses
            },
            orderBy: { id: 'desc' } // Newest first
        });
        return addresses;
    } catch (error) {
        console.error("Get Addresses Error:", error);
        return [];
    }
}

export async function deleteAddressAction(addressId: string) {
    try {
        await db.address.delete({
            where: { id: addressId }
        });
        return { success: true };
    } catch (error) {
        console.error("Delete Address Error:", error);
        return { success: false, error: "Failed to delete address" };
    }
}
