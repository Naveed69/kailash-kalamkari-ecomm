import { useState } from "react";
import { SubcategoryList } from "@/components/categoryList";
import { sampleProducts } from "@/data/products"; // your file
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard, Product } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useToast } from '@/components/ui/use-toast';

export const ProductPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Sarees"); // default category
  const [activeSub, setActiveSub] = useState<string>("");

    const { cart, addToCart, isInCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
// Handle cart and wishlist actions
const handleAddToCart = (product: Product) => {
  addToCart(product);
};
  // Get subcategories based on selected category
  const subcategories = [
    ...new Set(
      sampleProducts
        .filter((p) => p.category === activeCategory)
        .map((p) => p.subCategory)
    ),
  ];

  // Filter products based on category + subcategory
  const filteredProducts = sampleProducts.filter(
    (p) =>
      p.category === activeCategory &&
      (activeSub ? p.subCategory === activeSub : true)
  );

  const handleToggleWishlist = (productId: string) => {
      const product = sampleProducts.find((p) => p.id === productId);
      
      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        toast({
          title: "Removed from wishlist",
          description: `${product?.name} removed from your wishlist.`,
        });
      } else if (product) {
        addToWishlist(product);
        toast({
          title: "Added to wishlist",
          description: `${product.name} added to your wishlist.`,
        });
      }
    };

  return (
    <div className="p-6">
      {/* Category heading */}
      <h2 className="text-2xl font-bold mb-4">{activeCategory}</h2>

      {/* Subcategories */}
      <SubcategoryList
        subcategories={subcategories}
        activeSubcategory={activeSub}
        onSelect={setActiveSub}
      />

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product: Product) => (
           <ProductCard
           key={product.id}
           product={product}
           onAddToCart={handleAddToCart}
           onToggleWishlist={() => handleToggleWishlist(product.id)}
           isWishlisted={isInWishlist(product.id)}
           isInCart={isInCart(product.id)}
         />
        ))}
      </div>
    </div>
  );
};
