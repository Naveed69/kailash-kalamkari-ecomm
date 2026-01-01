import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/storefront/components/ProductCard';
import { useWishlist } from '@/shared/contexts/WishlistContext';
import { useCart } from '@/shared/contexts/CartContext';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you love by clicking the heart icon on any product
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={() => removeFromWishlist(product.id)}
                  isWishlisted={true}
                  isInCart={isInCart(product.id)}
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                  aria-label="Remove from wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-500"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
