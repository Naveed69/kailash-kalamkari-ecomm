import { Product } from "@/components/ProductCard";
import kalamkariHero from "@/assets/kalamkari-hero.jpg";
import kalamkariProducts from "@/assets/kalamkari-products.jpg";

export const fashionProducts = [
  // SAREE OBJECT (First Object)
  {
    category: "Sarees",
    subCategories: [
      {
        name: "Silk Sarees",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "silk-001",
            name: "Banarasi Silk Saree",
            price: 8500,
            originalPrice: 12000,
            image: kalamkariHero,
            description: "Pure Banarasi silk saree with intricate zari work",
            colors: ["#FFD700", "#800020", "#000080", "#228B22"],
            inStock: true,
            rating: 4.8,
            category: "Silk Sarees",
          },
          {
            id: "silk-002",
            name: "Kanjivaram Silk Saree",
            price: 12500,
            originalPrice: 18000,
            image: kalamkariProducts,
            description:
              "Traditional South Indian Kanjivaram silk with temple border",
            colors: ["#DC143C", "#2F4F4F", "#4B0082", "#8B4513"],
            inStock: true,
            rating: 4.9,
            category: "Silk Sarees",
          },
          {
            id: "silk-003",
            name: "Tussar Silk Saree",
            price: 6500,
            originalPrice: 9000,
            image: kalamkariHero,
            description: "Elegant Tussar silk saree with natural texture",
            colors: ["#F5DEB3", "#8B0000", "#2E8B57", "#696969"],
            inStock: true,
            rating: 4.6,
            category: "Silk Sarees",
          },
        ],
      },
      {
        name: "Cotton Sarees",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "cotton-001",
            name: "Handloom Cotton Saree",
            price: 2500,
            originalPrice: 3500,
            image: kalamkariHero,
            description: "Comfortable handloom cotton saree for daily wear",
            colors: ["#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0"],
            inStock: true,
            rating: 4.5,
            category: "Cotton Sarees",
          },
          {
            id: "cotton-002",
            name: "Kalamkari Cotton Saree",
            price: 3200,
            originalPrice: 4500,
            image: kalamkariProducts,
            description: "Hand-painted Kalamkari art on pure cotton",
            colors: ["#FFFFFF", "#000000", "#8B4513", "#228B22"],
            inStock: true,
            rating: 4.7,
            category: "Cotton Sarees",
          },
          {
            id: "cotton-003",
            name: "Printed Cotton Saree",
            price: 1800,
            originalPrice: 2500,
            image: kalamkariHero,
            description:
              "Lightweight printed cotton saree with floral patterns",
            colors: ["#FF9FF3", "#FEA47F", "#EAB543", "#55E6C1"],
            inStock: true,
            rating: 4.3,
            category: "Cotton Sarees",
          },
        ],
      },
      {
        name: "Designer Sarees",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "designer-001",
            name: "Embroidered Georgette Saree",
            price: 5500,
            originalPrice: 8000,
            image: kalamkariProducts,
            description: "Elegant georgette saree with intricate embroidery",
            colors: ["#6D214F", "#182C61", "#BDC581", "#EAB543"],
            inStock: true,
            rating: 4.6,
            category: "Designer Sarees",
          },
        ],
      },
    ],
  },
  // DUPATTA OBJECT (Second Object)
  {
    category: "Dupattas",
    subCategories: [
      {
        name: "Silk Dupattas",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "dupatta-silk-001",
            name: "Banarasi Silk Dupatta",
            price: 2500,
            originalPrice: 3800,
            image: "banarasi-dupatta.jpg",
            description: "Heavy Banarasi silk dupatta with gold zari work",
            colors: ["#FFD700", "#800020", "#000080"],
            inStock: true,
            rating: 4.7,
          },
        ],
      },
      {
        name: "Cotton Dupattas",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "dupatta-cotton-001",
            name: "Handblock Print Dupatta",
            price: 1200,
            originalPrice: 1800,
            image: "handblock-dupatta.jpg",
            description:
              "Soft cotton dupatta with traditional handblock prints",
            colors: ["#FF6B6B", "#48DBFB", "#1DD1A1"],
            inStock: true,
            rating: 4.4,
          },
        ],
      },
      {
        name: "Embroidered Dupattas",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "dupatta-embroidered-001",
            name: "Phulkari Dupatta",
            price: 3200,
            originalPrice: 4500,
            image: "phulkari-dupatta.jpg",
            description: "Traditional Punjabi Phulkari embroidery dupatta",
            colors: ["#DC143C", "#FFD700", "#228B22"],
            inStock: true,
            rating: 4.8,
          },
        ],
      },
      {
        name: "Embroidered Dupattass",
        subCategoriesImage: kalamkariHero,
        products: [
          {
            id: "dupatta-embroidered-001",
            name: "Phulkari Dupatta",
            price: 3200,
            originalPrice: 4500,
            image: "phulkari-dupatta.jpg",
            description: "Traditional Punjabi Phulkari embroidery dupatta",
            colors: ["#DC143C", "#FFD700", "#228B22"],
            inStock: true,
            rating: 4.8,
          },
        ],
      },
    ],
  },

  // FABRIC OBJECT (Third Object)
  {
    category: "Fabrics",
    subCategories: [
      {
        name: "Silk Fabrics",
        subCategoriesImage: "pure-silk-fabric.jpg",
        products: [
          {
            id: "fabric-silk-001",
            name: "Pure Silk Fabric - 6 meters",
            price: 4200,
            originalPrice: 6000,
            image: "pure-silk-fabric.jpg",
            description: "High quality pure silk fabric for custom stitching",
            colors: ["#FFD700", "#800020", "#000080", "#228B22"],
            inStock: true,
            rating: 4.6,
          },
        ],
      },
      {
        name: "Cotton Fabrics",
        subCategoriesImage: "handloom-cotton-fabric.jpg",
        products: [
          {
            id: "fabric-cotton-001",
            name: "Handloom Cotton Fabric - 6 meters",
            price: 1800,
            originalPrice: 2500,
            image: "handloom-cotton-fabric.jpg",
            description: "Breathable handloom cotton fabric for daily wear",
            colors: ["#FFFFFF", "#000000", "#8B4513"],
            inStock: true,
            rating: 4.5,
          },
        ],
      },
      {
        name: "Linen Fabrics",
        subCategoriesImage: "linen-fabric.jpg",
        products: [
          {
            id: "fabric-linen-001",
            name: "Premium Linen Fabric - 6 meters",
            price: 3500,
            originalPrice: 4800,
            image: "linen-fabric.jpg",
            description: "Eco-friendly linen fabric for summer clothing",
            colors: ["#F5DEB3", "#696969", "#2F4F4F"],
            inStock: true,
            rating: 4.7,
          },
        ],
      },
    ],
  },
  // HOME DECOR OBJECT (Fourth Object)
  {
    category: "Home Decor",
    subCategories: [
      {
        name: "Wall Hangings",
        subCategoriesImage: "macrame-wall.jpg",

        products: [
          {
            id: "home-001",
            name: "Macrame Wall Hanging",
            price: 1800,
            originalPrice: 2500,
            image: "macrame-wall.jpg",
            description: "Handcrafted macrame wall hanging with beads",
            colors: ["#F5DEB3", "#8B4513", "#000000"],
            inStock: true,
            rating: 4.6,
            dimensions: "60cm x 90cm",
            material: "Cotton rope",
          },
          {
            id: "home-002",
            name: "Traditional Madhubani Wall Art",
            price: 3200,
            originalPrice: 4500,
            image: "madhubani-art.jpg",
            description: "Authentic Madhubani painting on canvas",
            colors: ["#FFD700", "#DC143C", "#000080", "#228B22"],
            inStock: true,
            rating: 4.8,
            dimensions: "45cm x 60cm",
            material: "Canvas",
          },
        ],
      },
      {
        name: "Cushions & Pillows",
        subCategoriesImage: "silk-cushion.jpg",
        products: [
          {
            id: "home-003",
            name: "Embroidered Silk Cushion Cover",
            price: 1200,
            originalPrice: 1800,
            image: "silk-cushion.jpg",
            description:
              "Hand-embroidered silk cushion cover with traditional motifs",
            colors: ["#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0"],
            inStock: true,
            rating: 4.5,
            dimensions: "18x18 inches",
            material: "Silk",
          },
          {
            id: "home-004",
            name: "Block Print Cotton Cushions",
            price: 900,
            originalPrice: 1300,
            image: "blockprint-cushion.jpg",
            description: "Set of 2 cotton cushion covers with handblock print",
            colors: ["#FFFFFF", "#000000", "#8B4513", "#228B22"],
            inStock: true,
            rating: 4.4,
            dimensions: "18x18 inches",
            material: "Cotton",
          },
        ],
      },
      {
        name: "Table Decor",
        subCategoriesImage: "brass-thali.jpg",
        products: [
          {
            id: "home-005",
            name: "Brass Pooja Thali",
            price: 2500,
            originalPrice: 3500,
            image: "brass-thali.jpg",
            description:
              "Traditional brass pooja thali with intricate engravings",
            colors: ["#FFD700"],
            inStock: true,
            rating: 4.7,
            dimensions: "30cm diameter",
            material: "Brass",
          },
          {
            id: "home-006",
            name: "Terracotta Diya Set",
            price: 600,
            originalPrice: 900,
            image: "terracotta-diya.jpg",
            description: "Set of 12 handmade terracotta diyas for festivals",
            colors: ["#8B4513"],
            inStock: true,
            rating: 4.3,
            material: "Terracotta",
          },
        ],
      },
      {
        name: "Curtains & drapes",
        subCategoriesImage: "sheer-curtains.jpg",
        products: [
          {
            id: "home-007",
            name: "Sheer Window Curtains",
            price: 3500,
            originalPrice: 5000,
            image: "sheer-curtains.jpg",
            description: "Elegant sheer curtains with embroidered borders",
            colors: ["#FFFFFF", "#F5DEB3", "#F0FFFF"],
            inStock: true,
            rating: 4.6,
            dimensions: "90x108 inches",
            material: "Voile",
          },
          {
            id: "home-008",
            name: "Traditional Block Print Drapes",
            price: 4200,
            originalPrice: 6000,
            image: "blockprint-drapes.jpg",
            description:
              "Handblock printed cotton drapes with traditional patterns",
            colors: ["#1DD1A1", "#FEA47F", "#EAB543"],
            inStock: true,
            rating: 4.7,
            dimensions: "90x108 inches",
            material: "Cotton",
          },
        ],
      },
      {
        name: "Rugs & Carpets",
        subCategoriesImage: "wool-rug.jpg",
        products: [
          {
            id: "home-009",
            name: "Handwoven Wool Rug",
            price: 8500,
            originalPrice: 12000,
            image: "wool-rug.jpg",
            description:
              "Traditional handwoven wool rug with geometric patterns",
            colors: ["#8B4513", "#000000", "#FFD700", "#DC143C"],
            inStock: true,
            rating: 4.8,
            dimensions: "4x6 feet",
            material: "Wool",
          },
          {
            id: "home-010",
            name: "Dhurrie Cotton Rug",
            price: 5500,
            originalPrice: 8000,
            image: "dhurrie-rug.jpg",
            description: "Lightweight cotton dhurrie with traditional motifs",
            colors: ["#FF6B6B", "#48DBFB", "#1DD1A1"],
            inStock: true,
            rating: 4.5,
            dimensions: "3x5 feet",
            material: "Cotton",
          },
        ],
      },
    ],
  },
];

