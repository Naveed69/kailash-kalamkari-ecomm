import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const addToWishlist = (product: Product) => {
    // Wishlist requires login - it's a saved list
    if (!user) {
      toast({
        title: '❤️ Sign in to save favorites',
        description: 'Create an account to save your favorite items! Visit the login page to get started.',
        duration: 5000,
      });
      return;
    }

    setWishlist((prev) => {
      // Check if product is already in wishlist
      if (prev.some((item) => item.id === product.id)) {
        toast({
          title: 'Already in favorites',
          description: `${product.name} is already in your favorites.`,
        });
        return prev;
      }
      
      toast({
        title: '❤️ Added to favorites',
        description: `${product.name} has been saved to your favorites.`,
      });
      
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: 'Removed from favorites',
      description: 'Item has been removed from your favorites.',
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

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
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
