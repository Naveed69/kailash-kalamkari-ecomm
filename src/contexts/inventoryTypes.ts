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
  quantity: number;
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