export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Traditional Peacock Kalamkari Saree",
    price: 4500,
    originalPrice: 6000,
    image: kalamkariHero,
    category: "Sarees",
    subCategory: "Silk Sarees",
    description:
      "Hand-painted kalamkari saree featuring intricate peacock designs with natural dyes",
    colors: ["#1e3a8a", "#dc2626", "#ca8a04", "#065f46"],
    inStock: true,
  },
  {
    id: "2",
    name: "Floral Kalamkari Cotton Dupatta",
    price: 1200,
    originalPrice: 1500,
    image: kalamkariProducts,
    category: "Dupattas",
    subCategory: "Cotton Dupattas",
    description:
      "Elegant cotton dupatta with hand-painted floral motifs in traditional kalamkari style",
    colors: ["#7c2d12", "#ca8a04", "#065f46"],
    inStock: true,
  },
  {
    id: "3",
    name: "Tree of Life Kalamkari Wall Art",
    price: 2800,
    image: kalamkariHero,
    category: "Home Decor",
    subCategory: "Wall Hangings",
    description:
      "Beautiful tree of life design on cotton fabric, perfect for wall decoration",
    colors: ["#1e3a8a", "#7c2d12", "#ca8a04"],
    inStock: true,
  },
  {
    id: "4",
    name: "Mythological Kalamkari Fabric",
    price: 800,
    originalPrice: 1000,
    image: kalamkariProducts,
    category: "Fabrics",
    subCategory: "Cotton Fabrics",
    description:
      "Premium cotton fabric with mythological scenes painted in traditional kalamkari technique",
    colors: ["#dc2626", "#ca8a04", "#065f46"],
    inStock: true,
  },
  {
    id: "5",
    name: "Elephant Motif Kalamkari Bedsheet",
    price: 2200,
    originalPrice: 2800,
    image: kalamkariHero,
    category: "Home Decor",
    subCategory: "Bedsheets",
    description:
      "King size bedsheet with elephant motifs painted in authentic kalamkari style",
    colors: ["#7c2d12", "#ca8a04", "#1e3a8a"],
    inStock: true,
  },
  {
    id: "6",
    name: "Handwoven Cotton Saree with Temple Border",
    price: 3500,
    originalPrice: 4200,
    image: kalamkariProducts,
    category: "Sarees",
    subCategory: "Cotton Sarees",
    description:
      "Lightweight handwoven cotton saree with a traditional temple border design",
    colors: ["#065f46", "#1e3a8a"],
    inStock: true,
  },
];

export const categories = [...new Set(sampleProducts.map((p) => p.category))];

export const mainCategories = fashionProducts.map((item) => item.category);

export const colors = [...new Set(sampleProducts.flatMap((p) => p.colors))];
export const maxPrice = Math.max(
  ...sampleProducts.map((p) => p.originalPrice || p.price)
);
