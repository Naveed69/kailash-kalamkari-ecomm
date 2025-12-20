import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom"
// Simulate 36 gallery images (add more real/realistic sources and alt/category for demo)
const galleryImages = [
    {
        id: 1,
        src: "/Gallery/11.jpg",
        alt: "Traditional Kalamkari Art",
        category: "Art"
    },
    {
        id: 2,
        src: "/Gallery/12.jpg",
        alt: "Artisan at Work",
        category: "Process"
    },
    {
        id: 3,
        src: "/Gallery/13.jpg",
        alt: "Intricate Patterns",
        category: "Patterns"
    },
    {
        id: 4,
        src: "/Gallery/14.jpg",
        alt: "Kalamkari Fabric",
        category: "Fabric"
    },
    {
        id: 5,
        src: "/Gallery/15.jpg",
        alt: "Saree Collection",
        category: "Collection"
    },
    {
        id: 6,
        src: "/Gallery/16.jpg",
        alt: "Artisan Community",
        category: "Community"
    },
    {
        id: 7,
        src: "/Gallery/17.jpg",
        alt: "Handcrafted Details",
        category: "Details"
    },
    {
        id: 8,
        src: "/Gallery/18.jpg",
        alt: "Traditional Workshop",
        category: "Workshop"
    },
    {
        id: 9,
        src: "/Gallery/19.jpg",
        alt: "Store Ambience",
        category: "Store"
    },
    {
        id: 10,
        src: "/Gallery/20.jpg",
        alt: "Kalamkari in Nature",
        category: "Natural"
    },
    {
        id: 11,
        src: "/Gallery/21.jpg",
        alt: "Blue Motifs",
        category: "Design"
    },
    {
        id: 12,
        src: "/Gallery/22.jpg",
        alt: "Traditional Colors",
        category: "Color"
    },
    {
        id: 13,
        src: "/Gallery/23.jpg",
        alt: "Hands at Work",
        category: "Work"
    },
    {
        id: 14,
        src: "/Gallery/24.jpg",
        alt: "Natural Dyes",
        category: "Process"
    },
    {
        id: 15,
        src: "/Gallery/25.jpg",
        alt: "Flowing Sarees",
        category: "Textiles"
    },
    {
        id: 16,
        src: "/Gallery/26.jpg",
        alt: "Workshop Tools",
        category: "Workshop"
    },
    {
        id: 17,
        src: "/Gallery/27.jpg",
        alt: "Artisan Brush",
        category: "Process"
    },
    {
        id: 18,
        src: "/Gallery/28.jpg",
        alt: "Pattern Closeup",
        category: "Patterns"
    },
    {
        id: 19,
        src: "/Gallery/29.jpg",
        alt: "Festive Kalamkari",
        category: "Festival"
    },
    {
        id: 20,
        src: "/Gallery/30.jpg",
        alt: "Finishing Touch",
        category: "Craft"
    },
    {
        id: 21,
        src: "/Gallery/31.jpg",
        alt: "Saree Drape",
        category: "Collection"
    },
    {
        id: 22,
        src: "/Gallery/32.jpg",
        alt: "Bold Design",
        category: "Patterns"
    },
    {
        id: 23,
        src: "/Gallery/33.jpg",
        alt: "Vivid Details",
        category: "Color"
    },
    {
        id: 24,
        src: "/Gallery/34.jpg",
        alt: "Classical Art",
        category: "Tradition"
    },
    {
        id: 25,
        src: "/Gallery/35.jpg",
        alt: "Heritage Craft",
        category: "Art"
    },
    {
        id: 26,
        src: "/Gallery/36.jpg",
        alt: "Peacock Motif",
        category: "Motif"
    },
    {
        id: 27,
        src: "/Gallery/37.jpg",
        alt: "Workshop Setting",
        category: "Workshop"
    },
    {
        id: 28,
        src: "/Gallery/38.jpg",
        alt: "Saree Texture",
        category: "Texture"
    },
    {
        id: 29,
        src: "/Gallery/39.jpg",
        alt: "Modern Touch",
        category: "Modern"
    },
    {
        id: 30,
        src: "/Gallery/40.jpg",
        alt: "Traditional Border",
        category: "Edges"
    },
    {
        id: 31,
        src: "/Gallery/41.jpg",
        alt: "Vibrant Borders",
        category: "Design"
    },
    {
        id: 32,
        src: "/Gallery/42.jpg",
        alt: "Blossom Kalamkari",
        category: "Floral"
    },
    {
        id: 33,
        src: "/Gallery/43.jpg",
        alt: "Painter's Palette",
        category: "Artist"
    },
    {
        id: 34,
        src: "/Gallery/44.jpg",
        alt: "Colorful Sarees",
        category: "Color"
    },
    {
        id: 35,
        src: "/Gallery/45.jpg",
        alt: "Dress Details",
        category: "Details"
    },
    {
        id: 36,
        src: "/Gallery/46.jpg",
        alt: "Ornate Patterns",
        category: "Patterns"
    },
    {
        id: 37,
        src: "/Gallery/47.jpg",
        alt: "Ornate Patterns",
        category: "Patterns"
    }
];

let INITIAL_IMAGES_COUNT = 10;

const Gallery = ({isFromHome =false}) => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    
    const [visibleCount, setVisibleCount] = useState(INITIAL_IMAGES_COUNT);
     const navigate = useNavigate()
    if(isFromHome ){
        INITIAL_IMAGES_COUNT=3
    }
    const showMore = () => {
        if (isFromHome) 
            navigate("/gallery")
        setVisibleCount(Math.min(visibleCount + 10, galleryImages.length));
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#D49217] mb-4 font-serif">
                        Our Gallery
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Explore the vibrant world of Kalamkari, from the intricate process of creation to our stunning finished collections.
                    </p>
                </div>
                {/* 2 cards per row in mobile using grid-cols-2 and responsive breakpoints */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.slice(0, visibleCount).map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                            onClick={() => setSelectedImage(image.id)}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white font-semibold text-lg mb-2">{image.alt}</p>
                                    <span className="inline-flex items-center text-white/80 text-sm">
                                        <ZoomIn className="w-4 h-4 mr-2" />
                                        View Larger
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {visibleCount < galleryImages.length && (
                    <div className="flex justify-center mt-8">
                        <button
                            className="px-6 py-2 rounded-lg bg-[#D49217] text-white font-semibold hover:bg-[#b87d14] transition-colors text-lg shadow"
                            onClick={showMore}
                        >
                            Show More
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {selectedImage !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <img
                                    src={galleryImages.find((img) => img.id === selectedImage)?.src}
                                    alt={galleryImages.find((img) => img.id === selectedImage)?.alt}
                                    className="w-full h-full object-contain max-h-[85vh]"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white">
                                    <h3 className="text-xl font-semibold">
                                        {galleryImages.find((img) => img.id === selectedImage)?.alt}
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        {galleryImages.find((img) => img.id === selectedImage)?.category}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Gallery;
