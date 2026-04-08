import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        console.log(`[FORENSIC] Fetching Categories...`);
        const categories = await db.scrapCategory.findMany({
            include: {
                items: true
            }
        });

        console.log(`[FORENSIC] Found ${categories.length} categories`);

        // Map icons to the same structure as web
        const mappedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.image, // URL or string name
            items: cat.items
        }));

        return NextResponse.json({ categories: mappedCategories });
    } catch (error: any) {
        console.error("[FORENSIC] Categories API Error:", error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}

