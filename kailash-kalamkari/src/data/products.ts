import { Product } from '@/components/ProductCard';
import kalamkariHero from '@/assets/kalamkari-hero.jpg';
import kalamkariProducts from '@/assets/kalamkari-products.jpg';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Traditional Peacock Kalamkari Saree',
    price: 4500,
    originalPrice: 6000,
    image: kalamkariHero,
    category: 'Sarees',
    description: 'Hand-painted kalamkari saree featuring intricate peacock designs with natural dyes',
    colors: ['#1e3a8a', '#dc2626', '#ca8a04', '#065f46'],
    inStock: true,
  },
  {
    id: '2',
    name: 'Floral Kalamkari Cotton Dupatta',
    price: 1200,
    originalPrice: 1500,
    image: kalamkariProducts,
    category: 'Dupattas',
    description: 'Elegant cotton dupatta with hand-painted floral motifs in traditional kalamkari style',
    colors: ['#7c2d12', '#ca8a04', '#065f46'],
    inStock: true,
  },
  {
    id: '3',
    name: 'Tree of Life Kalamkari Wall Art',
    price: 2800,
    image: kalamkariHero,
    category: 'Home Decor',
    description: 'Beautiful tree of life design on cotton fabric, perfect for wall decoration',
    colors: ['#1e3a8a', '#7c2d12', '#ca8a04'],
    inStock: true,
  },
  {
    id: '4',
    name: 'Mythological Kalamkari Fabric',
    price: 800,
    originalPrice: 1000,
    image: kalamkariProducts,
    category: 'Fabrics',
    description: 'Premium cotton fabric with mythological scenes painted in traditional kalamkari technique',
    colors: ['#dc2626', '#ca8a04', '#065f46'],
    inStock: true,
  },
  {
    id: '7',
    name: 'Elephant Motif Kalamkari Bedsheet',
    price: 2200,
    originalPrice: 2800,
    image: kalamkariHero,
    category: 'Home Decor',
    description: 'King size bedsheet with elephant motifs painted in authentic kalamkari style',
    colors: ['#7c2d12', '#ca8a04', '#1e3a8a'],
    inStock: true,
  },
];

export const categories = [...new Set(sampleProducts.map(p => p.category))];
export const colors = [...new Set(sampleProducts.flatMap(p => p.colors))];
export const maxPrice = Math.max(...sampleProducts.map(p => p.originalPrice || p.price));