import { fashionProducts } from "@/data/products";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Types
interface Product {
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

interface SubCategory {
  id: string;
  name: string;
  subCategoriesImage: string;
  products: Product[];
}

interface Category {
  id: string;
  name: string;
  category: string;
  image: string;
  subCategories: SubCategory[];
}

// Updated Context Type with loading states
interface InventoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  // Operations with server sync
  fetchCategories: () => Promise<void>;
  updateProduct: (productId: string, updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addProduct: (
    categoryId: string,
    subCategoryId: string,
    product: Product
  ) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

// API Service Functions (Replace with your actual API calls)
const inventoryAPI = {
  fetchCategories: async (): Promise<Category[]> => {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  updateProduct: async (
    productId: string,
    productData: Partial<Product>
  ): Promise<Product> => {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Failed to update product");
    return response.json();
  },

  deleteProduct: async (productId: string): Promise<void> => {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete product");
  },

  addProduct: async (
    productData: Omit<Product, "id"> & {
      categoryId: string;
      subCategoryId: string;
    }
  ): Promise<Product> => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Failed to add product");
    return response.json();
  },
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories from server
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryAPI.fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update product - optimistic update with rollback
  const updateProduct = async (productId: string, updatedProduct: Product) => {
    setLoading(true);
    setError(null);

    // Optimistic update
    const previousCategories = [...categories];
    try {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          subCategories: category.subCategories.map((subCategory) => ({
            ...subCategory,
            products: subCategory.products.map((product) =>
              product.id === productId
                ? { ...product, ...updatedProduct }
                : product
            ),
          })),
        }))
      );

      // Server update
      await inventoryAPI.updateProduct(productId, updatedProduct);

      // Refetch to ensure sync
      await fetchCategories();
    } catch (err) {
      // Rollback on error
      setCategories(previousCategories);
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err; // Re-throw so component can handle
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    setLoading(true);
    setError(null);

    const previousCategories = [...categories];
    try {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          subCategories: category.subCategories.map((subCategory) => ({
            ...subCategory,
            products: subCategory.products.filter(
              (product) => product.id !== productId
            ),
          })),
        }))
      );

      await inventoryAPI.deleteProduct(productId);
      await fetchCategories(); // Refetch to ensure sync
    } catch (err) {
      setCategories(previousCategories);
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add product
  const addProduct = async (
    categoryId: string,
    subCategoryId: string,
    product: Product
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newProduct = await inventoryAPI.addProduct({
        ...product,
        categoryId,
        subCategoryId,
      });

      // Update local state with the product from server (includes generated ID)
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                subCategories: category.subCategories.map((subCategory) =>
                  subCategory.id === subCategoryId
                    ? {
                        ...subCategory,
                        products: [...subCategory.products, newProduct],
                      }
                    : subCategory
                ),
              }
            : category
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        updateProduct,
        deleteProduct,
        addProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
