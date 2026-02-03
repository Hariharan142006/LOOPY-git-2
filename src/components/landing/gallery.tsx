"use client";

import CircularGallery from './circular-gallery';

const galleryItems = [
    { image: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=800&auto=format&fit=crop", text: "Sorting Center" },
    { image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop", text: "Recycling Fleet" },
    { image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005e4?q=80&w=800&auto=format&fit=crop", text: "E-Waste" },
    { image: "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?q=80&w=800&auto=format&fit=crop", text: "Happy Users" },
    { image: "https://images.unsplash.com/photo-1503596476-1c12a8ab9a8b?q=80&w=800&auto=format&fit=crop", text: "Paper Recycling" },
    { image: "https://images.unsplash.com/photo-1530587222861-53354967636b?q=80&w=800&auto=format&fit=crop", text: "Metal Scrap" }
];

export function Gallery() {
    return (
        <section className="py-24 bg-neutral-950 overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <h2 className="text-3xl font-bold text-white text-center">Gallery</h2>
                <p className="text-gray-400 text-center mt-2">A glimpse into our operations and impact.</p>
            </div>

            <div style={{ height: '600px', position: 'relative' }}>
                <CircularGallery
                    items={galleryItems}
                    bend={1}
                    textColor="#ffffff"
                    borderRadius={0.05}
                    scrollEase={0.05}
                    scrollSpeed={2}
                />
            </div>
        </section>
    );
}
