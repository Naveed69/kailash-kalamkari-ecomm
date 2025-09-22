import { useState } from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { SubcategoryList } from "@/components/categoryList";
import { sampleProducts } from "@/data/products"; // your file

export const ProductPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Sarees"); // default category
  const [activeSub, setActiveSub] = useState<string>("");

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
            onAddToCart={(p) => console.log("Add to cart:", p)}
            onToggleWishlist={(id) => console.log("Wishlist toggle:", id)}
            isWishlisted={false}
          />
        ))}
      </div>
    </div>
  );
};
