import * as React from 'react';
import { MasonryGrid } from '@/components/ui/image-testimonial-grid';

// --- Kalamkari Sarees Data ---
const kalamkariTestimonials = [
  {
    profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
    name: 'Priya Sharma',
    feedback: 'Exquisite Peacock Motif - Perfect for Festivals',
    mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Lakshmi Reddy',
    feedback: 'Traditional Srikalahasti Art - Heritage Collection',
    mainImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&h=1000&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/56.jpg',
    name: 'Anjali Patel',
    feedback: 'Hand-painted Temple Border - Museum Quality',
    mainImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e4e59?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/78.jpg',
    name: 'Divya Krishnan',
    feedback: 'Madhubani Fusion Kalamkari - Stunning Colors',
    mainImage: 'https://images.unsplash.com/photo-1610030469025-8d0e0f08e5e5?auto=format&fit=crop&w=800&h=1100&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Meera Iyer',
    feedback: 'Cotton Kalamkari - Comfortable & Elegant',
    mainImage: 'https://images.unsplash.com/photo-1583391733981-565f80e96e70?auto=format&fit=crop&w=800&h=950&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/88.jpg',
    name: 'Kavita Desai',
    feedback: 'Floral Kalamkari Silk - Wedding Favorite',
    mainImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e4e59?auto=format&fit=crop&w=800&h=1050&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/21.jpg',
    name: 'Shalini Menon',
    feedback: 'Pen Kalamkari Masterpiece - Collector\'s Item',
    mainImage: 'https://images.unsplash.com/photo-1583391733971-367c6b83734f?auto=format&fit=crop&w=800&h=1150&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/11.jpg',
    name: 'Radha Nair',
    feedback: 'Natural Dyes Kalamkari - Eco-Friendly Beauty',
    mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&h=1000&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/56.jpg',
    name: 'Anjali Patel',
    feedback: 'Hand-painted Temple Border - Museum Quality',
    mainImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e4e59?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    profileImage: 'https://randomuser.me/api/portraits/women/78.jpg',
    name: 'Divya Krishnan',
    feedback: 'Madhubani Fusion Kalamkari - Stunning Colors',
    mainImage: 'https://images.unsplash.com/photo-1610030469025-8d0e0f08e5e5?auto=format&fit=crop&w=800&h=1100&q=80',
  },
];

// --- Reusable Card Component ---
const KalamkariCard = ({ profileImage, name, feedback, mainImage }: (typeof kalamkariTestimonials)[0]) => (
  <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg">
    <img
      src={mainImage}
      alt={feedback}
      className="w-full h-auto object-cover"
      onError={(e) => {
        e.currentTarget.src = 'https://placehold.co/800x600/8B4513/ffffff?text=Kalamkari+Saree';
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
    <div className="absolute top-0 left-0 p-4 text-white">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={profileImage}
          className="w-10 h-10 rounded-full border-2 border-white/90 shadow-md"
          alt={name}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/40x40/EFEFEF/333333?text=' + name.charAt(0);
          }}
        />
        <span className="font-semibold text-sm drop-shadow-md">{name}</span>
      </div>
      <p className="text-sm font-medium leading-tight drop-shadow-md">{feedback}</p>
    </div>
  </div>
);

// --- Demo Component ---
const KalamkariMasonryDemo = () => {
  const [columns, setColumns] = React.useState(4);

  // Responsive columns based on screen width
  const getColumns = (width: number) => {
    if (width < 640) return 2;    // Mobile: 2 per row
    if (width < 1024) return 2;   // Tablet
    if (width < 1280) return 3;   // Desktop
    return 4;                     // Large desktop
  };

  React.useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            What Our Customers Say
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the timeless beauty of hand-painted Kalamkari sarees, where ancient artistry meets contemporary elegance
          </p>
        </div>
        <MasonryGrid columns={columns} gap={4}>
          {kalamkariTestimonials.map((card, index) => (
            <KalamkariCard key={index} {...card} />
          ))}
        </MasonryGrid>
      </div>
    </div>
  );
};

export default KalamkariMasonryDemo;