import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react"
import type { Category, SubCategory, Product } from "@/shared/types"
import {
  getCategories,
  getSubCategories,
} from "@/backend/categories"
import {
  getProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "@/backend/products"

// Updated Context Type
interface InventoryContextType {
  categories: Category[]
  products: Product[] // Added flat products list
  loading: boolean
  error: string | null
  // Operations
  fetchData: () => Promise<void>
  updateProduct: (
    productId: string,
    updatedProduct: Partial<Product>
  ) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  addProduct: (product: any) => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
)

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data from server
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catsResult, subCatsResult, prodsResult] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getProducts(),
      ])

      console.log("📦 Inventory Data Fetched:", {
        categories: catsResult.data?.length,
        subCategories: subCatsResult.data?.length,
        products: prodsResult.data?.length,
      })

      if (catsResult.error) throw new Error(catsResult.error.message)
      if (subCatsResult.error) throw new Error(subCatsResult.error.message)
      if (prodsResult.error) throw new Error(prodsResult.error.message)

      const rawCats = catsResult.data || []
      const rawSubCats = subCatsResult.data || []
      const rawProds = (prodsResult.data || []) as any[]

      const categoryMap = new Map(
        rawCats.map((cat: any) => [String(cat.id), cat.name])
      )

      // Transform products to match Product interface
      const transformedProds: Product[] = rawProds.map((p: any) => ({
        id: String(p.id),
        name: p.name || "",
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price || 0,
        originalPrice: p.original_price
          ? typeof p.original_price === "string"
            ? parseFloat(p.original_price)
            : p.original_price
          : undefined,
        image: p.image || "",
        category: p.category_id ? String(p.category_id) : undefined,
        categoryName: p.category_id
          ? categoryMap.get(String(p.category_id))
          : undefined, // Add this
        subCategory: p.sub_category_id ? String(p.sub_category_id) : undefined,
        description: p.description || "",
        colors: Array.isArray(p.colors)
          ? p.colors
          : typeof p.colors === "string"
          ? p.colors.startsWith("[")
            ? JSON.parse(p.colors)
            : [p.colors]
          : [],
        inStock:
          typeof p.in_stock === "string"
            ? p.in_stock === "true" || p.in_stock === "1"
            : Boolean(p.in_stock),
        rating: p.rating,
        dimensions: p.dimensions,
        material: p.material,
        quantity: p.stock_quantity || p.quantity || 0,
        barcode: p.barcode,
        isVisible: p.is_visible,
        specifications: p.specifications || {},
      }))

      setProducts(transformedProds)
      console.log("✅ Products State Updated:", transformedProds.length)

      // Build nested structure for backward compatibility / specific UI needs
      const nestedCategories: Category[] = rawCats.map((cat: any) => {
        const catSubCats = rawSubCats.filter(
          (sc: any) => sc.category_id === cat.id
        )

        const mappedSubCats: SubCategory[] = catSubCats.map((sc: any) => {
          // Products in this subcategory
          const scProds = transformedProds.filter(
            (p: any) => p.subCategory === String(sc.id)
          )

          return {
            id: sc.id.toString(),
            name: sc.name, // adminApi maps subCatName to name
            subCategoriesImage: sc.image_url ?? "",
            products: scProds,
          }
        })

        return {
          id: cat.id.toString(),
          name: cat.name,
          category: cat.name, // Redundant but matches type
          image: "", // Placeholder
          subCategories: mappedSubCats,
        }
      })

      setCategories(nestedCategories)
    } catch (err) {
      console.error("Error fetching inventory:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch inventory")
    } finally {
      setLoading(false)
    }
  }

  // Update product
  const updateProduct = async (
    productId: string,
    updatedProduct: Partial<Product>
  ) => {
    setLoading(true)
    try {
      const { error } = await apiUpdateProduct(productId, updatedProduct)
      if (error) throw new Error(error.message)
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  const deleteProduct = async (productId: string) => {
    setLoading(true)
    try {
      const { error } = await apiDeleteProduct(productId)
      if (error) throw new Error(error.message)
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Add product
  const addProduct = async (productData: any) => {
    setLoading(true)
    try {
      const { error } = await apiCreateProduct(productData)
      if (error) throw new Error(error.message)
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchData().catch((err) => {
      console.error("Failed to load inventory:", err)
      // Don't throw - just log the error to prevent white screen
    })
  }, [])

  return (
    <InventoryContext.Provider
      value={{
        categories,
        products,
        loading,
        error,
        fetchData,
        updateProduct,
        deleteProduct,
        addProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
