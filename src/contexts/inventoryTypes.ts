// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  colors: string[];
  inStock: boolean;
  rating: number;
  category: string;
  categoryName?: string; // Add category name for display purposes
  quantity: number;
  material?: string;
  barcode?: string; // Product barcode for scanning
  isVisible?: boolean; // Visibility status of the product
  specifications?: Record<string, string>; // Dynamic product specifications
}

export interface SubCategory {
  id: string;
  name: string;
  subCategoriesImage: string;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  category: string;
  image: string;
  subCategories: SubCategory[];
}
