import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { Product } from "@/components/ProductCard"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useAuth } from "@/lib/AuthContext"
import { wishlistApi } from "@/lib/wishlistApi"
import { useInventory } from "@/contexts/InventoryContext"

interface WishlistContextType {
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
)

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage if available
  const initializer = (): Product[] => {
    try {
      const storedWishlist = localStorage.getItem("wishlist")
      return storedWishlist ? JSON.parse(storedWishlist) : []
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error)
      return []
    }
  }

  const [wishlist, setWishlist] = useState<Product[]>(initializer)
  const { toast } = useToast()
  const { user } = useAuth()
  const { products } = useInventory() // Get full product list to map IDs

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  // Sync with Database when user logs in
  useEffect(() => {
    const syncWishlist = async () => {
      if (!user) return

      try {
        // 1. Get user's wishlist from DB
        const dbProductIds = await wishlistApi.getUserWishlist(user.id)

        // 2. Identify local items that need to be synced to DB
        const localProductIds = wishlist.map((p) => p.id)
        const itemsToSync = localProductIds.filter(
          (id) => !dbProductIds.includes(id)
        )

        // 3. Sync local items to DB
        if (itemsToSync.length > 0) {
          await Promise.all(
            itemsToSync.map((id) => wishlistApi.addToWishlist(user.id, id))
          )
        }

        // 4. Merge DB and Local (DB is source of truth + what we just synced)
        const allWishlistIds = Array.from(
          new Set([...dbProductIds, ...localProductIds])
        )

        // 5. Map IDs back to full product objects
        // Improved logic: first try to map using products from InventoryContext
        // If products aren't available or don't contain all items, keep existing items
        // and only add missing items that we can find in the database
        let mergedWishlist = [...wishlist] // Start with local items

        // Try to find missing items from database in the current product list
        const missingProductIds = allWishlistIds.filter(
          (id) => !wishlist.some((item) => item.id === id)
        )

        if (missingProductIds.length > 0 && products.length > 0) {
          // If we have products and there are missing items, try to map them
          const missingItems = products.filter((p) =>
            missingProductIds.includes(p.id)
          )
          mergedWishlist = [...mergedWishlist, ...missingItems]
        }

        // Ensure we don't lose items that aren't in the current product list
        // But only keep items that are still valid (exist in the database or local storage)
        const validWishlist = mergedWishlist.filter((item) =>
          allWishlistIds.includes(item.id)
        )

        setWishlist(validWishlist)
      } catch (error) {
        console.error("Failed to sync wishlist:", error)
      }
    }

    // Only run sync when user is available, not on every products change
    if (user) {
      syncWishlist()
    }
  }, [user]) // Run when user changes

  const addToWishlist = async (product: Product) => {
    // Wishlist requires login - it's a saved list
    if (!user) {
      toast({
        title: "❤️ Sign in to save favorites",
        description:
          "Create an account to save your favorite items across devices!",
        duration: 6000,
        action: (
          <ToastAction
            altText="Sign In"
            onClick={() => {
              // Navigate to login with return URL
              window.location.href = `/login?returnTo=${encodeURIComponent(
                window.location.pathname
              )}`
            }}
          >
            Sign In
          </ToastAction>
        ),
      })
      return
    }

    // Optimistic update
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        toast({
          title: "Already in favorites",
          description: `${product.name} is already in your favorites.`,
        })
        return prev
      }
      return [...prev, product]
    })

    toast({
      title: "❤️ Added to favorites",
      description: `${product.name} has been saved to your favorites.`,
    })

    // Save to DB
    try {
      await wishlistApi.addToWishlist(user.id, product.id)
    } catch (error) {
      console.error("Failed to save to wishlist DB:", error)
      // Optionally revert state if failed, but for now keep optimistic
    }
  }

  const removeFromWishlist = async (productId: string) => {
    // Optimistic update
    setWishlist((prev) => prev.filter((item) => item.id !== productId))

    toast({
      title: "Removed from favorites",
      description: "Item has been removed from your favorites.",
    })

    if (user) {
      try {
        await wishlistApi.removeFromWishlist(user.id, productId)
      } catch (error) {
        console.error("Failed to remove from wishlist DB:", error)
      }
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
