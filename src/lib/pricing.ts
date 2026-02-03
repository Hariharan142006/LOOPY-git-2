export interface ScrapItem {
    id: string;
    name: string;
    category: string;
    basePrice: number; // Price per kg
    demandFactor: number; // 0.0 to 1.0 (e.g., 0.1 = 10% increase)
    shareToCustomer: number; // 0.0 to 1.0 (e.g., 0.7 = 70% of increase passed to customer)
}

export const SCRAP_ITEMS: ScrapItem[] = [
    { id: '1', name: 'Newspaper', category: 'Paper', basePrice: 12, demandFactor: 0.1, shareToCustomer: 0.8 },
    { id: '2', name: 'Iron', category: 'Metal', basePrice: 25, demandFactor: 0.2, shareToCustomer: 0.7 },
    { id: '3', name: 'Plastic Bottles', category: 'Plastic', basePrice: 10, demandFactor: 0.0, shareToCustomer: 0.5 },
    { id: '4', name: 'Cardboard', category: 'Paper', basePrice: 8, demandFactor: 0.05, shareToCustomer: 0.8 },
    { id: '5', name: 'Copper', category: 'Metal', basePrice: 450, demandFactor: 0.15, shareToCustomer: 0.6 },
];

/**
 * Calculates the dynamic price for a scrap item.
 * Formula: FinalPrice = BasePrice * (1 + (DemandFactor * ShareToCustomer))
 * Effect: If demand is high, customer gets a higher price, but not the full vendor increase (platform keeps margin).
 */
export function calculateDynamicPrice(item: ScrapItem): number {
    const increase = item.demandFactor * item.shareToCustomer;
    const price = item.basePrice * (1 + increase);
    return Math.round(price * 100) / 100; // Round to 2 decimals
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Math.floor(amount));
}
