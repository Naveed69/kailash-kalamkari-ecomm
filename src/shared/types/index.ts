export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  categoryName?: string;
  subCategory?: string;
  description: string;
  colors: string[];
  selectedColor?: string;
  inStock: boolean;
  rating?: number;
  dimensions?: string;
  material?: string;
  quantity: number;
  barcode?: string;
  isVisible?: boolean;
  specifications?: Record<string, string>;
}

export interface SubCategory {
  id: string;
  name: string;
  subCategoriesImage?: string | null;
  image_url?: string | null; // For backend compatibility
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  category: string;
  image: string;
  subCategories: SubCategory[];
}
