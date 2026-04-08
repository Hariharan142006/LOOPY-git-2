export type AuthUser = {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    status?: string;
    isOnline?: boolean;
    walletBalance?: number;
    totalPickups?: number;
    rating?: number;
    city?: string;
    vehicleType?: string;
    fleetDetails?: {
        id: string;
        name: string;
        licensePlate: string;
        vehicleType: string;
    };
};

export type ScrapItemWithCategory = {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    basePrice: number;
    currentPrice: number;
    unit: string;
    image: string | null;
    category: {
        id?: string;
        name: string;
        description?: string;
        icon?: string;
    };
};
