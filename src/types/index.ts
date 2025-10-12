import { Product } from "@/components/ProductCard";

export interface FashionProductCategory {
  id?: string; // Made optional
  name?: string; // Made optional
  category: string;
  image?: string; // Made optional
  subCategories: Array<{
    id: string;
    name: string;
    subCategoriesImage: string;
    products: Product[];
  }>;
}
